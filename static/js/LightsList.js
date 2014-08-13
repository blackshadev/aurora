(function($aur) {

    $aur.Light = $aur.Object.extend({
        id: -1,
        rgb: "",
        on: false,
        state: null,
        name: "",
        raw: null,
        rgb: null,
        // display attrs
        displayEl: null, // jControl (tr)
        edit: null,
        closeFn: null, 
        create: function(obj) {
            this.raw = obj;

            this.id = obj[0];
            this.rgb = obj[1].state.rgb;
            this.on = obj[1].state.on;
            this.name = obj[1].name;
            this.state = obj[1].state;
            this.rgb = $aur.ConvertColor(this);
        },
        setData: function(dat) {
            var isChanged = false;
            var old = { name: this.name, on: this.on, rgb: this.rgb };

            this.raw = dat;
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
            return isChanged;
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

    $aur.LightsList = $aur.ObjectList.extend({
        objectClassType: $aur.Light,
        url: "api/lights"
    });

})($aur);