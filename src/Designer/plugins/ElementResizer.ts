import * as signals from 'signals';


export class ElementResizer {

    private _resizeHandle: () => void;
    private object: HTMLObjectElement;
    private _onresize: signals.Signal;

    public get onResize(): signals.Signal {
        return this._onresize;
    }

    public constructor(element: HTMLElement) {
        this._onresize = new signals.Signal();
        this._resizeHandle = this._handleResize.bind(this);
        this.object = this.createResizeTrigger(element);
        this.object.onload = this.attach.bind(this);
        element.appendChild(this.object);
    }


    private attach(){
        this.object.contentDocument.defaultView.addEventListener('resize', this._resizeHandle);
    }



    public dispose() {
        if (this.object) {
            this.object.contentDocument.defaultView.removeEventListener('resize', this._resizeHandle);
            this.object.onload = null;
            this.object.remove();
            this.object = null;
            this._onresize = null;
            this._resizeHandle = null;
        }
    }

    private _handleResize() {
        this._onresize.dispatch();
    }

    private createResizeTrigger(ele: HTMLElement): HTMLObjectElement {
        const obj = document.createElement('object');
        obj.setAttribute('style',
            'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden;opacity: 0; pointer-events: none; z-index: -1;');
        obj.type = 'text/html';
        ele.appendChild(obj);
        obj.data = 'about:blank';
        return obj;
    }
}
