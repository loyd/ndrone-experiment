"use strict";

import stream = require('stream');
import net    = require('net');
import dgram  = require('dgram');
import assert = require('assert');

export interface TransportOptions {
    port: number;
    host?: string;
    timeout?: number;
}

export class Transport extends stream.Duplex {
    public port: number;
    public host: string;
    public timeout: number;
    public isServer: boolean;
    public isConnected = false;

    constructor(options: TransportOptions) {
        super();

        var port = options.port;
        assert(1 <= port && port <= 65535);
        this.port = port;
        
        this.isServer = !options.host;
        this.host = options.host || 'localhost';

        var timeout = options.timeout || 0;
        assert(timeout >= 0);
        this.timeout = timeout;
    }
}

export class TcpTransport extends Transport {
    private _socket: net.Socket = null;
    private _server: net.Server = null;
    private _expectFIN = false;

    constructor(options: TransportOptions) {
        super(options);

        if(this.isServer) {
            var server = this._server = net.createServer();
            server.on('connection', (socket: net.Socket) => {
                //#TODO: add sending error
                if(this.isConnected) return;
                this._setupSocket(socket);
            });
            
            server.on('error', (err: Error) => {
                this.emit('error', err);
                this.end();
            });

            server.listen(this.port);
        } else {
            var client = net.connect({
                port : this.port,
                host : this.host,
                allowHalfOpen : true
            });

            client.once('connect', () => this._setupSocket(client));
        }
    }

    public end() {
        this._expectFIN = true;
        super.end.apply(this, arguments);
        this.isServer ? this._server.close() : this._socket.end();
    }

    private _setupSocket(socket: net.Socket) {
        assert(socket.writable && socket.readable);

        if(this.timeout) socket.setTimeout(this.timeout);
        socket.setNoDelay();

        socket.on('data', (chunk: NodeBuffer) => this.push(chunk));
        socket.on('error', this.emit.bind(this, 'error'));
        socket.on('end', () => this._expectFIN = true);

        socket.on('timeout', () => {
            var err = new Error('Timeout after ' + this.timeout + 'ms');
            this.emit('error', err);
            this.end();
        });

        socket.on('close', () => {
            if(!this._expectFIN) {
                var err = new Error('FIN is received unexpectedly');
                this.emit('error', err);
            }

            if(this.isServer) this._server.close();

            this.isConnected = false;
            this.emit('close');
        });

        this._socket = socket;
        this.isConnected = true;
        this.emit('connect');
    }

    /*
        Implementation of stream's template methods
     */

    public _write(data: any, enc: string, cb: Function) {
        //#TODO: prevent this case or store until connected
        if(!this.isConnected) return cb(null);
        this._socket.write(data, enc, cb);
    }

    public _read(size: number) {
        // Ignore request
    }
}

export class UdpTransport extends Transport {
    //#TODO: implement timeout support
    //#TODO: implement FIN and 'close' event

    private _socket: dgram.Socket = null;
    private _remoteAddr: string = '';
    private _remotePort: number = 0;

    constructor(options: TransportOptions) {
        super(options);

        var socket = this._socket = dgram.createSocket('udp4');

        socket.on('error', (err: Error) => {
            this.emit('error', err);
            this.end();
        });

        socket.on('message', (msg: NodeBuffer, info: any) => {
            if(!this.isConnected) {
                this._handshake(info.address, info.port);
                return;
            }
            
            // Reject messages from other clients
            if(this._remoteAddr !== info.address || this._remotePort !== info.port) {
                //#TODO: add sending error
                return;
            }

            this.push(msg);
        });

        socket.bind(this.port);

        // Initialize handshake if client
        if(!this.isServer)
            socket.send(new Buffer(1), 0, 1, this.port, this.host);

        this._socket = socket;
    }

    public end() {
        super.end.apply(this, arguments);
        this._socket.close();
    }

    private _handshake(address: string, port: number) {
        this._remoteAddr = address;
        this._remotePort = port;
        this.isConnected = true;
        if(this.isServer)
            this._socket.send(new Buffer(1), 0, 1, port, address);
        this.emit('connect');
    }

    /*
        Implementation of stream's template methods
     */

    public _write(data: any, enc: string, cb: Function) {
        //#TODO: prevent this case or store until connected
        if(!this.isConnected) return cb(null);
        this._socket.send(data, 0, data.length,
            this._remotePort, this._remoteAddr, cb);
    }

    public _read(size: number) {
        // Ignore request
    }
}
