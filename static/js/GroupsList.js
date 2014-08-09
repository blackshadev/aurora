(function($aur) {

    $aur.Group = $aur.Object.extend({
        id: -1,
        lights: null,
        name: "",
        state: null,
        rgb : null,
        // display attrs
        displayEl: null, // jControl (tr)
        edit: null,
        closeFn: null, 
        create: function(obj) {
            debugger;
        },
        setData: function(dat) {
            var isChanged = false;
            var old = { name: this.name, on: this.on, rgb: this.rgb };

            debugger; 

            return;
            this.name = dat[1].name;
            this.on = dat[1].state.on;
            this.state = dat[1].state;
            this.rgb = $aur.ConvertColor(this);

            // check for changes
            for(var k in old) {
                if(this[k] !== old[k]) {
                    isChanged = true; break;
                }
            }

            if(isChanged && !this.edit)
                this.refreshDisplay();
        },
        toHTML: function() {
            this.displayEl = $("<tr/>");
            
            this.refreshDisplay();

            return this.displayEl;
        },
        getRGB: function() {
            return $aur.ConvertColor(this);
        },
        // update the display element
        refreshDisplay: function() {
            if(!this.displayEl || this.edit) return;
            this.displayEl.empty();

            for(var i = 0; i < $aur.Light.displayProps.length; i++) {
                var prop = $aur.Light.displayProps[i];
                var td = $("<td/>");
                
                if(prop.fn)
                    prop.fn.call(this, td, this[prop.name]);
                else
                    td.text(this[prop.name]);

                this.displayEl.append(td);
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
    $aur.Light.displayProps = [
        { name: "id", caption: "#" },
        { 
            name: "name", caption: "Name", 
            fn: function(td, name) { 
                var self = this;
                td.text(name);
                td.addClass("clickable");
                td.click(function() { self.showEdit(this); });
            } 
        }, {
            name: "on", caption: "State",
            fn: function(td, state) {
                var icon = state ? 
                      "glyphicon glyphicon-certificate" 
                    : "glyphicon glyphicon-record";
                var self = this;
                var span = $("<span/>", {"class": "clickable " + icon});
                span.click(function() { 
                    $aur.globals.lights.setState(self.id, !self.on); 
                });
                td.append(span);
            }
        }, {
            name: "state", caption: "Color",
            fn: function(td, state) {
                var self = this;
                var color = this.getRGB();
                td.addClass("clickable")
                  .append(
                    $("<span/>", { 
                        "class": "color",
                        "data-toggle": "modal", "data-target": "#colorpicker" 
                    }).css("background-color", color).click(function(e) {
                        $aur.globals.picker.setLight(self);
                    })

            );

            }
        }
    ];

    $aur.LightsList = $aur.List.extend({
        objectClassType: $aur.Group,
        ndxField: "id",
        displaySelector: "", // selector of the tableBody which displays this all
        timer: -1,
        refresh: function() {
            var self = this;

            var pars = {
                url: "api/groups",
                type: "POST",
                success: function(dat) {
                    self.setData(dat);
                    if(self.timer > -1)
                        window.setTimeout(function() { self.refresh() }, self.timer);
                }
            };

            $aur.apiCall(pars);
        },
        setData: function(arr) {
            

            var l = arr.length;
            for(var i = 0; i < l; i++) {
                var item = this.items[arr[i][0]];
                if(!item)
                    this.add(new this.objectClassType(arr[i]));
                else
                    item.setData(arr[i]);
            }

            this.doDisplay();
        },
        refreshEvery: function(time) {
            this.timer = time;
            var self = this;
            self.refresh();
        },
        setDisplay: function(selector) {
            this.displaySelector = selector;
            this.doDisplay();
        },
        // add new lights to the display selector
        doDisplay: function() {
            if(this.displaySelector) {
                var ctrl = $(this.displaySelector);
                this.forEach(function(e) {
                    if(!e.displayEl) ctrl.append(e.toHTML());
                });
            }
        }
    });

})($aur);