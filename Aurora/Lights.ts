import { List , extend } from "./Collections";
import { Hue } from "./Hue";
import { HttpVerb, IError, IHueError, IEventEmitter, EventListener } from "./common";
import { EventEmitter } from "events";

interface IHueLights {
    [id: string]: IHueLight
}

interface IHueLight {
    state: IHueState;
    type: string;
    name: string;
    modelid: string;
    swversion: string;
    uniqueid: string;
}

interface IHueState {
    on?: boolean;
    // 1 to 254. 0 is off
    bri?: number;
    // 0 to 65535
    hue?: number;
    // 0 to 254
    sat?: number;
    // x,y are floats from 0 to 1
    xy?: [number, number];
    // Given in Mired https://en.wikipedia.org/wiki/Mired 
    ct?: number;
    colormode?: string;
    reachable?: boolean;
}

//Used in setting a new state
interface IHueNewState extends IHueState {
    alert?: string;
    effect?: string;
    transitiontime?: number;
    bri_inc?: number;
    sat_inc?: number;
    hue_inc?: number;
    ct_inc?: number;
    xy_inc?: [number, number];

}

export enum ColorMode {
    hs,
    xy,
    ct
}

export class LightState implements IHueState {
    protected light: Light;

    on: boolean;
    reachable: boolean;
    bri: number;
    hue: number;
    sat: number;
    xy: [number, number];
    ct: number;
    mode: ColorMode;
    get colormode(): string { return ColorMode[this.mode]; }
    set colormode(val: string) {
        let m = ColorMode[val];
        if (m === undefined) throw new Error(`No such color mode named \`${val}\``);
        this.mode = m;
    }
    

    constructor(l: Light) {
        this.light = l;
    }

    load(state: IHueState) {
        let changes = [];
        for (let k in state) {
            if (LightState.keys.has(k)) {
                changes.push({ key: k, oldValue: this[k], newValue: state[k] });
                this[k] = state[k];
            }
        }
        this.light.emit("statechanged", this.light, changes);
    }

    static keys: Set<string> = (() => {
        let s = new Set<string>();
        s.add("on"); s.add("bri"); s.add("hue"); s.add("sat");
        s.add("xy"); s.add("ct"); s.add("colormode");
        return s;
    })();


    // Used a XY transformation matric from the Philips MyHue  source code
    static xy2rgb(state: IHueState) : [number, number, number]{
        const [x, y] = state.xy;
        const z = 1. - x - y;
        const Y = state.bri / 255.;
        const X = (Y / y) * x;
        const Z = (Y / y) * z;

        let r =  X * 3.2406 - Y * 1.5372 - Z * 0.4986;
        let g = -X * 0.9689 + Y * 1.8758 + Z * 0.0415;
        let b =  X * 0.0557 - Y * 0.204 + Z * 1.057;

        // Gamma correction
        r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
        g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
        b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
        
        
        // Correct values if one is greater than 1
        let maxValue = Math.max(r, g, b)
        if(maxValue > 1)
            r /= maxValue
        g /= maxValue
        b /= maxValue

        // no negatives allowed
        r = r > 0 ? r : 0;
        g = g > 0 ? g : 0;
        b = b > 0 ? b : 0;

        return [r * 255, g * 255, b * 255]
    }

    // http://www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/
    static ct2rgb(state: IHueState) {
        // ct is in MIRED https://en.wikipedia.org/wiki/Mired
        // M = 1000000 / T
        let ct = 1000000. / state.ct;
        let temp = ct / 100.;

        let r, g, b;
        if (temp > 66) {
            r = temp - 60
            r = 329.698727446 * (r ** -0.1332047592)
            
            g = temp - 60
            g = 288.1221695283 * (g ** -0.0755148492)
        } else {
            r = 255

            g = temp
            g = 99.4708025861 * Math.log(g) - 161.1195681661
        }
        if (temp >= 66) {
            b = 255
        } else if (temp <= 19) {
            b = 0;
        } else {
            b = temp - 10
            b = 138.5177312231 * Math.log(b) - 305.0447927307
        }

        const minmax = (num: number) => {
            return num < 0 ? 0 : num > 255 ? 255 : num;
        };

        return [minmax(r), minmax(g), minmax(b)];
    }

