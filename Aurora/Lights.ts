import { List , extend } from "./Collections";
import { Hue } from "./Hue";
import { HttpVerb, IError, IHueError } from "./common";
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
    alert?: string;
    effect?: string;
    colormode?: string;
    reachable?: boolean;
}

export class Lights extends List<Light> {
    static Create(hue: Hue, lights: IHueLights): Lights {
        var list = new Lights();
        for (var k in lights) {
            list.add(new Light(hue, parseInt(k), lights[k]));
        }

        return list;
    }
}

export class Light extends EventEmitter {
    id: number;
    uniqueid: string;
    state: IHueState;
    name: string;
    type: string;
    hue: Hue;

    constructor(hue: Hue, id: number, data: IHueLight) {
        super();

        this.hue = hue;
        this.id = id;

        this.setData(data); 
    }

    protected setData(data: IHueLight) {
        this.name = data.name;
        this.state = data.state;
        this.uniqueid = data.uniqueid;
        this.type = data.type;
    }


    refresh(cb: (err: IError, data: this) => void): void {
        this.hue.request(HttpVerb.GET, `lights/${this.id}`, undefined, (err, data) => {
            if (!err) this.setData(<IHueLight>data);
            cb(err, this);
        });
    }

    setState(state: IHueState, cb: (err: IError, data: this) => void) {
        this.hue.request(HttpVerb.PUT, `lights/${this.id}/state`, state, (err, data) => {
            if(!err) extend(this.state, state);
            cb(err, this);
        });
    }
        


}