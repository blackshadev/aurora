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
    bri?: number;
    hue?: number;
    sat?: number;
    xy?: [number, number];
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
    reachable: boolean;

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