"use strict";

import Widget = require('./widget');

class CompassWidget extends Widget {
    constructor(rate: number, options: {path: string; width?: number; height?: number}[]) {
        super(rate, options);

        this.canvas.width  = this.textures[0].width/2;
        this.canvas.height = this.textures[1].height;

        this.canvas.style.left = (window.innerWidth - this.canvas.width)/2 + 'px';
        this.canvas.style.top  = 0 + 'px';
    }

    public update(data: {yaw: number}) {
        var cx: CanvasRenderingContext2D = this.context,
            bw: number = this.textures[0].width,
            bh: number = this.textures[0].height,
            cw: number = this.textures[1].width,
            ch: number = this.textures[1].height,
            
            a:   number = (ch-bh)/2,
            b:   number = data.yaw/Math.PI,
            qbw: number = bw/4;

        cx.clearRect(0, 0, bw, ch);
        cx.drawImage(this.textures[0],   qbw*(b + 1), a, bw, bh);
        cx.drawImage(this.textures[0],   qbw*(b - 3), a, bw, bh);
        cx.drawImage(this.textures[1], (bw/2 - cw)/2, 0, cw, ch);
    }
}

export = CompassWidget;
