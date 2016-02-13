interface IHueLights {
    [id: string]: IHueLight
}

interface IHueLight {
    state: IHueState;
    type: string;
    name: string;
    modelid: string;
    swversion: string;
    pointsymbol: { [point: string]: string }
}

interface IHueState {
    on: boolean;
    bri: number;
    hue: number;
    sat: number;
    xy: [number, number];
    ct: number;
    alert: string;
    effect: string;
    colormode: string;
    reachable: boolean;
}

export class Light {
    id: number;
    state: IHueState;
    name: string;

    constructor(id: number, data: IHueLight) {
        this.id = id;
        this.name = data.name;
        this.state = data.state;
    }

    static Create(lights: IHueLights): Light[] {
        var arr = [];
        for (var k in lights) {
            arr.push(new Light(parseInt(k), lights[k]));
        }

        return arr;
    }
}