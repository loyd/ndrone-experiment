"use strict";

import Widget   = require('./widget');
import Smoothie = require('smoothie');

class CPUMEMWidget extends Widget {
    private _cpu: Smoothie.TimeSeries;
    private _mem: Smoothie.TimeSeries;

    constructor(rate: number, canvas: HTMLCanvasElement) {
        super(rate, canvas);

        this._appear();

        this._mem = new Smoothie.TimeSeries();
        this._cpu = new Smoothie.TimeSeries();

        var chart = new Smoothie.SmoothieChart({
            grid : {
                strokeStyle : '#404040'
            },
            labels : {
                precision : 0
            },
            maxValue :  100,
            minValue :    0
        });

        chart.addTimeSeries(this._mem, {
            strokeStyle : 'rgba(0, 0, 255, 1)',
            fillStyle   : 'rgba(0, 0,  64, 0.25)'
        });

        chart.addTimeSeries(this._cpu, {
            strokeStyle : 'rgba(0, 255, 0, 1)',
            fillStyle   : 'rgba(0,  64, 0, 0.25)'
        });

        chart.streamTo(this.canvas, rate);
        chart.addTimeSeries(this._mem);
        chart.addTimeSeries(this._cpu);
    }

    public update(data: {mem: number; cpu: number}) {
        this._mem.append(Date.now(), data.mem);
        this._cpu.append(Date.now(), data.cpu);
    }

    public _appear() {
        this.canvas.width  = window.innerWidth  / 8;
        this.canvas.height = window.innerHeight / 8;

        this.canvas.style.left = 7/16 * window.innerWidth  + 'px';
        this.canvas.style.top  = 7/8  * window.innerHeight + 'px';
    }
}

export = CPUMEMWidget;
