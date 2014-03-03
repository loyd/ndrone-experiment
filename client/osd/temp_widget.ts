"use strict";

import Widget   = require('./widget');
import Smoothie = require('smoothie');

class TempWidget extends Widget {
    private outside: Smoothie.TimeSeries;
    private inside:  Smoothie.TimeSeries;

    constructor(rate: number) {
        super(rate);

        this.canvas.width  = window.innerWidth  / 8;
        this.canvas.height = window.innerHeight / 8;

        this.canvas.style.left = 9/16 * window.innerWidth  + 'px';
        this.canvas.style.top  = 7/8  * window.innerHeight + 'px';

        this.outside = new Smoothie.TimeSeries();
        this.inside  = new Smoothie.TimeSeries();

        var chart = new Smoothie.SmoothieChart({
            grid : {
                strokeStyle : '#404040'
            },
            labels : {
                precision : 0
            }
        });

        chart.addTimeSeries(this.outside, {
            strokeStyle : 'rgba(0, 0, 255, 1)',
            fillStyle   : 'rgba(0, 0,  64, 0.25)'
        });

        chart.addTimeSeries(this.inside, {
            strokeStyle : 'rgba(0, 255, 0, 1)',
            fillStyle   : 'rgba(0,  64, 0, 0.25)'
        });

        chart.streamTo(this.canvas, rate);
        chart.addTimeSeries(this.outside);
        chart.addTimeSeries(this.inside);
    }

    public update(data: {inside: number; outside: number}) {
        this.outside.append(Date.now(), data.outside);
        this.inside .append(Date.now(), data.inside);
    }
}

export = TempWidget;
