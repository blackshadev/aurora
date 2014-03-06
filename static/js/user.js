/* globals $aur */
(function($aur) {

    $aur.User = $aur.Object.extend({
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
        updateColors: function() {
            var pars = { 
                type: "PUT",
                url: "user/colors",
                data: this.colors,
                success: function(data) {
                    console.log(data);
                }
            };
            $aur.apiCall(pars);
        }
    });

})($aur);