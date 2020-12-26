import { Control } from './Control';
import { VectorDesigner } from '../VectorDesigner';

export class ImageControl extends Control {
    private _image: HTMLImageElement;
    private _width: number;
    private _height: number;


    public constructor(designer: VectorDesigner, image?: HTMLImageElement, width?: number, height?: number) {
        super(designer);
        this.setImage(image, width, height);
    }


    public setImage(image?: HTMLImageElement, width?: number, height?: number) {
        this._image = image;
        if (this._image && this._image.width > 0 && this._image.height > 0) {
            this._width = width ? width : image.width;
            this._height = height ? height : image.height;
            this.position.set(-(this._width / 2), -(this._height / 2));
        } else {
            this.position.set(0, 0);
            this._width = this._height = 0;
        }
        this.designer.requestRender();
    }






    public render() {
        if (this._width && this._height) {
            this.designer.renderer.opacity = 1;
            const pos = this.designer.convertPoint(this.position);
            this.designer.renderer.image(this._image, pos, this._width / this.designer.res, this._height / this.designer.res);
        }
    }
}