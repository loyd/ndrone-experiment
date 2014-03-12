"use strict";

import assert = require('assert');
import stream = require('stream');
import child  = require('child_process');

class VideoDecoder extends stream.Transform {
    private _gst: child.ChildProcess;
    private _size: number;

    constructor(width: number, height: number) {
        super();
        assert(width  > 0);
        assert(height > 0);
        var size = this._size = width * height * 4;

        //#TODO: add fallback to gst-launch-1.0 and ffmpeg
        var gst = this._gst = child.spawn('gst-launch-0.10', [
            '--quiet', 'fdsrc',
            '!', 'video/x-h264,width=' + width + ',height=' + height + ',framerate=0/1',
            '!', 'ffdec_h264',
            '!', 'ffmpegcolorspace',
            '!', 'video/x-raw-rgb,depth=32',
            '!', 'fdsink sync=false'
        ]);

        gst.on('error', (err: Error) => {
            this.emit('error', err);
            this.end();
        });

        //#TODO: add listeners to stderr
        var out = gst.stdout;
        out.pause();
        out.on('readable', () => {
            var chunk: NodeBuffer;
            while(chunk = out.read(size)) {
                assert(chunk.length === size);
                this.push(chunk);
            }
        });
    }

    public end() {
        super.end.apply(this, arguments);
        this._gst.kill();
    }

    /*
        Implementation of stream's template methods
     */

    public _transform(chunk: any, enc: string, cb: Function) {
        this._gst.stdin.write(chunk, cb);
    }
}

export = VideoDecoder;
