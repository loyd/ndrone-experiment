"use strict";

import Widget   = require('./widget');
import Smoothie = require('smoothie');

class LoadWidget extends Widget {
    private fifteen: Smoothie.TimeSeries;
    private five:    Smoothie.TimeSeries;
    private one:     Smoothie.TimeSeries;

    constructor(rate: number) {
        super(rate);

        this.canvas.width  = window.innerWidth  / 8;
        this.canvas.height = window.innerHeight / 8;

        this.canvas.style.left = 5/16 * window.innerWidth + 1  + 'px';
        this.canvas.style.top  = 7/8  * window.innerHeight     + 'px';

        this.fifteen = new Smoothie.TimeSeries();
        this.five    = new Smoothie.TimeSeries();
        this.one     = new Smoothie.TimeSeries();

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

        chart.addTimeSeries(this.fifteen, {
            strokeStyle : 'rgba(0, 0, 64, 1)',
            fillStyle   : 'rgba(0, 0, 32, 0.25)'
        });

        chart.addTimeSeries(this.five, {
            strokeStyle : 'rgba(0, 64, 0, 1)',
            fillStyle   : 'rgba(0, 32, 0, 0.25)'
        });

        chart.addTimeSeries(this.one, {
            strokeStyle : 'rgba(255, 0, 0, 1)',
            fillStyle   : 'rgba( 64, 0, 0, 0.25)'
        });

        chart.streamTo(this.canvas, rate);
        chart.addTimeSeries(this.fifteen);
        chart.addTimeSeries(this.five);
        chart.addTimeSeries(this.one);
    }

    public update(data: {one: number; five: number; fifteen: number}) {
        this.fifteen.append(Date.now(), data.fifteen);
        this.five   .append(Date.now(), data.five);
        this.one    .append(Date.now(), data.one);
    }
}

export = LoadWidget;
