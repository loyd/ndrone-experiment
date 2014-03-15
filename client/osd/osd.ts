"use strict";

import CompassWidget = require('./compass_widget');
import HorizonWidget = require('./horizon_widget');
import CPUMEMWidget  = require('./cpumem_widget');
import LoadWidget    = require('./load_widget');
import TempWidget    = require('./temp_widget');

var atan2 = Math.atan2,
    asin  = Math.asin;
function quaternionToEuler(quaternion: number[]) {
    var q1 = quaternion[0],
        q2 = quaternion[1],
        q3 = quaternion[2],
        q4 = quaternion[3];

    var
        yaw   =  atan2(2*(q2*q3 - q1*q4), 2*(q1*q1 + q2*q2) - 1),
        pitch =  -asin(2*(q2*q4 + q1*q3)),
        roll  =  atan2(2*(q3*q4 - q1*q2), 2*(q1*q1 + q4*q4) - 1);

    return [yaw, pitch, roll];
}

class OSD {
    private compass: CompassWidget;
    private horizon: HorizonWidget;
    private cpumem:  CPUMEMWidget;
    private load:    LoadWidget;
    private temp:    TempWidget;

    constructor(rate: number,
                elements: {
                    compass: HTMLCanvasElement;
                    horizon: HTMLCanvasElement;
                    cpumem:  HTMLCanvasElement;
                    load:    HTMLCanvasElement;
                    temp:    HTMLCanvasElement;}) {
        this.compass = new CompassWidget(rate, elements.compass);
        this.horizon = new HorizonWidget(rate, elements.horizon);
        this.cpumem  = new  CPUMEMWidget(rate, elements.cpumem);
        this.load    = new    LoadWidget(rate, elements.load);
        this.temp    = new    TempWidget(rate, elements.temp);
    }

    public update(quaternion: number[], temp: number[], load: number[], mem: number, cpu: number) {
        var angles = quaternionToEuler(quaternion);

        this.compass.update({yaw   : angles[0]});
        this.horizon.update({pitch : angles[1], roll : angles[2]});

        this.cpumem.update({cpu : cpu, mem : mem});
        this.load  .update({one : load[0], five : load[1], fifteen : load[2]});
        this.temp  .update({outside : temp[0], inside : temp[1]});
    }
}

export = OSD;
