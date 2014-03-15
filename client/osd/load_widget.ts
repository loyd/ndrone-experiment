"use strict";

import Widget   = require('./widget');
import Smoothie = require('smoothie');

class LoadWidget extends Widget {
    private _fifteen: Smoothie.TimeSeries;
    private _five:    Smoothie.TimeSeries;
    private _one:     Smoothie.TimeSeries;

    constructor(rate: number, canvas: HTMLCanvasElement) {
        super(rate, canvas);

        this._appear();

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

        chart.streamTo(this.canvas, rate);
        chart.addTimeSeries(this._fifteen);
        chart.addTimeSeries(this._five);
        chart.addTimeSeries(this._one);
    }

    public update(data: {one: number; five: number; fifteen: number}) {
        this._fifteen.append(Date.now(), data.fifteen);
        this._five   .append(Date.now(), data.five);
        this._one    .append(Date.now(), data.one);
    }

    public _appear() {
        this.canvas.width  = window.innerWidth  / 8;
        this.canvas.height = window.innerHeight / 8;

        this.canvas.style.left = 5/16 * window.innerWidth + 1  + 'px';
        this.canvas.style.top  = 7/8  * window.innerHeight     + 'px';
    }
}

export = LoadWidget;
