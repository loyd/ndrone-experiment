"use strict";

import Widget   = require('./widget');
import Smoothie = require('smoothie');

class CPUMEMWidget extends Widget {
    private _cpu: Smoothie.TimeSeries;
    private _mem: Smoothie.TimeSeries;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this._mem = new Smoothie.TimeSeries();
        this._cpu = new Smoothie.TimeSeries();

        var chart = new Smoothie.SmoothieChart({
            grid : {
                strokeStyle : '#404040'
            },
            labels : {
                precision : 0
            },
            maxValue : 1,
            minValue : 0
        });

        chart.addTimeSeries(this._mem, {
            strokeStyle : 'rgba(0, 0, 255, 1)',
            fillStyle   : 'rgba(0, 0,  64, 0.25)'
        });

        chart.addTimeSeries(this._cpu, {
            strokeStyle : 'rgba(0, 255, 0, 1)',
            fillStyle   : 'rgba(0,  64, 0, 0.25)'
        });

        chart.streamTo(this.canvas);
        chart.addTimeSeries(this._mem);
        chart.addTimeSeries(this._cpu);
    }

    public update(mem: number, cpu: number) {
        this._mem.append(Date.now(), mem);
        this._cpu.append(Date.now(), cpu);
    }
}

export = CPUMEMWidget;
