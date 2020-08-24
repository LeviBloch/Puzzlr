// adapted from https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/

const RandomColor = {
    GOLDEN_RATIO_CONJUGATE: 0.618033988749895,
    hue: Math.random(),
    getRandomColor: function() {
        this.hue += this.GOLDEN_RATIO_CONJUGATE;
        this.hue %= 1;
        return(this.hsvToRgb(this.hue, 0.6, 0.95));
    },
    /*
    * Converts an HSV color value to RGB. Conversion formula
    * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
    * Assumes h, s, and v are contained in the set [0, 1] and
    * returns r, g, and b in the set [0, 255].
    */
    hsvToRgb: function(h, s, v) {
        var r, g, b;

        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        switch(i % 6){
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }

        return [r * 255, g * 255, b * 255];
    }
}

export default RandomColor;
