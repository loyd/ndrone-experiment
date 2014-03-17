"use strict";

import Widget = require('./widget');

var PI = Math.PI,
    DOUBLE_PI = 2*PI;
class HorizonWidget extends Widget {
    private static _TEXTURES = {
        body   : {path : 'graphics/osd_horizon.png'},
        cursor : {path : 'graphics/osd_horizon_cursor.png'},
        frame  : {path : 'graphics/osd_horizon_frame.png'}
    };

    private static _BASE_WIDTH  = 1024;
    private static _BASE_HEIGHT = 1024;

    public _textures: {
        body:   HTMLImageElement;
        cursor: HTMLImageElement;
        frame:  HTMLImageElement
    };

    public update(pitch: number, roll: number) {
        var cx = this._context;
        var bw = this._textures.body.width,
            bh = this._textures.body.height,
            cw = this._textures.cursor.width,
            ch = this._textures.cursor.height,
            fw = this._textures.frame.width,
            fh = this._textures.frame.height,

            hbw = bw/2,

            br = hbw - 2;

        cx.clearRect(0, 0, bw, bh);
        cx.save();
        cx.translate(hbw, hbw);
        cx.rotate(roll);
        cx.beginPath();
        cx.arc(0, 0, br, 0, DOUBLE_PI, true);
        cx.closePath();
        cx.clip();
        cx.drawImage(this._textures.body, -hbw, -bh/2 + pitch/PI*bw, bw, bh);
        cx.restore();

        cx.drawImage(this._textures.cursor, hbw-cw/2, hbw-ch/2, cw, ch);
        cx.drawImage(this._textures.frame,         0,        0, fw, fh);
    }

    public _appear() {
        this.canvas.width  = this._textures.frame.width;
        this.canvas.height = this._textures.frame.height;

        this.update(0, 0);
    }
}

export = HorizonWidget;
