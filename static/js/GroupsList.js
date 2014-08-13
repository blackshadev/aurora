(function($aur) {

    function createLghtsTable() {
        var table = $("<table/>", { "class": "table table-striped" });

        var tabh = $("<thead/>");
        var cols = $aur.Light.displayProps;
        for(var i = 0; i < cols.length; i++)
            tabh.append($("<td/>").text(cols[i].caption));
        tabh.appendTo(table);

        var tabb = $("<tbody/>");
        tabb.appendTo(table);

        return [table, tabb];
    }

    $aur.Group = $aur.Object.extend({
        id: -1,
        lights: null,
        name: "",
        on: null, // Set when all lights in the group have the same on state
        rgb : null, // Set when all lights in the group have the same color
        // display attrs
        displayEl: null, // jControl (tr)
        edit: null,
        closeFn: null, 
        create: function(obj) {
            this.lights = new $aur.LightsList();

            this.raw = obj;
            this.id = obj[0];
            this.name = obj[1].name;

            this.setLights();
            this.checkGrouping();
            $aur.lights.events.subscribe(this, "DataChanged", "checkGrouping")
        },
        checkGrouping: function() {
            if(this.lights.count < 1) return;

            var rgb = this.lights.itemsArray[0].rgb;
            var on  = this.lights.itemsArray[0].on;

            this.lights.forEachB(function(e) {
                if(rgb !== e.rgb) rgb = null;
                if(on !== e.on) on = null;
                if(on === null && rgb === null) return true; // breaks
            });

            var isChanged = !(this.rgb === rgb && this.on === on);

            this.rgb = rgb;
            this.on  = on;

            if(isChanged)
                this.refreshDisplay();
        },
        waitForLights: function() {
            console.log("Sub to lights event")
            $aur.lights.events.subscribe(this, "ListChanged", "setLights");
        },
        setLights: function() {
            var arr = this.raw[1].lights;
            var l = arr.length;
            for(var i = 0; i < l; i++) {
                var lght = $aur.lights.items[arr[i]];
                if(!lght) { this.waitForLights(); return; }

                this.lights.add(lght);

                if(this.on !== lght.on) this.on = null;
                if(this.rgb !== lght.rgb) this.rgb = null;
            }

            this.refreshDisplay();
        },
        setData: function(dat) {
            var isChanged = false;
            var old = { name: this.name, lights: this.raw[1].lights };

            this.raw = dat;
            this.name = dat[1].name;
            var lights = dat[1].lights;

            var arrSame = (lights.length === old.lights.length);
            for(var i = 0; arrSame && i < lights.length; i++)
                if(old.lights[i] !== lights[i]) { arrSame = false; break; }

            if(!arrSame) this.setLights();

            // check for changes
            isChanged = !(this.name === old.name && arrSame);

            if(isChanged && !this.edit)
                this.refreshDisplay();
            return isChanged;
        },
        toHTML: function() {
            var groupRow = $("<tr/>", { 
                "class": "clickable", "data-toggle": "collapse", 
                "data-target": "#lght_" + this.id
            });

            var lghtTd = $("<td/>", { colspan: $aur.Group.displayProps.length});
            var lghtsRow = $("<tr/>").append(lghtTd);

            var ltab = createLghtsTable();
            this.lightsBody = ltab[1];
            this.tableContainer = $("<div/>", { 
                "class": "collapse", id: "lght_" + this.id 
            }).append(ltab[0]).appendTo(lghtTd);
            
            this.lights.forEach(function(e) {
                ltab[1].append(e.toHTML());
            });

            this.displayEl = [
                groupRow, lghtsRow
            ];
            var self = this;

            this.refreshDisplay();

            return this.displayEl;
        },
        // update the display element
        refreshDisplay: function() {
            if(!this.displayEl || this.edit) return;
            this.displayEl[0].empty();

            var td;
            for(var i = 0; i < $aur.Group.displayProps.length; i++) {
                var prop = $aur.Group.displayProps[i];
                td = $("<td/>");
                
                if(prop.fn)
                    prop.fn.call(this, td, this[prop.name]);
                else
                    td.text(this[prop.name]);

                this.displayEl[0].append(td);
            }


        },
        showEdit: function(td) {
            if(this.edit) return;

            var ctrl = $(td);

            var self = this;
            this.edit = $("<input/>").val(this.name);
            ctrl.empty().append(self.edit);

            this.closeFn = function(e) {
                if(self.edit[0] === e.target) return; 
                var nname = self.edit.val();

                $(document).off("click", self.closeFn);
                self.closeFn = null;
                self.edit = null;

                $aur.globals.lights.setName(self.id, nname);

                self.name = nname;
                ctrl.text(self.name);
            };
            window.setTimeout(function() {
                $(document).on("click", self.closeFn);
            });
        }
    });
    $aur.Group.displayProps = [
        { name: "id", caption: "#" },
        { 
            name: "name", caption: "Name", 
            fn: function(td, name) { 
                var self = this;
                td.text(name);
                td.addClass("clickable");
                td.click(function(e) {
                    e.stopImmediatePropagation();
                    self.showEdit(this); 
                });
            } 
        }, {
            name: "on", caption: "State",
            fn: function(td, state) {
                var icon = state ? 
                      "glyphicon glyphicon-certificate" 
                    : "glyphicon glyphicon-record";
                var self = this;
                var span = $("<span/>", {"class": "clickable " + icon});
                span.click(function(e) { e
                    e.stopImmediatePropagation();
                    $aur.globals.groups.setState(self.id, !self.on); 
                });
                td.append(span);
            }
        }, {
            name: "state", caption: "Color",
            fn: function(td, state) {
                var self = this;
                var color = this.rgb;
                td.addClass("clickable")
                  .append(
                    $("<span/>", { 
                        "class": "color",
                        "data-toggle": "modal", "data-target": "#colorpicker" 
                    }).css("background-color", color).click(function(e) {
                        e.stopImmediatePropagation();
                        $aur.globals.picker.setLight(self);
                    })

            );

            }
        }
    ];

    $aur.GroupsList = $aur.ObjectList.extend({
        objectClassType: $aur.Group,
        displaySelector: "", // selector of the tableBody which displays this all
        url: "api/groups"
    });

})($aur);