"use strict";

import CompassWidget = require('./compass_widget');
import HorizonWidget = require('./horizon_widget');
import CPUMEMWidget  = require('./cpumem_widget');
import LoadWidget    = require('./load_widget');
import TempWidget    = require('./temp_widget');

var atan2 = Math.atan2,
    asin  = Math.asin;
function quaternionToEuler(quaternion: number[]) {
    var q1: number = quaternion[0],
        q2: number = quaternion[1],
        q3: number = quaternion[2],
        q4: number = quaternion[3];

    var
        yaw:   number =  atan2(2*(q2*q3 - q1*q4), 2*(q1*q1 + q2*q2) - 1),
        pitch: number =  -asin(2*(q2*q4 + q1*q3)),
        roll:  number =  atan2(2*(q3*q4 - q1*q2), 2*(q1*q1 + q4*q4) - 1);

    return [yaw, pitch, roll];
}

class OSD {
    private compass: CompassWidget;
    private horizon: HorizonWidget;
    private cpumem:  CPUMEMWidget;
    private load:    LoadWidget;
    private temp:    TempWidget;

    constructor(rate: number) {
        this.compass = new CompassWidget(rate, [
                                          {path:'graphics/osd_compass.png',        factor:0.4},
                                          {path:'graphics/osd_compass_cursor.png', factor:0.4}]);
        this.horizon = new HorizonWidget(rate, [
                                          {path:'graphics/osd_horizon.png',        factor:0.4},
                                          {path:'graphics/osd_horizon_cursor.png', factor:0.4},
                                          {path:'graphics/osd_horizon_frame.png',  factor:0.4}]);
        this.cpumem = new CPUMEMWidget(rate);
        this.load   = new LoadWidget(rate);
        this.temp   = new TempWidget(rate);

        this.update([1, 0, 0, 0], [0, 0], [0, 0, 0], 50, 50);
    }

    public update(quaternion: number[], temp: number[], load: number[], mem: number, cpu: number) {
        var angles: number[] = quaternionToEuler(quaternion);

        this.compass.update({yaw   : angles[0]});
        this.horizon.update({pitch : angles[1], roll : angles[2]});

        this.cpumem.update({cpu : cpu, mem : mem});
        this.load  .update({one : load[0], five : load[1], fifteen : load[2]});
        this.temp  .update({outside : temp[0], inside : temp[1]});
    }
}

export = OSD;
