"use strict";

/**
 * Madgwick filter for AHRS.
 * {@link http://www.x-io.co.uk/res/doc/madgwick_internal_report.pdf}
 */
class MadgwickAHRS {

    /** Current state */
    public quaternion: number[] = [1, 0, 0, 0];

    constructor(public gain: number = 0.1) {
        if(!(0 < gain && gain < 1))
            throw new RangeError('gain must be between 0 and 1 exclusive');
    }

    /**
     * Update current state using measurements of sensors and delta of time.
     * Optimized for minimal arithmetic.
     * + 75    - 85    * 190    / 4    √ 5
     */
    public update(gx: number, gy: number, gz: number,
                  ax: number, ay: number, az: number,
                  mx: number, my: number, mz: number, time: number) {
        var invNorm: number, sqrt = Math.sqrt, q = this.quaternion,
            q0 = q[0], q1 = q[1], q2 = q[2], q3 = q[3], gain = this.gain,
            s0: number, s1: number, s2: number, s3: number,
            qDot1: number, qDot2: number, qDot3: number, qDot4: number,
            hx: number, hy: number,
            _2q0mx: number, _2q0my: number, _2q0mz: number, _2q1mx: number,
            _2bx: number, _2bz: number, _4bx: number, _4bz: number,
            _2q0: number, _2q1: number, _2q2: number, _2q3: number,
            _2q0q2: number, _2q2q3: number,
            q0q0: number, q0q1: number, q0q2: number, q0q3: number, q1q1: number,
            q1q2: number, q1q3: number, q2q2: number, q2q3: number, q3q3: number;

        // Rate of change of quaternion from gyroscope
        qDot1 = .5 * (-q1 * gx - q2 * gy - q3 * gz);
        qDot2 = .5 * ( q0 * gx + q2 * gz - q3 * gy);
        qDot3 = .5 * ( q0 * gy - q1 * gz + q3 * gx);
        qDot4 = .5 * ( q0 * gz + q1 * gy - q2 * gx);

        // Avoid NaN in accelerometer normalisation
        if(!(ax === 0 && ay === 0 && az === 0)) {
            // Normalize accelerometer measurement
            invNorm = 1/sqrt(ax * ax + ay * ay + az * az);
            ax *= invNorm;
            ay *= invNorm;
            az *= invNorm;

            // Normalize magnetometer measurement
            invNorm = 1/sqrt(mx * mx + my * my + mz * mz);
            mx *= invNorm;
            my *= invNorm;
            mz *= invNorm;

            // Auxiliary variables to avoid repeated arithmetic
            _2q0mx = 2 * q0 * mx;
            _2q0my = 2 * q0 * my;
            _2q0mz = 2 * q0 * mz;
            _2q1mx = 2 * q1 * mx;
            _2q0 = 2 * q0;
            _2q1 = 2 * q1;
            _2q2 = 2 * q2;
            _2q3 = 2 * q3;
            _2q0q2 = 2 * q0 * q2;
            _2q2q3 = 2 * q2 * q3;
            q0q0 = q0 * q0;
            q0q1 = q0 * q1;
            q0q2 = q0 * q2;
            q0q3 = q0 * q3;
            q1q1 = q1 * q1;
            q1q2 = q1 * q2;
            q1q3 = q1 * q3;
            q2q2 = q2 * q2;
            q2q3 = q2 * q3;
            q3q3 = q3 * q3;

            // Reference direction of Earth's magnetic field
            hx = mx * q0q0 - _2q0my * q3 + _2q0mz * q2 + mx * q1q1
               + _2q1 * my * q2 + _2q1 * mz * q3 - mx * q2q2 - mx * q3q3;
            hy = _2q0mx * q3 + my * q0q0 - _2q0mz * q1 + _2q1mx * q2
               - my * q1q1 + my * q2q2 + _2q2 * mz * q3 - my * q3q3;
            _2bx = sqrt(hx * hx + hy * hy);
            _2bz = -_2q0mx * q2 + _2q0my * q1 + mz * q0q0 + _2q1mx * q3
                 - mz * q1q1 + _2q2 * my * q3 - mz * q2q2 + mz * q3q3;
            _4bx = 2 * _2bx;
            _4bz = 2 * _2bz;

            // Gradient decent algorithm corrective step
            s0 = -_2q2 * (2 * q1q3 - _2q0q2 - ax) + _2q1 * (2 * q0q1 + _2q2q3 - ay)
               - _2bz * q2 * (_2bx * (.5 - q2q2 - q3q3) + _2bz * (q1q3 - q0q2) - mx)
               + (-_2bx * q3 + _2bz * q1) * (_2bx * (q1q2 - q0q3) + _2bz * (q0q1 + q2q3)
               - my) + _2bx * q2 * (_2bx * (q0q2 + q1q3) + _2bz * (.5 - q1q1 - q2q2) - mz);
            s1 = _2q3 * (2 * q1q3 - _2q0q2 - ax) + _2q0 * (2 * q0q1 + _2q2q3 - ay)
               - 4 * q1 * (1 - 2 * q1q1 - 2 * q2q2 - az) + _2bz * q3 * (_2bx * (.5
               - q2q2 - q3q3) + _2bz * (q1q3 - q0q2) - mx) + (_2bx * q2 + _2bz * q0)
               * (_2bx * (q1q2 - q0q3) + _2bz * (q0q1 + q2q3) - my) + (_2bx * q3 - _4bz
               * q1) * (_2bx * (q0q2 + q1q3) + _2bz * (.5 - q1q1 - q2q2) - mz);
            s2 = -_2q0 * (2 * q1q3 - _2q0q2 - ax) + _2q3 * (2 * q0q1 + _2q2q3 - ay)
               - 4 * q2 * (1 - 2 * q1q1 - 2 * q2q2 - az) + (-_4bx * q2 - _2bz * q0)
               * (_2bx * (.5 - q2q2 - q3q3) + _2bz * (q1q3 - q0q2) - mx) + (_2bx * q1
               + _2bz * q3) * (_2bx * (q1q2 - q0q3) + _2bz * (q0q1 + q2q3) - my) + (_2bx
               * q0 - _4bz * q2) * (_2bx * (q0q2 + q1q3) + _2bz * (.5 - q1q1 - q2q2) - mz);
            s3 = _2q1 * (2 * q1q3 - _2q0q2 - ax) + _2q2 * (2 * q0q1 + _2q2q3 - ay)
               + (-_4bx * q3 + _2bz * q1) * (_2bx * (.5 - q2q2 - q3q3) + _2bz * (q1q3
               - q0q2) - mx) + (-_2bx * q0 + _2bz * q2) * (_2bx * (q1q2 - q0q3) + _2bz
               * (q0q1 + q2q3) - my) + _2bx * q1 * (_2bx * (q0q2 + q1q3) + _2bz
               * (.5 - q1q1 - q2q2) - mz);
            
            // Normalize step magnitude
            invNorm = 1/sqrt(s0 * s0 + s1 * s1 + s2 * s2 + s3 * s3);
            s0 *= invNorm;
            s1 *= invNorm;
            s2 *= invNorm;
            s3 *= invNorm;

            // Apply feedback step
            qDot1 -= gain * s0;
            qDot2 -= gain * s1;
            qDot3 -= gain * s2;
            qDot4 -= gain * s3;
        }

        // Integrate rate of change of quaternion
        q0 += qDot1 * time;
        q1 += qDot2 * time;
        q2 += qDot3 * time;
        q3 += qDot4 * time;

        // Normalize quaternion
        invNorm = 1/sqrt(q0 * q0 + q1 * q1 + q2 * q2 + q3 * q3);
        this.quaternion[0] = q0 * invNorm;
        this.quaternion[1] = q1 * invNorm;
        this.quaternion[2] = q2 * invNorm;
        this.quaternion[3] = q3 * invNorm;
    }
}

export = MadgwickAHRS;
