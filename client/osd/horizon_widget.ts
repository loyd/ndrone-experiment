"use strict";

import Widget = require('./widget');

var PI = Math.PI,
    DOUBLE_PI = 2*PI;
class HorizonWidget extends Widget {
    private static _TEXTURES = [
        {path : 'graphics/osd_horizon.png',        factor : 0.4},
        {path : 'graphics/osd_horizon_cursor.png', factor : 0.4},
        {path : 'graphics/osd_horizon_frame.png',  factor : 0.4}
    ];

    constructor(rate:number, canvas: HTMLCanvasElement) {
        super(rate, canvas);
    }

    public update(data: {pitch: number; roll: number}) {
        var cx = this.context;
        var bw = this.textures[0].width,  // base   width
            bh = this.textures[0].height, // base   height
            cw = this.textures[1].width,  // cursor width
            ch = this.textures[1].height, // cursor height
            fw = this.textures[2].width,  // frame  width
            fh = this.textures[2].height, // frame  height

            hbw = bw/2, // half base width

            br = hbw - 2; // base radius, leave 2 pixels for frame

        cx.clearRect(0, 0, bw, bh);
        cx.save();
        cx.translate(hbw, hbw);
        cx.rotate(data.roll);
        cx.beginPath();
        cx.arc(0, 0, br, 0, DOUBLE_PI, true);
        cx.closePath();
        cx.clip();
        cx.drawImage(this.textures[0], -hbw, -bh/2 + data.pitch/PI*bw, bw, bh);
        cx.restore();

        cx.drawImage(this.textures[1], hbw-cw/2, hbw-ch/2, cw, ch);
        cx.drawImage(this.textures[2],        0,        0, fw, fh);
    }

    public _appear() {
        this.canvas.width  = this.textures[2].width;
        this.canvas.height = this.textures[2].height;

        this.canvas.style.left = (window.innerWidth  - this.canvas.width )/2 + 'px';
        this.canvas.style.top  = (window.innerHeight - this.canvas.height)/2 + 'px';

        this.update({pitch : 0, roll : 0});
    }
}

export = HorizonWidget;
