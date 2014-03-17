"use strict";

import assert = require('assert');
import config = require('../../config');

import MadgwickAHRS = require('../../libs/madgwick_ahrs');

import L3G4200D = require('../../libs/sensors/l3g4200d');
import ADXL345  = require('../../libs/sensors/adxl345');
import HMC5883L = require('../../libs/sensors/hmc5883l');
import BMP085   = require('../../libs/sensors/bmp085');

//           gyro    accel     magn          delta time
var raw = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1/config.MAIN_FREQUENCY];

var filter = new MadgwickAHRS;
setInterval(() => {
    filter.update.apply(filter, raw);
    process.send(filter.quaternion);
    raw[0] = raw[1] = raw[2] = 0;
}, 1/config.MAIN_FREQUENCY);

//#XXX: improve Sensor#stream interface

var gyro = new L3G4200D(config.GY80_I2C_BUS, {rate : config.L3G4200D_RATE});
gyro.stream('velocity', 1/gyro.rate, (err, wx, wy, wz, dt) => {
    if(err) throw err;
    raw[0] += wx * dt;
    raw[1] += wy * dt;
    raw[2] += wz * dt;
});

var accel = new ADXL345(config.GY80_I2C_BUS, {rate : config.ADXL345_RATE});
accel.stream('acceleration', 1/accel.rate, (err, ax, ay, az) => {
    if(err) throw err;
    raw[3] = ax;
    raw[4] = ay;
    raw[5] = az;
});

var magn = new HMC5883L(config.GY80_I2C_BUS, {rate : config.HMC5883L_RATE});
magn.stream('induction', 1/magn.rate, (err, mx, my, mz) => {
    if(err) throw err;
    raw[6] = mx;
    raw[7] = my;
    raw[8] = mz; 
});
