"use strict";

import Widget = require('./widget');

class CompassWidget extends Widget {
    private static _TEXTURES = {
        body   : {path : 'graphics/osd_compass.png'},
        cursor : {path : 'graphics/osd_compass_cursor.png'}
    };

    private static _BASE_WIDTH  = 1042;
    private static _BASE_HEIGHT =  220;

    public _textures: {
        body:   HTMLImageElement;
        cursor: HTMLImageElement;
    }

    public update(yaw: number) {
        var cx = this._context,
            bw = this._textures.body.width,
            bh = this._textures.body.height,
            cw = this._textures.cursor.width,
            ch = this._textures.cursor.height,
            
            a   = (ch-bh)/2,   // angle position
            b   = yaw/Math.PI, // texture leftover
            qbw = bw/4;

        cx.clearRect(0, 0, bw, ch);
        cx.drawImage(this._textures.body,   qbw*(b + 1), a, bw, bh);
        cx.drawImage(this._textures.body,   qbw*(b - 3), a, bw, bh);
        cx.drawImage(this._textures.cursor, (bw/2 - cw)/2, 0, cw, ch);
    }

    public _appear() {
        this.canvas.width  = this._textures.body  .width/2;
        this.canvas.height = this._textures.cursor.height;

        this.update(0);
    }
}

export = CompassWidget;
