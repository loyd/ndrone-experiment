"use strict";

import Widget = require('./widget');

class CompassWidget extends Widget {
    private static _TEXTURES = [
        {path : 'graphics/osd_compass.png',        factor : 0.4},
        {path : 'graphics/osd_compass_cursor.png', factor : 0.4}
    ];

    constructor(rate: number, canvas: HTMLCanvasElement) {
        super(rate, canvas);
    }

    public update(data: {yaw: number}) {
        var cx = this.context,
            bw = this.textures[0].width,  // base width
            bh = this.textures[0].height, // base height
            cw = this.textures[1].width,  // cursor width
            ch = this.textures[1].height, // cursor height
            
            a   = (ch-bh)/2,        // angle position
            b   = data.yaw/Math.PI, // leftovers
            qbw = bw/4;             // quarter base width

        cx.clearRect(0, 0, bw, ch);
        cx.drawImage(this.textures[0],   qbw*(b + 1), a, bw, bh);
        cx.drawImage(this.textures[0],   qbw*(b - 3), a, bw, bh);
        cx.drawImage(this.textures[1], (bw/2 - cw)/2, 0, cw, ch);
    }

    public _appear() {
        this.canvas.width  = this.textures[0].width/2;
        this.canvas.height = this.textures[1].height;

        this.canvas.style.left = (window.innerWidth - this.canvas.width)/2 + 'px';
        this.canvas.style.top  = 0 + 'px';

        this.update({yaw : 0});
    }
}

export = CompassWidget;
