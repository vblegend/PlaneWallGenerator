import { Vector2 } from "../../core/Vector2";

export enum TextAlign {
    LEFT = 0,
    CENTER = 1,
    RIGHT = 2
}






export class Renderer {

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _width: number;
    private _height: number;



    public constructor(canvas?: HTMLCanvasElement) {
        if (canvas) {
            this._canvas = canvas;
        } else {
            this._canvas = document.createElement("canvas");
        }
        this._context = this.canvas.getContext("2d");
        this._context.globalAlpha = 1.0;
        this._context.translate(0, 0);

    }

    public apply(div: HTMLDivElement) {
        div.appendChild(this.canvas);
    }


    public clear(color: string = '#A9A9A9') {

        // var old = this.context.fillStyle;
        this._context.clearRect(0, 0, this._width, this._height);
        // this.context.fillStyle = color;
        // this.context.fillRect(0, 0, this._width, this._height)
        // this.context.fillStyle = old;
    }

    public resize(width: number, height: number) {
        this._width = width;
        this._height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        var ratio = this.getPixelRatio(this.context);

        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';

        this.canvas.width = width * ratio;
        this.canvas.height = height * ratio;
    }




    getPixelRatio(context) {
        var backingStore = context.backingStorePixelRatio ||
            context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;
        return (window.devicePixelRatio || 1) / backingStore;
    };






    public get context(): CanvasRenderingContext2D {
        return this._context;
    }

    public get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }



    public drawText(text: string, x: number, y: number, width: number, align: TextAlign) {
        var left = x;
        if (align === TextAlign.RIGHT) {
            const measure = this.context.measureText(text);
            if (width == null) {
                left = x - measure.width;
            } else {
                left = x + width - measure.width;
            }
        } else if (align === TextAlign.CENTER) {
            const measure = this.context.measureText(text);
            if (width == null) {
                left = x - measure.width / 2;
            } else {
                left = x + (width + measure.width) / 2;
            }
        }
        this.context.fillText(text, left, y);
    }


    public translateRotate(x: number, y: number, angle: number) {
        this.context.translate(x, y);
        this.context.rotate(angle / 180 * Math.PI);
        this.context.translate(-x, -y);
    }






    public line(x1: number, y1: number, x2: number, y2: number, lineWidth: number = 1) {
        if (lineWidth && lineWidth !== this.context.lineWidth) {
            this.context.lineWidth = lineWidth;
        }
        this.context.beginPath();
        this.context.moveTo(x1 + 0.5, y1 + 0.5);
        this.context.lineTo(x2 + 0.5, y2 + 0.5);
        // this.context.closePath();
        this.context.stroke();
    }


    public fill(points: Vector2[], closed: boolean) {
        this.context.beginPath();
        this.context.moveTo(points[0].x + 0.5, points[0].y + 0.5);
        for (var i = 1; i < points.length; i++) {
            this.context.lineTo(points[i].x + 0.5, points[i].y + 0.5);
        }
        if (closed) {
            this.context.closePath();
        }
        this.context.fill();
    }


    public stroke(points: Vector2[], closed: boolean) {
        this.context.beginPath();
        this.context.moveTo(points[0].x + 0.5, points[0].y + 0.5);
        for (var i = 1; i < points.length; i++) {
            this.context.lineTo(points[i].x + 0.5, points[i].y + 0.5);
        }
        if (closed) {
            this.context.closePath();
        }
        this.context.stroke();
    }




}