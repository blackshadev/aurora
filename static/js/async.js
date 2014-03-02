/*global $aur, CryptoJS */
(function($aur) {
    var secret = "";
    var sess = "";
    var user = null;

    function setSecret(newSecret) {
        console.log("newSecret: " + newSecret);
        secret = newSecret;

        $aur.storage.set("Aurora_Secret", newSecret);
    }

    function signData(data) {
        if(!secret) return;
        var signature = CryptoJS.algo.HMAC.create(CryptoJS.algo.MD5, secret);

        console.log("With: " + secret + ", Signing: " + JSON.stringify(data));
        signature.update(JSON.stringify(data));

        var str = signature.finalize().toString();

        return str;
    }

    function createUser(data) {
        sess = data.sessid;
        user = new $aur.User(data);
    }

    $aur.getUser = function() {
        return user;
    }

    $aur.apiCall = function(pars) {
        var cpy = $.extend({}, pars);
        pars = pars || {};
        cpy.contentType = "application/json";
        cpy.type = pars.type || "GET";
        cpy.data = cpy.data || {};
        cpy.processData = false;

        if(!$aur.noLogin) {
            cpy.data.signature = signData(cpy.data);
            cpy.data.sessid = sess;
            if(!cpy.data.signature && !cpy.data.sessid)
                cpy.data = {};
        } 

        cpy.data = JSON.stringify(cpy.data);

        cpy.success = function(data) {
            if(data.secret)
                setSecret(data.secret);
            pars.success.apply(this, arguments);
        };

        $.ajax(cpy);
    };

    $aur.autoUpdate = function(url, fn, timeout, pars) {
        pars = pars || {};
        pars.url = url;
        pars.success = function(data) {
            var th = window.setTimeout(function() { $aur.autoUpdate(url, fn, timeout, pars); }, timeout);
            fn(data, th);
        };

        $aur.apiCall(pars);
    };

    $aur.storage = { "local": typeof(localStorage) !== undefined };
    $aur.storage.set = function(key, val) {
        if(this.local) 
            localStorage.setItem(key, val);

    };

    $aur.storage.remove = function(key) {
        if(this.local) 
            localStorage.removeItem(key);
    };

    $aur.storage.get = function(key) {
        var item;
        if(this.local) 
            item = localStorage.getItem(key);

        return item;
    };

    $aur.logout = function() {

        var pars = {
            type: "DELETE",
            url: "/logout",
            success: function() {
                $aur.storage.remove("Aurora_Session");
                $aur.storage.remove("Aurora_Secret");
                window.location.href = "/";
            }
        };
        $aur.apiCall(pars);
    };

    $aur.authenticate = function(succ, err, sync) {
        var sessid = $aur.storage.get("Aurora_Session");

        var pars = {
            type: "PUT",
            url: "/login",
            async: !sync,
            data: {sess: sessid},
            success: function(data) {
                if(data[0] !== "success") {
                    if(err) err();
                    return;
                }

                createUser(data);

                if(succ) succ();
            }
        };
        if(sessid)
            $aur.apiCall(pars);
    };

    $aur.login = function(fData, err, succ) {
        var pars = {
            type: "POST",
            url: "/login",
            success: function(data) {
                if(data[0] !== "success") {
                    if(err) err();
                    return;
                }

                createUser(data);

                if(fData.remember)
                    $aur.storage.set("Aurora_Session", data.sess);

                if(succ) succ();
            }
        };
        pars.data = fData;

        $aur.apiCall(pars);
    };

    sess = $aur.storage.get("Aurora_Session");
    secret = $aur.storage.get("Aurora_Secret");

    if((!sess || !secret) && !$aur.noLogin ) {
        sess = undefined;
        secret = undefined;
        $aur.logout();
    }

    $aur.User = $aur.Object.extend({
        username: undefined,
        name: undefined,
        settings: undefined,
        colors: undefined,
        create: function(data) {
            for(var n in data) {
                if(this.hasOwnProperty(n) && data.hasOwnProperty(n) && 
                  typeof(data[n]) !== "function")
                    this[n] = data[n];
            }
        }
    });

    $aur.getUser = function() {
        if(sess === "" || secret === "")
            return;

        var pars = {
            type: "POST",
            url: "/user",
            success: function(data) {
                user = new $aur.User(data);
            }
        };
        $aur.apiCall(pars);
    };

    $aur.getUser();

})($aur);