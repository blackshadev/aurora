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


        }
    });
})($aur);