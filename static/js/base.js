var $aur = {};

(function($aur) {
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
        console.log(this);
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
})($aur);
