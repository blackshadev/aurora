import assert = require('assert');
import { Hue } from "../Hue";

describe("Aurora Hue API", () => {
    let hue: Hue;
         
    before(() => {
        hue = new Hue("192.168.2.41");
    });

    it("Connect", (d) => {
        hue.once("connect", () => {
            assert.ok((<any>hue).userId);
            d();
        });
        hue.connect();
    });

    it("InvalidSession", (d) => {
        let _hue: Hue = new Hue("192.168.2.41", "_invalid");
        (<any>_hue).userId = "000";
        _hue.getLights((err, dat) => {
            assert.ok(err.hueType === 1);
            d();
        });
    });

    it("GetLights", (d) => {
        let l = hue.getLights((err, dat) => {
            d()
        });
        

    });
});
