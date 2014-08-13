/*global $aur */
(function($aur) {

    $aur.Groups = $aur.AsyncBase.extend({
        refresh: function() {
            var pars = {
                url: "/api/groups",
                type: "POST"
            };

            this.send(pars);
        },
        action: function(gId, action) {
            var self = this;

            var pars = {
                url: "/api/groups/" + gId,
                type: "PUT",
                success: function() {
                    self.refresh();
                }
            };
            pars.data = action;

            $aur.apiCall(pars);
        },
        setState: function(gId, state) {
            var self = this;
            if(typeof state === "boolean")
                state = { on: state };
            var pars = {
                url: "/api/groups/" + gId + "/state",
                type: "PUT",
                data: state,
                success: function() {
                    $aur.lights.refresh();
                }
            };
            $aur.apiCall(pars);
        },
        setColor: function(gId, color) {
            var xy = [color[0], color[1]];


            this.action(gId, { xy: xy, bri: color[2] });
        },
        newRow: function(data, iX) {
            var rows = [ 
            $("<tr/>", { 
                "class": "hiddenRow",
                "data-toggle": "collapse",
                "data-target": "#group_" + iX
            }), 
            $("<tr/>") ];

            for(var i = 0; i < 2; i++) {
                rows[0].append($("<td/>").text(data[i]));
            }
            this.addStateIcon(data, $("<td/>")).appendTo(rows[0]);
            this.addColorIcon(data, $("<td/>")).appendTo(rows[0]);

            
            
            var hRow = $("<td />", { "colspan": 4 });
            var block = $("<div/>", { id: "group_" + iX, "class": "accordian-body collapse" });
            block.append(this.createLightsTable(data[2]));
            
            hRow.append(block);
            rows[1].append(hRow);

            return rows;
        },
        addStateIcon: function(data, td) {
            var state = data[3];
            var icon = state ? 
                      "glyphicon glyphicon-certificate" 
                    : "glyphicon glyphicon-record";
            return td.append(
                $("<span/>", { "class": icon + " clickable" })
            ).click(function(e) {
                e.preventDefault();
                $aur.globals.groups.setState(data[0], !state);
            }); 
            return td;
        },
        addColorIcon: function(data, td) {
            var el = td.addClass("clickable").append(
            $("<span/>", { "class": "color",
                "data-toggle": "modal", "data-target": "#colorpicker" }).css(
                "background-color", data[4])
            );
            $aur.globals.picker.setGroup(data);
            return td;
        },
        createLightsTable: function(data) {
            var cols = {
                "#": function(l, iX, td) { td.text(iX); }, 
                "Name": function(l, iX, td) { td.text(l.name); }, 
                "State": $aur.globals.lights.addStateIcon,
                "Color": function(l, iX, td) { td.text(l.state.rgb); }
            };

            var tab = $("<table/>", { "class": "table table-striped" });
            var thead = $("<thead/>");

            var key;
            for(key in cols) {
                thead.append($("<td/>").text(key));
            }
            var tbody = $("<tbody/>");

            for(var i = 0; i < data.length; i++) {
                var r = $("<tr/>");

                for(key in cols) {
                    var td = $("<td/>");
                    cols[key](data[i][1], data[i][0], td);
                    r.append(td);
                }

                tbody.append(r);
            }


            tab.append(tbody);
            tab.append(thead);

            return tab;
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

        var pars = {
            url: "/api/groups",
            type: "POST"
        };


        this.send(pars);
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