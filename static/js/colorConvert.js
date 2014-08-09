(function($aur) {

    // convert the state to rgb
    $aur.ConvertColor = function(l, str) {
        if(str === undefined) str = true;

        var rgb = $aur.ConvertColor[l.state.colormode + "_rgb"](l);

        return str ? 
                "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")"
               : rgb; 
    };

    // warning, obscure code from philips ahead
    $aur.ConvertColor.xy_rgb = function(l) {
        var xy = l.state.xy;
        var a = xy[0], b = xy[1], c = (l.state.bri + 5) / 260

        var d = 1 - a - b,
            e = c,
            f = e / b * a,
            g = e / b * d,
            h = 3.2406 * f - 1.5372 * e - .4986 * g,
            i = .9689 * -f + 1.8758 * e + .0415 * g,
            j = .0557 * f - .204 * e + 1.057 * g;
        h > j && h > i && h > 1 ? (i /= h, j /= h, h = 1) : i > j && i > h && i > 1 ? (h /= i, j /= i, i = 1) : j > h && j > i && j > 1 && (h /= j, i /= j, j = 1), h = .0031308 >= h ? 12.92 * h : 1.055 * Math.pow(h, 1 / 2.4) - .055, i = .0031308 >= i ? 12.92 * i : 1.055 * Math.pow(i, 1 / 2.4) - .055, j = .0031308 >= j ? 12.92 * j : 1.055 * Math.pow(j, 1 / 2.4) - .055, h > j && h > i ? h > 1 && (i /= h, j /= h, h = 1) : i > j && i > h ? i > 1 && (h /= i, j /= i, i = 1) : j > h && j > i && j > 1 && (h /= j, i /= j, j = 1);
        var k = {};
        return k.r = Math.floor(Math.max(0, h) * 255), k.g = Math.floor(Math.max(0, i) * 255), k.b = Math.floor(Math.max(0, j) * 255), k
        
    };
     
    $aur.ConvertColor.hs_rgb = function(l) {
        var a = l.state.hue,
            b = l.state.sat,
            c = l.raw.modelid;

        var d = b / 254,
            e = a >> 8 & 255,
            f = 255 & a,
            g = "LLC";

        (0 === c.indexOf("LCT") || 0 === c.indexOf("LLM")) && (g = "LCT");
        var h = e + 1;
        h > 255 && (h = 0);
        var i = q[g][e] + (q[g][h] - q[g][e]) * (f / 256),
            j = r[g][e] + (r[g][h] - r[g][e]) * (f / 256),
            k = p[g].x - i,
            l = p[g].y - j;
        i += k * (1 - d), j += l * (1 - d);
        
        l.state.xy = [i,j];

        return $aur.ConvertColor.xy_rgb(l)
    };
    $aur.ConvertColor.ct_rgb = function(l) {
        var a = l.state.ct, b = 0, s = $aur.Const.PhiCTColor, t = $aur.Const.PhiCTTemp;
        b = Math.floor((a - 128 + 1) / 2), 0 > b ? b = 0 : b >= s.length && (b = s.length - 1);
        l.state.xy = [s[b] / 65535, t[b] / 65535 ];
        return $aur.ConvertColor.xy_rgb(l)
    };


})($aur);