    static hs2rgb(state: IHueState): [number, number, number] {
        // Fit the hue to a scale from 0. to 360. 
        const H = state.hue / 65535. * 360.;
        const C = state.bri / 255. * state.sat / 255.;
        const X = C * (1 - Math.abs(((H / 60) % 2.) - 1.));

        function _rgb(H, C, X): [number, number, number] {
            
            if(0 <= H && H < 60)
                return [C, X, 0]
            if(60 <= H && H < 120)
                return [X, C, 0]
            if(120 <= H && H < 180)
                return [0, C, X]
            if(180 <= H && H < 240)
                return [0, X, C]
            if(240 <= H && H < 300)
                return [X, 0, C]
            if(300 <= H && H < 360)
                return [C, 0, X]
        }

        let [R, G, B] = _rgb(H, C, X)
        let m = state.bri / 255. - C

        //let res = (R + m, G + m, B + m)
        return [(R + m) * 255, (G + m) * 255, (B + m) * 255];
    }
}


export class Lights extends List<Light> implements IEventEmitter {
    events: EventEmitter;

    constructor() {
        super();
        this.events = new EventEmitter();
    }

    static Create(hue: Hue, lights: IHueLights): Lights {
        var list = new Lights();
        for (var k in lights) {
            list.add(new Light(hue, parseInt(k), lights[k]));
        }

        return list;
    }

    protected stateEventListener: EventListener = (src: Light, ...args) => { this.emit("statechanged", src, ...args); };
    protected nameEventListener : EventListener = (src: Light, ...args) => { this.emit("namechanged", src, ...args); };


    add(item: Light): number {
        item.on("statechanged", this.stateEventListener);
        item.on("namechanged", this.nameEventListener);

        return super.add(item);
    }

    remove(item: Light): number {
        item.off("statechanged", this.stateEventListener);
        item.off("namechanged", this.nameEventListener);

        return super.remove(item);
    }


    on(evt: string, fn: EventListener) {
        this.events.addListener(evt, fn);
    }
    off(evt: string, fn: EventListener) { this.events.removeListener(evt, fn); }
    emit(evt: string, source: Object, ...args) {
        this.events.emit(evt, source, ...args);
    }
}

/**
 * Represents a hue light and interacts with it
 * @event statechanged State element of the light has changed, event argument contains an array of the changes object with a key, oldValue and newValue property
 * @event namechanged Name of the light has been changed, event argument contains an object with a oldValue and newValue property
 */
export class Light implements IEventEmitter {
    protected events: EventEmitter;
    id: number;
    uniqueid: string;
    state: LightState;
    type: string;

    protected _name: string;
    set name(val: string) {
        if (this._name !== val) {
            let old = this._name;
            this._name = val;
            this.events.emit("namechanged", this, { oldValue: old, newValue: val });
        }
    };
    get name(): string { return this._name; };

    hue: Hue;



    constructor(hue: Hue, id: number, data: IHueLight) {
        this.events = new EventEmitter();

        this.state = new LightState(this);
        this.hue = hue;
        this.id = id;

        this._name = data.name;
        this.uniqueid = data.uniqueid;
        this.type = data.type;

        this.setData(data); 
    }

    protected setData(data: IHueLight) {
        this.name = data.name;
        this.state.load(data.state);
    }


    refresh(cb?: (err: IError, data: this) => void): void {
        cb = cb || (() => { });

        this.hue.request(HttpVerb.GET, `lights/${this.id}`, undefined, (err, data) => {
            if (!err) this.setData(<IHueLight>data);
            cb(err, this);
        });
    }


    setState(state: IHueNewState, cb?: (err: IError, data: this) => void) {
        cb = cb || (() => { });
        this.hue.request(HttpVerb.PUT, `lights/${this.id}/state`, state, (err, data) => {
            if (!err) this.state.load(state);
            cb(err, this);
        });
    }

    on(evt: string, fn: EventListener) { this.events.addListener(evt, fn); }
    off(evt: string, fn: EventListener) { this.events.removeListener(evt, fn); }
    emit(evt: string, source: Object, ...args) { this.events.emit(evt, source, ...args); }
    
}