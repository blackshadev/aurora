/* File with additions on already existing modules */

$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });

    return o;
}

Object.keys = function(o) {
    var a = [];
    for(var k in o) {
        if(o.hasOwnProperty(k)) a.push(k);
    }
    return a;
}