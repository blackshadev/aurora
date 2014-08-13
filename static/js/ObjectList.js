(function($aur) {

    // Holds all functionality for a list which refreshes every x times
    // Must be inherited
    $aur.ObjectList = $aur.List.extend({
        url: "",
        timeHandle: -1,
        ndxField: "id",
        displaySelector: "", // selector of the tableBody which displays this all
        timer: -1,
        events: null, // emit: ListChanged every time setData is called, and DataChanged everyTime some item is updated
        useEvents: true,
        create: function() {
            this.inherited().create.apply(this, arguments);

            this.createEvents();
        },
        refreshEvery: function(time) {
            this.timer = time;
            var self = this;
            self.refresh();
        },
        refresh: function() {
            var self = this;
            var pars = {
                url: this.url,
                type: "POST",
                success: function(dat) {
                    self.setData(dat);
                    if(self.timer > -1) {
                        self.timeHandle = window.setTimeout(
                            function() { self.refresh() }, self.timer
                        );
                    }
                }
            };

            $aur.apiCall(pars);
        },
        setData: function(arr) {            
            this.useEvents = false;

            var isChanged = false;
            var l = arr.length;
            for(var i = 0; i < l; i++) {
                var item = this.items[arr[i][0]];
                if(!item) {
                    this.add(new this.objectClassType(arr[i]));
                    isChanged = true;
                }
                else {
                    if(item.setData(arr[i])) isChanged = true;
                }
            }
            this.useEvents = true;
            this.doChange();

            if(isChanged)
                this.events.notify("DataChanged");

            this.doDisplay();
        },
        setDisplay: function(selector) {
            this.displaySelector = selector;
            var ctrl = $(selector);
            this.forEach(function(e) { 
                if(e.displayEl) {
                    e.displayEl.detach();
                    if(ctrl.length) e.displayEl.appendTo(ctrl);
                }  
            });
            this.doDisplay();
        },
        doDisplay: function() {
            var ctrl = $(this.displaySelector);
            if(ctrl.length) {
                
                this.forEach(function(e) {
                    if(!e.displayEl) ctrl.append(e.toHTML());
                });
            }
        },
        // display whole table
        toHTML: function() {
            var props = this.objectClassType.displayProps;
            var tab   = $("<table/>", { "class": "table table-striped" });
            var tabh  = $("<thead/>").appendTo(tab);
            var tabb  = $("<tbody/>").appendTo(tab);

            var td, tr = $("<tr/>");
            for(var i = 0; i < props.length; i++)  {
                td = $("<td/>").text(props[i].caption);
            }
            tr.appendTo(tabh);

            this.setDisplay(tabb);

            return tab;
        }
    });

})($aur);