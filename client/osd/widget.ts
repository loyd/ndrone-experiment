"use strict";

class Widget {
    public canvas:   HTMLCanvasElement;
    public context:  CanvasRenderingContext2D;
    public textures: HTMLImageElement[] = [];

    public rate: number;

    private toload: number;
    private loaded: number;
    private factor: number;

    constructor(rate: number, options?: {path: string; factor?: number}[]) {
        this.canvas = window.document.createElement('canvas');
        this.canvas.className = 'widget';

        this.context = this.canvas.getContext('2d');

        if(options) {
            this.loaded = 0;
            this.toload = options.length;
            options.forEach((entry, i) => {
                var texture: HTMLImageElement,
                    factor:  number = entry.factor || 1;

                texture = new window["Image"]();
                texture.onload = this.prepare.bind(this, texture, entry.factor);
                texture.src    = entry.path;

                this.textures[i] = texture;
            });
        }

        window.document.body.appendChild(this.canvas);
    }

    public update(data: any) {
        throw new Error('Abstract update called');
    }

    public appear() {
        throw new Error('Abstract appearance called');
    }

    private prepare(texture: HTMLImageElement, factor: number) {
        this.loaded++;

        texture.width  = texture.naturalWidth  * factor;
        texture.height = texture.naturalHeight * factor;

        if(this.loaded === this.toload)
            this.appear();
    }
}

export = Widget;
