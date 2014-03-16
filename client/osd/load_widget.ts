"use strict";

import Widget   = require('./widget');
import Smoothie = require('smoothie');

class LoadWidget extends Widget {
    private _fifteen: Smoothie.TimeSeries;
    private _five:    Smoothie.TimeSeries;
    private _one:     Smoothie.TimeSeries;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this._fifteen = new Smoothie.TimeSeries();
        this._five    = new Smoothie.TimeSeries();
        this._one     = new Smoothie.TimeSeries();

        var chart = new Smoothie.SmoothieChart({
            grid : {
                strokeStyle : '#404040'
            },
            labels : {
                precision : 2
            },
            maxValue :  2.55,
            minValue :    0
        });

        chart.addTimeSeries(this._fifteen, {
            strokeStyle : 'rgba(0, 0, 64, 1)',
            fillStyle   : 'rgba(0, 0, 32, 0.25)'
        });

        chart.addTimeSeries(this._five, {
            strokeStyle : 'rgba(0, 64, 0, 1)',
            fillStyle   : 'rgba(0, 32, 0, 0.25)'
        });

        chart.addTimeSeries(this._one, {
            strokeStyle : 'rgba(255, 0, 0, 1)',
            fillStyle   : 'rgba( 64, 0, 0, 0.25)'
        });

        chart.streamTo(this.canvas);
        chart.addTimeSeries(this._fifteen);
        chart.addTimeSeries(this._five);
        chart.addTimeSeries(this._one);
    }

    public update(data: number[]) {
        this._fifteen.append(Date.now(), data[0]);
        this._five.append(Date.now(), data[1]);
        this._one.append(Date.now(), data[2]);
    }
}

export = LoadWidget;
