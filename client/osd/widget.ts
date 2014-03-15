"use strict";

class Widget {
    public canvas:   HTMLCanvasElement;
    public context:  CanvasRenderingContext2D;
    public textures: HTMLImageElement[] = [];

    public rate: number;

    private toload: number;
    private loaded: number;
    private factor: number;

    constructor(rate: number, canvas: HTMLCanvasElement) {
        canvas.className = 'widget';
        this.context = canvas.getContext('2d');
        this.canvas  = canvas;

        var textures = (<any> this).constructor._TEXTURES;

        if(textures)
            this._loadTextures(textures);

        window.addEventListener("resize", this._appear.bind(this));
    }

    public update(data: any) {
        throw new Error('Abstract update called');
    }

    public _appear() {
        throw new Error('Abstract appearance called');
    }

    public _loadTextures(textures: {path: string; factor?: number}[]) {
        this.loaded = 0;
        this.toload = textures.length;
        textures.forEach((entry, i) => {
            var texture: HTMLImageElement,
                factor:  number = entry.factor || 1;

            texture = new (<any> window).Image;
            texture.onload = this._prepareTextures.bind(this, texture, entry.factor);
            texture.src    = entry.path;

            this.textures[i] = texture;
        });
    }

    private _prepareTextures(texture: HTMLImageElement, factor: number) {
        this.loaded++;

        texture.width  = texture.naturalWidth  * factor;
        texture.height = texture.naturalHeight * factor;

        if(this.loaded === this.toload)
            this._appear();
    }
}

export = Widget;
