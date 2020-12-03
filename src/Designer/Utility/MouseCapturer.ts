import * as signals from "signals";

export class MouseCapturer {
    private _captureing: boolean;
    private _documentdownhandle: (e: MouseEvent) => void;
    private _documentmovehandle: (e: MouseEvent) => void;
    private _documentuphandle: (e: MouseEvent) => void;

    private _onmousedown: signals.Signal;
    private _onmousemove: signals.Signal;
    private _onmouseup: signals.Signal;

    private _element: HTMLElement;



    public constructor(element: HTMLElement) {
        this._element = element;
        this._onmousedown = new signals.Signal();
        this._onmousemove = new signals.Signal();
        this._onmouseup = new signals.Signal();
        this._documentdownhandle = this.element_mouse_down.bind(this);
        this._documentmovehandle = this.document_mouse_move.bind(this);
        this._documentuphandle = this.document_mouse_up.bind(this);
        document.addEventListener('mousemove', this._documentmovehandle);
        document.addEventListener('mouseup', this._documentuphandle);
        if (this._element != null) {
            this._element.addEventListener('mousedown', this._documentdownhandle);
            this._element.addEventListener('mousemove', this._documentmovehandle);
            this._element.addEventListener('mouseup', this._documentuphandle);
        }
    }

    public dispose() {
        this.release();
        if (this._element != null) {
            this._element.removeEventListener('mousedown', this._documentdownhandle);
        }
        this._onmousedown.dispose();
        this._onmousemove.dispose();
        this._onmouseup.dispose();
    }



    public capture() {
        if (!this._captureing) {
            this._element.removeEventListener('mousemove', this._documentmovehandle);
            this._element.removeEventListener('mouseup', this._documentuphandle);
            document.addEventListener('mousemove', this._documentmovehandle);
            document.addEventListener('mouseup', this._documentuphandle);
            this._captureing = true;
        }
    }

    public release() {
        if (this._captureing) {
            document.removeEventListener('mousemove', this._documentmovehandle);
            document.removeEventListener('mouseup', this._documentuphandle);
            this._element.addEventListener('mousemove', this._documentmovehandle);
            this._element.addEventListener('mouseup', this._documentuphandle);
            this._captureing = false;
        }
    }

    private element_mouse_down(e: MouseEvent) {
        this._onmousedown.dispatch(e);
    }

    private document_mouse_move(e: MouseEvent) {
        this._onmousemove.dispatch(e);
    }

    private document_mouse_up(e: MouseEvent) {
        this._onmouseup.dispatch(e);
    }
    public get onMouseDown(): signals.Signal {
        return this._onmousedown;
    }
    public get onMouseMove(): signals.Signal {
        return this._onmousemove;
    }

    public get onMouseUp(): signals.Signal {
        return this._onmouseup;
    }

    public get isCaptured(): boolean {
        return this._captureing;
    }

    public focus(){
        this._element.focus();
    }


}