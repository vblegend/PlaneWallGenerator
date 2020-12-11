import { Vector2 } from "../../Core/Vector2";
import { Renderer, HorizontalAlign, RenderType } from "../Renderer";
import { VectorDesigner } from "../VectorDesigner";


export class VerticalRuler {
    private _canvas: HTMLCanvasElement;
    private designer: VectorDesigner;
    private _renderer: Renderer;
    private _needUpdate: boolean;
    private _cursorRenderer: Renderer;
    private _width: number;
    private _height: number;
    private _div: HTMLDivElement


    public constructor(designer: VectorDesigner, div: HTMLDivElement) {
        this.designer = designer;
        this._div = div;
        this._canvas = document.createElement('canvas');
        this._div.appendChild(this._canvas);
        this._needUpdate = true;
        this._cursorRenderer = new Renderer();
        this._renderer = new Renderer(this._canvas);
        this.designer.onRender.add(this.render, this);
        this.designer.onMoved.add(() => {
            this._needUpdate = true;
        }, this);

        this.designer.onCursorChange.add(() => {
            this.renderCursor();
            this._needUpdate = true;
        }, this);

        this._canvas.oncontextmenu = (e) => {
            e.preventDefault();
        }
        this.resize();
    }



    public resize() {
        this._width = this._div.clientWidth;
        this._height = this._div.clientHeight;
        this._renderer.resize(this.width, this.height);
        this._cursorRenderer.resize(this.width, this.height);
        this._needUpdate = true;
        this.renderCursor();
    }



    private renderCursor() {
        this._cursorRenderer.clear();
        var designerlength = this.designer.bounds.bottom - this.designer.bounds.top;
        var position = this.designer.cursor.position;
        if (position.y >= this.designer.bounds.top && position.y <= this.designer.bounds.bottom) {
            this._cursorRenderer.fontSize = 16;
            var posy = (position.y - this.designer.bounds.top) / designerlength * this.height;
            var text = position.y.toFixed(4);
            var height = this._cursorRenderer.measureTextWidth(text) + this._cursorRenderer.fontSize;
            var top = posy - height / 2;
            var bottom = posy + height / 2;
            if (top < 0) {
                bottom -= top;
                top = 0;
            } else if (bottom > this.height) {
                let v = bottom - this.height;
                top -= v;
                bottom = this.height;
            }
            this._cursorRenderer.rectangle(this.width - 7 - this._cursorRenderer.fontSize, top, this._cursorRenderer.fontSize, bottom - top, RenderType.ALL);
            this._cursorRenderer.rotate(this.width - 7 - this._cursorRenderer.fontSize, top + height / 2, 270, () => {
                this._cursorRenderer.fillColor = '#ffffff';
                this._cursorRenderer.fillText(text, this.width - 7 - this._cursorRenderer.fontSize, top + height / 2, null, HorizontalAlign.CENTER);
            });
            var paths: Vector2[] = [];
            paths.push(new Vector2(this.width - 1, posy));
            paths.push(new Vector2(this.width - 7, posy - 5 < 0 ? 0 : posy - 5));
            paths.push(new Vector2(this.width - 7, posy + 5 > this.height ? this.height : posy + 5));
            this._cursorRenderer.fillColor = '#333333'
            this._cursorRenderer.fillPath(paths, true);
        }
    }




    private render() {
        if (!this._needUpdate) return;
        this._needUpdate = false;
        var designerlength = this.designer.bounds.bottom - this.designer.bounds.top;
        var offset = this.designer.center.y % (designerlength / this.height * 100);
        this._renderer.strokeColor = '#666666';
        this._renderer.fillColor = '#666666';
        this._renderer.fontSize = 10;
        var center = this.height / 2;
        var offsetCenter = this.designer.center.y / this.designer.res;
        var offsetCalibration = offset / this.designer.res;
        var centeroffset = center - offsetCalibration;
        var pos = 0;
        var count = 0;
        this._renderer.clear();
        while (centeroffset + pos < this.height || centeroffset - pos > 0) {
            if (centeroffset + pos < this.height) {
                var pValue: number = null;
                if (count % 10 === 0) {
                    pValue = (offsetCenter - offsetCalibration + pos) * this.designer.res;
                    pValue = Number.parseFloat(pValue.toFixed(2));
                }
                this.drawCalibration(centeroffset + pos, pValue);
            }
            if (centeroffset - pos > 0) {
                var pValue: number = null;
                if (count % 10 === 0) {
                    pValue = (offsetCenter - offsetCalibration - pos) * this.designer.res;
                    pValue = Number.parseFloat(pValue.toFixed(2));
                }
                this.drawCalibration(centeroffset - pos, pValue);
            }
            pos += 10;
            count++;
        }
        /**
         * fixed triangle pointer
         */
        this._renderer.fillColor = '#333333'
        this._renderer.fillPath([new Vector2(0, center - 5), new Vector2(0, center + 5), new Vector2(10, center)], true);
        this._renderer.strokeColor = '#aaaaaa'
        this._renderer.strokePath([new Vector2(0, center - 5), new Vector2(0, center + 5), new Vector2(10, center)], true);
        if (this.designer.cursor.visible) {
            this._renderer.draw(this._cursorRenderer, 0, 0);
        }
    }

    /**
     * draw ruler calibration
     * @param x 
     * @param value 
     */
    private drawCalibration(y: number, value?: number) {
        var calibration = this.width / 3;
        if (value != null) {
            this._renderer.rotate(this.width * 0.65, y, 270, () => {
                this._renderer.fillText(value.toString(), this.width * 0.65, y, null, HorizontalAlign.CENTER);
            });
            calibration = this.width / 2;
        }
        this._renderer.line(0, y, calibration, y, 1);
    }



    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

}