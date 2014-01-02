"use strict";

import Widget = require('./widget');
var Smoothie = require('smoothie');

class LoadWidget extends Widget {
    private fifteen: any;
    private five:    any;
    private one:     any;

    constructor(rate: number) {
        super(rate);

        this.canvas.width  = innerWidth/8;
        this.canvas.height = innerHeight/8;

        this.canvas.style.left = 5/16*innerWidth  + 'px';
        this.canvas.style.top  = 7/8 *innerHeight + 'px';

        this.fifteen = new Smoothie.TimeSeries();
        this.five    = new Smoothie.TimeSeries();
        this.one     = new Smoothie.TimeSeries();

        var chart: any = new Smoothie.SmoothieChart({
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
            strokeStyle : 'rgba(0, 0, 255, 0.25)',
            fillStyle   : 'rgba(0, 0,  64, 0.25)'
        });

        chart.addTimeSeries(this.five, {
            strokeStyle : 'rgba(0, 255, 0, 0.25)',
            fillStyle   : 'rgba(0,  64, 0, 0.25)'
        });

        chart.addTimeSeries(this.one, {
            strokeStyle : 'rgba(255, 0, 0, 0.25)',
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
