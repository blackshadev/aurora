import http = require("http");
import events = require("events");
import fs = require("fs");
import { Light, Lights } from "./Lights";

export enum HttpVerb {
    GET,
    POST,
    PUT,
    DELETE
}


export interface IError {
    msg: string;
    type?: string;
}

export interface IHueError extends IError {
    hueType: number;
    hueAddress: string;
}

export class Hue extends events.EventEmitter {
    protected name: string;
    protected ip: string;
    protected userId: string;
    protected lights: Lights;

    constructor(ip: string, name?: string) {
        super();
        this.ip = ip;
        this.name = name || "_hue";
        if(fs.existsSync(this.name + ".uid"))
            this.userId = fs.readFileSync(this.name + ".uid", "utf8");
    }

    connect(): void {
        if (this.userId) {
            this.emit("connect", { userId: this.userId });
            return;
        }
        this.raw_request(HttpVerb.POST, "/api", { devicetype: "aurora" }, (err, dat) => {
            if (err) {
                this.emit("error", err);
            } else if (dat[0] && dat[0].error && dat[0].error.type === 101) {
                this.emit("waiting", { msg: "Please press the connect button on the philips hue" });
                console.log("Please press the connect button on the philips hue.\nAurora wil retry to connect in 5 seconds");
                setTimeout(() => this.connect(), 5000);
            } else if (dat[0] && dat[0].success && dat[0].success.username) {
                this.userId = dat[0].success.username;
                fs.writeFile(this.name + ".uid", this.userId);
                this.emit("connect", { userId: this.userId });
            } else {
                this.emit("error", "An unexpected error occurred", dat);
            }


        });
    }

    getLights(cb: (Error, lights?: Lights) => void) {
        this.request(HttpVerb.GET, "lights", undefined, (err, dat) => {
            if (err) { cb(err); return; }
            this.lights = Lights.Create(<any>dat)
            cb(err, this.lights);
        });

        
    }

    protected request(method: HttpVerb, path: string, data: Object, cb: (err?: IError | IHueError, data?: Object) => void) {
        this.raw_request(method, `/api/${this.userId}/${path}`, data, (err: IError, dat) => {
            
            if (err) { cb(err); }
            else if (dat[0] && dat[0].error) {
                cb({
                    type: "HUE",
                    msg: dat[0].error.description,
                    hueType: dat[0].error.type,
                    hueAddress: dat[0].error.address
                });
            } else {
                cb(err, dat);
            }

        });
    }

    private raw_request(method: HttpVerb, path: string, data: Object, cb: (err?: IError, data?: Object) => void) {
        const raw_data = data ? new Buffer(JSON.stringify(data)) : undefined;
        const req = http.request({
            host: this.ip,
            method: HttpVerb[method],
            path: path,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": raw_data ? raw_data.length : 0
            }
        }, (res: http.IncomingMessage) => {
            let result = "";
            res.on("data", (d) => { result += d; });
            res.on("end", () => {
                const oRes = JSON.parse(result);
                cb(null, oRes);
            });
            
        });
        req.on("error", (err: Error) => {
            cb({ msg: err.message, type: "REQUEST" }, undefined);
        });

        if(raw_data) req.write(raw_data);
        req.end();
    }

}