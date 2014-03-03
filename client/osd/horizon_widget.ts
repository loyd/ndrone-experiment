"use strict";

import Widget = require('./widget');

var PI  = Math.PI,
    dPI = 2*Math.PI;
class HorizonWidget extends Widget {
    constructor(rate:number, options: {path: string; width?: number; height?: number}[]) {
        super(rate, options);
    }

    public update(data: {pitch: number; roll: number}) {
        var cx: CanvasRenderingContext2D = this.context;
        var bw: number = this.textures[0].width,
            bh: number = this.textures[0].height,
            cw: number = this.textures[1].width,
            ch: number = this.textures[1].height,
            fw: number = this.textures[2].width,
            fh: number = this.textures[2].height,

            hbw: number = bw/2;

        cx.clearRect(0, 0, bw, bh);
        cx.save();
        cx.translate(hbw, hbw);
        cx.rotate(data.roll);
        cx.beginPath();
        cx.arc(0, 0, hbw-2, 0, dPI, true);
        cx.closePath();
        cx.clip();
        cx.drawImage(this.textures[0], -hbw, -bh/2 + data.pitch/PI*bw, bw, bh);
        cx.restore();
        cx.drawImage(this.textures[1], hbw-cw/2, hbw-ch/2, cw, ch);
        cx.drawImage(this.textures[2],        0,        0, fw, fh);
    }

    public appear() {
        console.log(this.textures[2].width, this.textures[2].height);
        this.canvas.width  = this.textures[2].width;
        this.canvas.height = this.textures[2].height;

        this.canvas.style.left = (window.innerWidth  - this.canvas.width )/2 + 'px';
        this.canvas.style.top  = (window.innerHeight - this.canvas.height)/2 + 'px';

        this.update({pitch : 0, roll : 0});
    }
}

export = HorizonWidget;
