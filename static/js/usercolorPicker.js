/*global $aur, $*/

(function($aur) {
    function createPanels(count, titles) {
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
                $("<div/>", {"class":"panel-body"})
            ).appendTo(jControl);

            arr.push(jControl);
        }

        return arr;
    }

    $aur.UserColorPicker = $aur.Object.extend({
        parent: null, // colorpickers ui
        jControl: null,
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
            
            var panels = createPanels(2, ["Recently used", "User Color"]);

            this.jRecent = panels[0].appendTo(this.jControl);
            this.jUser = panels[1].appendTo(this.jControl);

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

            var table = $("<table/>", { "class": "table table-striped" });

            for(var n in colors) {
                if(!colors.hasOwnProperty(n)) continue;

                var row = $("<tr/>").appendTo(table);
                
                row.append(
                        $("<td/>").append(self.colorBulb(colors[n]))
                    ).append(
                        $("<td/>").text(colors[n].name)
                    );
            }
            
            container.append(table);
        },
        colorBulb: function(color) {
            var self = this;

            var xy = this.parent.xyToRgb(color.color.dat[0], color.color.dat[0], color.color.bri);
            var colorStr = "#" + xy.map(function(x) { 
                x = parseInt(x).toString(16);
                return (x.length === 1) ? "0"+x : x;
            }).join("");

            return $("<span/>", 
                    {"class": "color"}).css("background-color", colorStr).
                        click(function() { self.setColor(color); });
        },
        setColor: function(color) {
            console.log(color);

            debugger;
            this.parent.setColor(color.color);
        }
    });
})($aur);