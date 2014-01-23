"use strict";

import Widget   = require('./widget');
import Smoothie = require('smoothie');

class CPUMEMWidget extends Widget {
    private cpu: Smoothie.TimeSeries;
    private mem: Smoothie.TimeSeries;

    constructor(rate: number) {
        super(rate);

        this.canvas.width  = innerWidth  / 8;
        this.canvas.height = innerHeight / 8;

        this.canvas.style.left = 7/16 * innerWidth  + 'px';
        this.canvas.style.top  = 7/8  * innerHeight + 'px';

        this.mem = new Smoothie.TimeSeries();
        this.cpu = new Smoothie.TimeSeries();

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

        chart.addTimeSeries(this.mem, {
            strokeStyle : 'rgba(0, 0, 255, 1)',
            fillStyle   : 'rgba(0, 0,  64, 0.25)'
        });

        chart.addTimeSeries(this.cpu, {
            strokeStyle : 'rgba(0, 255, 0, 1)',
            fillStyle   : 'rgba(0,  64, 0, 0.25)'
        });

        chart.streamTo(this.canvas, rate);
        chart.addTimeSeries(this.mem);
        chart.addTimeSeries(this.cpu);
    }

    public update(data: {mem: number; cpu: number}) {
        this.mem.append(Date.now(), data.mem);
        this.cpu.append(Date.now(), data.cpu);
    }
}

export = CPUMEMWidget;
