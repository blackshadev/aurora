/* globals $aur */
(function($aur) {

    $aur.User = $aur.Object.extend({
        colors: null,
        settings: null,
        create: function(data) {
            this.setProperties(data);
        },
        setProperties: function(data) {
            var isJson = ["colors", "settings"];
            for(var n in data) {
                if(data.hasOwnProperty(n) && typeof(data[n]) !== "function")
                    if(isJson.indexOf(n) > -1 && typeof(data[n]) === "string")
                        this[n] = JSON.parse(data[n]);
                    else
                        this[n] = data[n];
            }

        },
        addColor: function(name, color, type) {
            type = type || "xy";

            this.colors[name] = { type:type, dat: color };

            //this.saveColors();
        },
        saveColors: function() {
            var pars = { 
                type: "PUT",
                url: "user/colors",
                data: this.colors,
                success: function(data) {

                }
            };
            $aur.apiCall(pars);
        }
    });


})($aur);