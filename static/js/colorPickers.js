/*global $aur, XYPicker */
(function($aur) {

    $aur.ColorPickers = $aur.Object.extend({
        lights: null,
        groups: null,
        light: null,
        jControl: null,
        pickers: null,
        jPicker: null,
        create: function(el, lights, groups) {
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
        },


        makeButtons: function() {
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
        },
        setPicker: function(str) {
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
        },
        setLight: function(light) {
            this.light = light;
            var selected = this.pickers.xy.picker.selected;
            var xy = [selected[0], selected[1]];
            var bri = selected[2];

            if(light !== undefined) {
                xy = light[1].state.xy;
                bri = light[1].state.bri / 255;
            }

            this.pickers.xy.picker.selected = [xy[0], xy[1], bri];
            this.pickers.xy.picker.draw();
        },
        createXYPicker: function() {
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
                
            };
            this.pickers.xy.picker.onSelect = function(xybri) {
                var bri = Math.round(xybri[2] * 255);

                if(self.light)
                    self.lights.setColor(self.light[0], [xybri[0], xybri[1], bri], "xy");
                else
                    self.groups.setColor(0, [xybri[0], xybri[1], bri]);
            };
            this.pickers.xy.picker.start();
        }
    });

})($aur);