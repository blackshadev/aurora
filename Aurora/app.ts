import { Hue } from "./Hue";
import { Light } from "./Lights";

var hue: Hue = new Hue("192.168.2.41");
hue.on("connect", () => {
    hue.getLights((err, dat) => {
        dat.forEach((item: Light) => {
            console.log(item);
        });
        
        hue.lights.on("statechanged", (src: Light, changes: { key: string, oldValue: any, newValue: any }[]) => {
            console.log(`[StateChanged] on ${src.name}\n\t` + changes.map((el) => { return ` [${el.key}] was "${el.oldValue}" is "${el.newValue}" ` }).join("\n\t"));
        });

        var l = dat.itemsArray[0];
        l.setState({ on: true });
    });
});
hue.connect();