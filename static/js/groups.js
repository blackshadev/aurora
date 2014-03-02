/*global $aur */
(function($aur) {

    $aur.Groups = $aur.Object.extend({
        create: function(refrFn, errFn) {
            this.refrFn = refrFn;
            this.errFn = errFn;

            this.autoSync = false;//true;
            this.syncTime = 2000;
            this.th = null;

            this.refresh();
        },
        refresh: function() {
            var self = this;

            if(this.th) {
                window.clearTimeout(this.th);
                this.th = null;
            }

            var pars = {
                url: "/api/groups",
                type: "POST",
                success: function(data) {
                    if(self.autoSync)
                        self.th = window.setTimeout(
                            function() { self.refresh(); }, 
                            self.syncTime);

                    self.refrFn(data);
                }
            };

            $aur.apiCall(pars);
        },
        action: function(gId, action) {
            var self = this;

            var pars = {
                url: "/api/groups/" + gId + "/action",
                type: "PUT",
                success: function(data) {
                    if(self.autoSync)
                        self.th = window.setTimeout(
                            function() { self.refresh(); }, 
                            self.syncTime);

                    self.refrFn(data);
                }
            };
            pars.data = action;
            $aur.apiCall(pars);
        },
        setColor: function(gId, color) {
            var xy = [color[0], color[1]];


            this.action(gId, { xy: xy, bri: color[2] });
        }
    });

    function Groups(refrFn, errFn) {
        this.refrFn = refrFn;
        this.errFn = errFn;

        this.autoSync = false;//true;
        this.syncTime = 2000;
        this.th = null;

        this.refresh();
    }
    Groups.prototype.refresh = function() {
        var self = this;

        if(this.th) {
            window.clearTimeout(this.th);
            this.th = null;
        }

        var pars = {
            url: "/api/groups",
            type: "POST",
            success: function(data) {
                if(self.autoSync)
                    self.th = window.setTimeout(
                        function() { self.refresh(); }, 
                        self.syncTime);

                self.refrFn(data);
            }
        };


        $aur.apiCall(pars);
    };
    Groups.prototype.action = function(gId, action) {
        var self = this;

        var pars = {
            url: "/api/groups/" + gId + "/action",
            type: "PUT",
            success: function(data) {
                if(self.autoSync)
                    self.th = window.setTimeout(
                        function() { self.refresh(); }, 
                        self.syncTime);

                self.refrFn(data);
            }
        };
        pars.data = action;
        $aur.apiCall(pars);
    };
    Groups.prototype.setColor = function(gId, color) {
        var xy = [color[0], color[1]];


        this.action(gId, { xy: xy, bri: color[2] });
    };


})($aur);