import * as signals from 'signals';

export class DragService {
    private _element: HTMLElement;
    private _ondrop: signals.Signal;
    private _ondropEnter: signals.Signal;
    private _ondropLeave: signals.Signal;
    private _ondropOver: signals.Signal;
    private _drophandle: (e: DragEvent) => void;
    private _dropoverhandle: (e: DragEvent) => void;
    private _dropenterhandle: (e: DragEvent) => void;
    private _dropleavehandle: (e: DragEvent) => void;
    public allowedPutDown: boolean;

    /**
     * 
     * @param element drag element
     * @param internalDNDType text/xxxxxxxxxxxxxxxx
     */
    public constructor(element: HTMLElement) {
        this._element = element;
        this._ondrop = new signals.Signal();
        this._ondropEnter = new signals.Signal();
        this._ondropLeave = new signals.Signal();
        this._ondropOver = new signals.Signal();
        this._drophandle = this.mousedrop.bind(this);
        this._dropoverhandle = this.mousedropover.bind(this);
        this._dropleavehandle = this.mousedropleave.bind(this);
        this._dropenterhandle = this.mousedropenter.bind(this);
        this._element.addEventListener('dragover', this._dropoverhandle, false);
        this._element.addEventListener('drop', this._drophandle, false);
        this._element.addEventListener('dragenter', this._dropenterhandle, false);
        this._element.addEventListener('dragleave', this._dropleavehandle, false);

    }

    public dispose() {
        if (this._element != null) {
            this._element.removeEventListener('dragover', this._dropoverhandle, false);
            this._element.removeEventListener('drop', this._drophandle, false);
            this._element.removeEventListener('dragenter', this._dropenterhandle, false);
            this._element.removeEventListener('dragleave', this._dropleavehandle, false);
            this._element = null;
        }
    }



    private mousedrop(e: DragEvent) {
        if (this.allowedPutDown) {
            this._ondrop.dispatch(e);
            e.preventDefault();
        }
    }

    private mousedropover(e: DragEvent) {
        if (this.allowedPutDown) {
            this._ondropOver.dispatch(e);
            e.preventDefault();
        }
    }


    private mousedropleave(e: DragEvent) {
        if (this.allowedPutDown) {
            this._ondropLeave.dispatch(e);
            e.preventDefault();
        }
    }


    private mousedropenter(e: DragEvent) {
        this.allowedPutDown = false;
        this._ondropEnter.dispatch(e);
        e.preventDefault();
    }







    // private hasData(e: DragEvent): boolean {
    //     var items = e.dataTransfer.items;
    //     for (var i = 0; i < items.length; ++i) {
    //         var item = items[i];
    //         if (item.kind == 'string' && item.type === this._internalDNDType) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    // public getData(e: DragEvent): string {
    //     return e.dataTransfer.getData(this._internalDNDType);
    // }

    public get onDrop(): signals.Signal {
        return this._ondrop;
    }

    public get onDropEnter(): signals.Signal {
        return this._ondropEnter;
    }

    public get onDropLeave(): signals.Signal {
        return this._ondropLeave;
    }

    public get onDropOver(): signals.Signal {
        return this._ondropOver;
    }
}