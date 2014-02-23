function ColorPickers(el, lights, groups) {
    this.jControl = el;
    this.lights = lights;
    this.groups = groups;
    this.light = null;

    this.pickers = {
        "xy": { button: null, picker: null, jControl: null}
        //"hsl": {button: null, picker: null, jControl: null}
    };

    this.jPicker = $("<div/>").appendTo(this.jControl);

    this.makeButtons();

    //this.createHslPicker();
    this.createXYPicker();

    this.setPicker("xy");
}
ColorPickers.prototype.makeButtons = function() {
    return; // don't need no buttons!
    var group = $("<div/>", { "class": "btn-group"});
    var but = $("<button/>", {"type":"button", "class": "btn btn-default"});

    var self = this;
    //this.pickers.hsl.button = but.clone().text("HSL").click(function() { self.setPicker("hsl"); });
    //this.pickers.xy.button = but.clone().text("XY").click(function() { self.setPicker("xy"); });

    // hsl needs fixing
    //group.append(this.pickers.hsl.button);
    //group.append(this.pickers.xy.button);

    this.jControl.prepend(group);
};
ColorPickers.prototype.setPicker = function(str) {
    this.kind = str;
    
    var obj = this.pickers[str];
    if(!obj) return;

    /* remove all acive classes */
    // for(var key in this.pickers)
    //     this.pickers[key].button.removeClass("active");

    // obj.button.addClass("active");

    this.jPicker.empty();
    this.jPicker.append(obj.jControl);

    if(str === "xy") {
        obj.jControl.width = obj.jControl.width;
        obj.picker.draw();
    } 
};
ColorPickers.prototype.createHslPicker = function() {
    var picker = $("<div/>");
    var self = this;
    picker.hslCircleColorPicker({
      onEndChange: function(color) {
        var inp = color.inputColor;
        var hsl = [inp[0], inp[1] / 100, inp[2] / 100];

        if(self.light)
            lights.setColor(self.light[0], hsl, "hsl");
      }
    });
    this.pickers.hsl.picker = picker;
    this.pickers.hsl.jControl = picker;

};
ColorPickers.prototype.setLight = function(light) {
    this.light = light;
    var selected = this.pickers.xy.picker.selected;
    var xy = [selected[0], selected[1]];
    var bri = selected[2];

    if(light !== undefined) {
        var hex = this.light[1].state.rgb;
        var res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        var rgb = 'rgb(' + parseInt(res[1], 16) + ',' + parseInt(res[2], 16) +
                    ',' + parseInt(res[3], 16) + ')';
        //this.pickers.hsl.picker.hslCircleColorPicker({color: rgb });

        xy = light[1].state.xy;
        bri = light[1].state.bri / 255;
    }

    this.pickers.xy.picker.selected = [xy[0], xy[1], bri];
    this.pickers.xy.picker.draw();
};
ColorPickers.prototype.createXYPicker = function() {
    var self = this;

    var picker = $("<canvas/>");
    picker[0].width = 250;
    picker[0].height = 250;

    this.pickers.xy.picker = new XYPicker(picker[0]);
    this.pickers.xy.jControl = picker;
    this.pickers.xy.picker.onClick = function(xy, ev) {
        var offset = $(this.canvas).offset();
        xy[0] = ev.pageX - offset.left;
        xy[1] = ev.pageY - offset.top;
        
        console.log(xy);

    };
    this.pickers.xy.picker.onSelect = function(xybri) {
        bri = Math.round(xybri[2] * 255);

        if(self.light)
            lights.setColor(self.light[0], [xybri[0], xybri[1], bri], "xy");
        else
            groups.setColor(0, [xybri[0], xybri[1], bri]);
    };
    this.pickers.xy.picker.start();

};