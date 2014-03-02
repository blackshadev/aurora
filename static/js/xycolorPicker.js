var XYPicker = (function() {

    function XYPicker(canvas, oPar) {
        this.canvas = canvas;
        if(typeof(this.canvas) === "string" )
            this.canvas = document.getElementById(canvas);
        this.ctx = this.canvas.getContext("2d");
        this.imageData = null;
        this.active = false;
        this.dragging = false;
        this.selectOnDrag = false;

        this.slider = {};
        this.space = {};

        for(var key in oPar)
           this[key] = oPar[key];

       this.defaults();


        var self = this;
        /* mouse */
        this.canvas.onmousedown = function(ev) { self.doDragStart(ev); };
        this.canvas.onmouseup = function(ev) { self.doDragEnd(ev); };
        this.canvas.onmousemove = function(ev) { self.doDrag(ev); };

        this.canvas.onclick = function(ev) { console.log(ev); self.doClick(ev); };
        this.canvas.onresize = function() { self.draw(true); };
        
    }
    XYPicker.prototype.doDragStart = function(ev) {
        this.dragging = true;

        this.doClick(ev);
    };
    XYPicker.prototype.doDragEnd = function() {
        this.dragging = false;
    };
    XYPicker.prototype.doDrag = function(ev) {
        if(this.dragging)
            this.doClick(ev);
    };
    XYPicker.prototype.defaults = function() {
        
        this.slider.offset = this.slider.offset || {x : 0, y: 5};
        this.slider.height = this.slider.height || 25;

        this.selected = this.selected || [0,0,1];

        var defaultCursor = { 
            r: 9,
            w: 5,
            c: "#000"
        };

        this.cursor = this.cursor || defaultCursor;
    };
    XYPicker.prototype.start = function() {
        this.active = true;

        this.spaceDim = Math.min(this.canvas.width, this.canvas.height - 
            (this.slider.offset.y + this.slider.height + 5));
        this.sliderOffset = this.spaceDim + this.slider.offset.y;

        this.createImage();
        this.createSlider();
        this.draw();
    };
    XYPicker.prototype.createImage = function() {
        this.setRGBSpace("hue");

        var width = this.spaceDim;
        var height = this.spaceDim;
        var img = this.ctx.createImageData(width, height);

        for(var i = 0; i < img.data.length; i += 4) {
            var j = i / 4;
            
            var x = (j % width);
            var y = Math.ceil(j / width);
            y = width - y;


            var XY = [ 
                x / width,
                y / height
                ];
            var rgb = this.xyToRgb(XY[0], XY[1]);

            img.data[i + 0] = rgb[0];   // r
            img.data[i + 1] = rgb[1];   // g
            img.data[i + 2] = rgb[2];   // b
            img.data[i + 3] = 255;      // a
        }

        this.space.data = img;
    };
    XYPicker.prototype.createSlider = function() {
        var w = this.spaceDim - this.slider.offset.x;
        var img = this.ctx.createImageData(w, this.slider.height);
        var XY = this.selected;
        var i;

        var sliderPixels = [];
        sliderPixels.length = this.spaceDim;

        for(i = 0; i < sliderPixels.length; i++)
            sliderPixels[i] = this.xyToRgb(XY[0], XY[1], i / sliderPixels.length);

        for(i = 0; i < img.data.length; i += 4) {
            var x = ( i / 4 ) % this.spaceDim;

            var rgb = sliderPixels[x];

            img.data[i + 0] = rgb[0];   // r
            img.data[i + 1] = rgb[1];   // g
            img.data[i + 2] = rgb[2];   // b
            img.data[i + 3] = 255;      // a
        }

        this.slider.data = img;
    };
    XYPicker.prototype.draw = function(isClear) {
        var w = this.spaceDim;
        var h = this.spaceDim;

        if(!isClear) // reset canvas
            this.canvas.width = w;

        this.createSlider();

        this.ctx.putImageData(this.space.data, 0, 0);
        this.ctx.putImageData(this.slider.data, 0, 
            this.sliderOffset);

        var xy = this.selected;
        if(xy.length < 1) return;

        /* Space cursor */
        this.ctx.beginPath();
        this.ctx.lineWidth = "4";
        this.ctx.strokeStyle = "#000";
        this.drawCursor(this.cursor,
            xy[0] * w, h - (xy[1] * h));
        this.ctx.stroke();

        /* Slider cursor */
        this.ctx.beginPath();
        this.ctx.lineWidth = "4";
        this.ctx.strokeStyle = "#000";
        this.drawCursor(this.cursor, 
            xy[2] * w, this.sliderOffset + this.slider.height/2);
        this.ctx.stroke();
    };
    XYPicker.prototype.drawCursor = function(cursor, x, y) {
        this.ctx.beginPath();
        this.ctx.lineWidth = cursor.w;
        this.ctx.strokeStyle = cursor.c;

        this.ctx.arc(x, y, cursor.r, 0, 2 * Math.PI);
        this.ctx.closePath();
    };
    XYPicker.prototype.xyToRgb = function(x, y, bri) {
        var z = 1.0 - x - y;
        
        var Y = bri === undefined ? 1.0 : bri;
        var X = y > 0 ? ( Y / y ) * x : 1.0;
        var Z = y > 0 ? ( Y / y ) * z : 1.0;

        var RGB = this.XYZtoRGB(X, Y, Z);
        var r = RGB[0];
        var g = RGB[1];
        var b = RGB[2];

        // Normalize
        var maxValue = Math.max(r, g, b);
        if (maxValue > 1) {
            r /= maxValue;
            g /= maxValue;
            b /= maxValue;
        }

        // No negatives allowed
        r = Math.max(r, 0);
        g = Math.max(g, 0);
        b = Math.max(b, 0);

        return [r * 255, g * 255, b * 255];
    };
    XYPicker.prototype.setRGBSpace = function(name) {
        // some other RGB matrices
        // var r =  X * 1.612 - Y * 0.203 - Z * 0.302;
        // var g = -X * 0.509 + Y * 1.412 + Z * 0.066;
        // var b =  X * 0.026 - Y * 0.072 + Z * 0.962;

        
        // var r =  0.8951    * X + 0.2664   * Y - 0.1614 * Z;
        // var g = -0.7502   * X + 1.7135   * Y + 0.0367 * Z;
        // var b =  0.0389 * X - 0.0685 * Y + 1.0296  * Z;

        switch(name) {
            case "hue": case "philips":
                this.XYZtoRGB = function(X, Y, Z) {
                    var r =  3.2406 * X - 1.5372 * Y - 0.4986 * Z;
                    var g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
                    var b =  0.0557 * X - 0.204 * Y + 1.057 * Z;

                    r = r <= 0.0031308 ? 12.92 * r :  (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
                    g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
                    b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
                    
                    return [r, g, b];
                };
                break;
            case "PAL": case "SECAM": case "sRGB":
                this.XYZtoRGB = function(X, Y, Z) {
                    var r =  3.0629 * X - 1.3932 * Y - 0.4758 * Z;
                    var g = -0.9693 * X + 1.8760 * Y + 0.0416 * Z;
                    var b =  0.0679 * X - 0.2289 * Y + 1.0694 * Z;

                    r = r <= 0.018 ? 4.5 * r : (1.0 + 0.099) * Math.pow(r, (0.45)) - 0.099;
                    g = g <= 0.018 ? 4.5 * g : (1.0 + 0.099) * Math.pow(g, (0.45)) - 0.099;
                    b = b <= 0.018 ? 4.5 * b : (1.0 + 0.099) * Math.pow(b, (0.45)) - 0.099;
                    return [r, g, b];
                };
            break;
            default:
            case "wide gamut": 
                this.XYZtoRGB = function(X, Y, Z) {
                    var r =  1.4625 * X - 0.1845 * Y - 0.2734 * Z;
                    var g = -0.5228 * X + 1.4479 * Y + 0.0681 * Z;
                    var b =  0.0346 * X - 0.0958 * Y + 1.2875 * Z;

                    r = r <= 0.0031308 ? 12.92 * r :  (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
                    g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
                    b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
                    return [r, g, b];
                };
                break;
        }
    };
    XYPicker.prototype.doClick = function(ev) {
        var x = (ev.offsetX - this.canvas.offsetLeft);
        var y = (ev.offsetY - this.canvas.offsetTop);
        var xy = [x,y];
        
        /* Cursor offset */
        xy[0] += this.cursor.r;
        xy[1] += this.cursor.r;


        if(this.onClick)
            this.onClick(xy, ev);

        /* Inside the color space */
        if(xy[0] < this.spaceDim && xy[1] < this.spaceDim) {
            

            xy[0] /= this.canvas.width;
            xy[1] = (this.spaceDim - xy[1]) / this.spaceDim;

            this.doSelect(xy[0], xy[1]);
        }

        /* Brightness slider */
        if(xy[1] > this.sliderOffset && xy[1] < this.sliderOffset + this.slider.height) {
            this.doSelect(this.selected[0], this.selected[1], xy[0] / this.spaceDim);
        }
    };
    XYPicker.prototype.doSelect = function(x, y, bri) {
        var canSelect = (this.selectOnDrag && this.dragging || !this.dragging);
        bri = bri === undefined ? this.selected[2] : bri;
        this.selected = [x, y, bri];

        this.draw();

        if(this.onSelect && canSelect)
            this.onSelect(this.selected);
    };

    return XYPicker;
})();