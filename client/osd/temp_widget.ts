"use strict";

import Widget = require('./widget');
var Smoothie  = require('smoothie');

class TempWidget extends Widget {
    private outside: any;
    private inside:  any;

    constructor(rate: number) {
        super(rate);

        this.canvas.width  = innerWidth/8;
        this.canvas.height = innerHeight/8;

        this.canvas.style.left = 9/16*innerWidth  + 'px';
        this.canvas.style.top  = 7/8 *innerHeight + 'px';

        this.outside = new Smoothie.TimeSeries();
        this.inside  = new Smoothie.TimeSeries();

        var chart: any = new Smoothie.SmoothieChart({
            grid : {
                strokeStyle : '#404040'
            },
            labels : {
                precision : 0
            }
        });

        chart.addTimeSeries(this.outside, {
            strokeStyle : '#0000FF',
            lineWidth   : 2,
            fillStyle   : 'rgba(0, 0, 64, 0.25)'
        });

        chart.addTimeSeries(this.inside, {
            strokeStyle : '#00FF00',
            lineWidth   : 2,
            fillStyle   : 'rgba(0, 64, 0, 0.25)'
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
