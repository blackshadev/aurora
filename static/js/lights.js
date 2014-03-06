/*global $aur */
(function ($aur) {
    $aur.Lights = $aur.AsyncBase.extend({
        refresh: function() {

            var pars = {
                url: "/api/lights",
                type: "POST"
            };

            this.send(pars);
        },
        setState: function(id, state) {
            var self = this;
            var pars = { 
                url: "/api/lights/" + id + "/state", 
                type: "PUT",
                success: function() {
                    self.refresh();
                }
            };
            pars.data = {state: state};
            $aur.apiCall(pars);
        },
        setColor: function(id, color, mode) {
            var self = this;
            
            var pars = { 
                url: "/api/lights/" + id + "/color", 
                dataType: "json", 
                type: "PUT",
                success: function() {
                    self.refresh();
                }
            };
            pars.data = {color: color, mode: mode};

            $aur.apiCall(pars);
        },
        setName: function(id, name) {
            var self = this;

            var pars = {
                url: "/api/lights/" + id + "/name",
                dataType: "json",
                type: "PUT",
                success: function() {
                    self.refresh();
                }
            };
            pars.data = {name:name};

            $aur.apiCall(pars);
        }
    });

})($aur);
