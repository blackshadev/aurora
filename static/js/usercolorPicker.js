/*global $aur, $*/

(function($aur) {
    function createPanels(count, titles, paddingless) {
        var arr = [];

        for(var i = 0; i < count; i++) {
            var jControl = $("<div/>", {"class": "panel panel-default"});
            /* Header */
            $("<div/>",{"class": "panel-heading"}).appendTo(jControl).append(
                $("<h4/>", {"class": "panel-title"}).append(
                    $("<a/>").text(titles[i])
                )
            );
            /* Body */
            $("<div/>", {"class": "panel-collapse collapse in"}).append(
                $("<div/>", {"class":"panel-body" + ((paddingless) ? " paddingless" : "")  })
            ).appendTo(jControl);

            arr.push(jControl);
        }

        return arr;
    }

    function createSaver(inpPH, buttLabel, clickFn) {
        var jControl = $("<div/>", { "class": "input-group"});
        var text = $("<input/>", 
            { "class": "form-control", "type": "text", "placeholder": inpPH }
        );
        jControl.append(text);
        
        var but = $("<input/>", 
            { type: "button", "class": "btn btn-default", value: buttLabel}
        ).click(function(e) { e.preventDefault(); clickFn(e, text, but); });

        jControl.append($("<span/>", { "class": "input-group-btn" }).append(but) );
        return jControl;
    }

    $aur.UserColorPicker = $aur.Object.extend({
        parent: null, // colorpickers ui
        jControl: null, // jControl for the color table
        jSaver: null, // jControl for saving colors
        saveFn: null, // function used to save a color
        create: function(oPar) {
            $aur.extend(this, oPar);
        },
        refresh: function() {
            if(!this.jControl)
                this.start();
        },
        start: function() {
            this.render();
        },
        render: function() {
            this.jControl = $("<div/>", {"class":"panel-group"});
            
            var panels = createPanels(2, ["Recently used", "User Color"], true);

            //this.jRecent = panels[0].appendTo(this.jControl);
            this.jUser = panels[1].appendTo(this.jControl);


            var self = this;
            this.jSaver = createSaver("Name", "Save", function(e, text, but) {
                e.preventDefault();
                if(self.saveFn(e, text, but))
                    text.val("");
            } );

            this.fillUserSection();

        },
        fillUserSection: function() {
            var self = this;

            // wait till user is filled
            var user = $aur.globals.user;
            if(!user) { window.setTimeout(function() { self.fillUserSection(); }, 10); return; }

            var colors = user.colors;

            var container = $(".panel-body", this.jUser);
            container.empty();

            var table = $("<table/>", { "class": "table table-striped class", style: "margin: 0;" });

            for(var n in colors) {
                if(colors.hasOwnProperty(n)) {
                    var row = $("<tr/>").appendTo(table);
                    
                    row.append(
                            $("<td/>").append(self.colorBulb(n, colors[n]))
                        ).append(
                            $("<td/>").text(n)
                        ).append(
                             $("<td/>").append(this.removeIcon(n))
                        );

                }
            }
            
            container.append(table);
        },
        removeIcon: function(name) {
            var self = this;
            var el = $("<span/>", 
                { "class": "glyphicon glyphicon-remove clickable" }
            ).click(function(e) {
                e.preventDefault();

                delete $aur.globals.user.colors[name];
                $aur.globals.user.saveColors();
                self.fillUserSection();
            });
            return el;
        },
        colorBulb: function(name, color) {
            var self = this;

            var xy = this.parent.xyToRgb(color.dat[0], color.dat[1]);
            var colorStr = "#" + xy.map(function(x) { 
                x = parseInt(x).toString(16);
                return (x.length === 1) ? "0"+x : x;
            }).join("");

            return $("<span/>", 
                    {"class": "color"}).css("background-color", colorStr).
                        click(function() { self.setColor(name, color); });
        },
        setColor: function(name, color) {
            var jInput = $(":text", this.jSaver);
            jInput.val(name);

            this.parent.setColor(color.dat, true);
        }
    });
})($aur);