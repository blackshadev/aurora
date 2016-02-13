import { Hue } from "./Hue";
import { Light } from "./Lights";

var hue: Hue = new Hue("192.168.2.41");
hue.on("connect", () => {
    hue.getLights((err, dat) => {
        dat.forEach((item: Light) => {
            console.log(item);
        });
        dat.itemsArray[0].setState({ on: true }, (err, dat) => {
            console.log(dat.state);
        });
    });
});
hue.connect();