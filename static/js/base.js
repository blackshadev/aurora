var $aur = {};

(function($aur) {
    $aur.globals = {};
    
    $aur.Object = function () { };
    $aur.Object.prototype.create = function () { };
    $aur.Object.prototype.destroy = function() { };
    $aur.Object.prototype.superClass = null;
    $aur.Object.prototype.toString = function () { return "Aurora class: " + this.className; };

    $aur.Object.override = function (procname, fn) {
        this.prototype[procname] = fn;
        fn.$inherited = this.prototype.superClass;
    };

    $aur.Object.prototype.inherited = function () {
        return arguments.callee.caller.$inherited;
    };

    $aur.Object.extend = function (def) {
        var classDef = function () { 
            if (arguments[0] !== $aur.Object) { this.create.apply(this, arguments); } };
        var proto = new this($aur.Object);
        var superClass = this.prototype;
        proto.superClass = superClass;
        for (var n in def) {
            var item = def[n];
            if ((item instanceof Function) && (this.prototype[n])) item.$inherited = superClass;
            proto[n] = item;
        }
        proto.tag = null;
        proto.classDef = classDef;
        classDef.prototype = proto;
        //Give this new class the same static extend method
        classDef.extend = this.extend;
        classDef.override = $aur.Object.override;
        classDef.properties = this.properties ? this.properties.clone() : undefined;
        return classDef;
    };

    $aur.extend = function(dest, src) {
        for( var n in src) {
            if(src.hasOwnProperty(n))
                dest[n] = src[n];
        }
    };

    
    var iListCounter = 0;
    $aur.List = $aur.Object.extend({
        count: 0,
        items: null,
        itemsArray: null,
        ndxField: null,  // string containing optional indexed field; if none one will be created
        owner: null,
        mustDestroyContents: false,
        events: null,
        useEvents: false,
        objectClassType: $aur.Object,
        create: function (owner, mustDestroyContents, ndxField) {
            this.items = {};
            this.itemsArray = [];

            if (arguments.length < 2 && !(arguments[0] instanceof $aur.Object)) {
                $.extend(this, arguments[0]);
                return;
            }

            this.owner = owner;
            if (mustDestroyContents !== undefined)
                this.mustDestroyContents = !!mustDestroyContents;
            if (ndxField) this.ndxField = ndxField;
        },
        createEvents: function () { this.events = new $aur.Events(this); this.useEvents = true;},
        enableEvents: function (enable) { this.useEvents = enable && this.events; },
        destroy: function () { this.clear(); },
        doChange: function (dat) { if (this.useEvents) this.events.notify("ListChanged", this, dat); },
        findOrCreate: function (sIndex, oPar) {
            oPar.args = oPar.args || [];
            var oRet = this.items[sIndex];
            if (!oRet) {
                oRet = new this.objectClassType($aur.Object);
                oRet.create.apply(oRet, oPar.args);
                if (oPar.onCreate) oPar.onCreate(oRet);
                this.add(oRet, sIndex);
            }
            return oRet;
        },
        item: function (sIndex, bSilent) {
            var oRet = this.items[sIndex];
            if (!!bSilent) return oRet;
            if (!oRet) errmsg("List('" + sIndex + "') does not exist");
            return oRet;
        },
        addItems: function (aArr) {
            this.enableEvents(false);

            var items = [];
            for (var iX = 0; iX < aArr.length; iX++)
                items.push(this.add(aArr[iX]));
            this.enableEvents(true);

            this.doChange({ type: "addItems", items: items });
        },
        add: function (obj, /* opt */sIndex) {
            if (!sIndex) {
                if (this.ndxField && obj[this.ndxField] !== undefined && obj[this.ndxField] !== null) {
                    sIndex = obj[this.ndxField]; } else { sIndex = "LI#" + iListCounter++; obj.sId = obj.sId || sIndex; }
            }
            var ok = obj instanceof this.objectClassType;
            if (!ok) { errmsg(this.className + ".add('" + sIndex + "', obj) expects obj of type " + this.objectClassType.prototype.className); }
            if (this.items[sIndex]) {
                errmsg("list {0} already contains element {1}", this.owner ? this.owner.name : "", sIndex );
            }else {
                this.count++;
                this.itemsArray.push(obj);
            }
            if (this.ndxField && !obj[this.ndxField]) obj[this.ndxField] = sIndex;
            this.items[sIndex] = obj;
            this.doChange({ type: "add", item: obj });
            return obj;
        },
        rename: function (oldKey, newKey) {
            if (oldKey === newKey) return this.items[oldKey];
            if (this.items[newKey]) { errmsg("Key is not unique"); return; }
            if (!this.items[oldKey]) return null;
            this.items[newKey] = this.items[oldKey];
            delete this.items[oldKey];
            return this.items[newKey];
        },
        remove: function (item) {
            var par1 = item;
            if (par1 instanceof this.objectClassType) par1 = this.ndxField ? par1[this.ndxField] : (par1.sId || par1.name);
            if (par1 !== undefined) {
                if (this.items[par1]) {
                    var iX = this.itemsArray.indexOf(this.items[par1]);
                    if (iX >= 0) this.itemsArray.splice(iX, 1);
                    if (this.mustDestroyContents) this.items[par1].destroy();
                    delete this.items[par1];
                    this.count--;
                    this.doChange({ type: "remove", item: item });
                }
            }
        },
        // moves the item from oldIdx to newIdx, if newIdx >= length, than move it to the end
        move: function (oldIdx, newIdx) {
            if (oldIdx instanceof this.objectClassType)
                oldIdx = this.itemsArray.indexOf(oldIdx);

            if (newIdx >= this.itemsArray.length) 
                newIdx = this.itemsArray.length;
            
            this.itemsArray.splice(newIdx, 0, this.itemsArray.splice(oldIdx, 1)[0]);
        },
        clear: function () {
            if (this.mustDestroyContents) this.forEach(function (obj) { obj.destroy(); });
            this.items = null;
            this.items = {};
            this.itemsArray.length = 0;
            this.count = 0;
            this.doChange({ type: "clear" });
        },
        indexOf: function (obj) {
            return this.itemsArray.indexOf(obj);
        },
        contains: function(obj) {
            return this.indexOf(obj) > -1;
        },
        find: function(obj) {
            var iX = this.indexOf(obj);
            if (iX >= 0) return this.itemsArray[iX];
            return null;
        },
        /* returns the item where fn returns true */
        where: function (fn) {
            for (var iX = 0; iX < this.itemsArray.length; iX++) {
                var el = this.itemsArray[iX];
                if (fn(el)) return el;
            }
        },
        findTag: function (tag) {
            for (var sIndex in this.items) {
                var item = this.items[sIndex];
                if (item.tag === tag) return item;
            }
        },
        forEach: function (fn) {
            for (var iX = 0; iX < this.itemsArray.length; iX++) {
                var item = this.itemsArray[iX];
                fn.call(this, item, item.sId);
            }
        },
        forEachRev: function (fn) {  // needed if items will be removed during iteration
            for (var iX = this.itemsArray.length - 1; iX >= 0; iX--) {
                var item = this.itemsArray[iX];
                fn.call(this, item, item.sId);
            }
        },
        forEachRevB: function (fn) {  // needed if items will be removed during iteration
            var result;
            for (var iX = this.itemsArray.length - 1; iX >= 0; iX--) {
                var item = this.itemsArray[iX];
                result = fn.call(this, item, item.sId);
                if (result) break;
            }
            return result;
        },
        forEachB: function (fn) {   // stops when resulting value result truly
            var result;
            for (var iX = 0; iX < this.itemsArray.length; iX++) {
                var item = this.itemsArray[iX];
                result = fn.call(this, item, item.sId);
                if(result) break;
            }
            return result;
        },
        map: function (fn) {
            return this.itemsArray.map(fn);
        },
        toJSON: function () {
            return this.map(function(el) { return el.toJSON(); });
        }
    });

    $aur.Event = $aur.Object.extend({    
        subscriber    : null, // Object
        eventType     : "",
        funcName      : "",
        fn            : null,
        enabled       : true,
        once          : false,
        create: function (subscriber, eventType, funcName, once) {
            this.subscriber = subscriber;
            this.eventType = eventType;
            this.funcName = funcName || "onNotify";
            this.once = !!once;
            if (typeof funcName === "function") this.fn = funcName;
            else if (subscriber[funcName] && typeof (subscriber[funcName] === "function")) this.fn = subscriber[funcName];
        }
    });

    $aur.Events = $aur.List.extend({
        owner  : null, // Object
        objectClassType: $aur.Event,
        subscribe: function(object, eventType, funcName, once) {
            var event = new $aur.Event(object, eventType, funcName, once);
            this.add(event);
        },
        unsubscribe: function(object, eventType) {
            var events = this;
            this.forEachRev(function(e) { if(e.subscriber === object && (!eventType || (eventType === e.eventType))) events.remove(e); });
        },
        notify: function(eventType, sender, data) {
            var events = this;
            this.forEach(function(e) { 
                if ( (e.eventType === eventType || e.eventType === "*") && e.enabled && e.fn) {
                    e.fn.call(e.subscriber, e, sender, data);
                    if(e.once) events.remove(e);
                }
            });
        }
    });

})($aur);
