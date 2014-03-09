/*global $aur, XYPicker */
(function($aur) {

    $aur.ColorPickers = $aur.Object.extend({
        lights: null,
        groups: null,
        light: null,
        jControl: null,
        pickers: null,
        jPicker: null,
        color: null,
        create: function(el) {
            this.jControl = el;

            this.lights = $aur.globals.lights;
            this.groups = $aur.globals.groups;
            this.light = null;

            this.pickers = {
                "xy": null,
                "colors": null

                //"hsl": {button: null, picker: null, jControl: null}
            };

            this.jPicker = $("<div/>", { "class": "picker"});

            this.createXYPicker();
            this.createColorsPanel();

            this.setPicker();
        },
        setPicker: function() {
            this.jControl.empty();
            this.pickers.xy.jControl.appendTo(this.jPicker);

            this.jPicker.append(this.pickers.colors.jSaver);

            this.jPicker.appendTo(this.jControl);
            this.pickers.colors.jControl.appendTo(this.jControl);
        },
        setLight: function(light) {
            this.light = light;
            var selected = this.pickers.xy.selected;
            var xy = [selected[0], selected[1]];
            var bri = selected[2];

            if(light !== undefined) {
                xy = light[1].state.xy;
                bri = light[1].state.bri / 255;
            }

            this.pickers.xy.selected = [xy[0], xy[1], bri];
            this.pickers.xy.draw();
        },
        createXYPicker: function() {
            var self = this;

            var picker = $("<canvas/>");
            picker[0].width = 250;
            picker[0].height = 250;

            this.pickers.xy = new XYPicker(picker[0]);
            this.pickers.xy.jControl = picker;
            this.xyToRgb = function(x, y) { 
                return this.pickers.xy.xyToRgb(x, y);
            };

            this.pickers.xy.onClick = function(xy, ev) {
                var offset = $(this.canvas).offset();
                xy[0] = ev.pageX - offset.left;
                xy[1] = ev.pageY - offset.top;
                
            };
            this.pickers.xy.onSelect = function(xybri) {
                var bri = Math.round(xybri[2] * 255);

                self.setColor({ type:"xy", dat: [xybri[0], xybri[1], bri]});
            };
            this.pickers.xy.setColor = function(color, doSelect, doDraw) {
                doSelect = doSelect || true;
                doDraw = doDraw || true;

                var sel = color.slice(0);
                if(sel.length < 3)
                    sel[3] = 1;

                this.selected = color;

                if(doDraw) this.draw();
                if(doSelect) this.doSelect(sel[0],sel[1],sel[2]);
            };

            this.pickers.xy.start();
        },
        setColor: function(color, isUser) {
            this.color = color;
            
            if(isUser)
                this.pickers.xy.setColor(color, false, true);

            if(this.light)
                this.lights.setColor(this.light[0], color.dat, color.type);
            else
                this.groups.setColor(0, color.dat, color.type);
        },
        createColorsPanel: function() {
            var self = this;

            this.pickers.colors = new $aur.UserColorPicker({parent: this});

            this.pickers.colors.saveFn = function(e, text) {
                $aur.globals.user.addColor(text.val(), self.color.dat, self.color.type);
                $aur.globals.user.saveColors();
                return true;
            };

            this.pickers.colors.start();
        }
    });

})($aur);