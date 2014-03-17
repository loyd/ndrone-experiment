"use strict";

import Widget   = require('./widget');
import Smoothie = require('smoothie');

class TempWidget extends Widget {
    private _outside: Smoothie.TimeSeries;
    private _inside:  Smoothie.TimeSeries;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this._outside = new Smoothie.TimeSeries();
        this._inside  = new Smoothie.TimeSeries();

        var chart = new Smoothie.SmoothieChart({
            grid : {
                strokeStyle : '#404040'
            },
            labels : {
                precision : 0
            }
        });

        chart.addTimeSeries(this._outside, {
            strokeStyle : 'rgba(0, 0, 255, 1)',
            fillStyle   : 'rgba(0, 0,  64, 0.25)'
        });

        chart.addTimeSeries(this._inside, {
            strokeStyle : 'rgba(0, 255, 0, 1)',
            fillStyle   : 'rgba(0,  64, 0, 0.25)'
        });

        chart.streamTo(this.canvas);
        chart.addTimeSeries(this._outside);
        chart.addTimeSeries(this._inside);
    }

    public update(data: {inside: number; outside: number}) {
        this._outside.append(Date.now(), data.outside);
        this._inside.append(Date.now(), data.inside);
    }
}

export = TempWidget;
