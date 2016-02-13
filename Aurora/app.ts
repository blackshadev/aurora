import { Hue } from "./Hue";
var hue: Hue = new Hue("192.168.2.41");
hue.on("connect", () => {
    hue.getLights((err, dat) => {
        console.log(err, dat);
    });
});
hue.connect();