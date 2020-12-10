import { DragService } from '../Plugins/DragService';
import { VectorDesigner } from '../VectorDesigner';


export class ToolBox {

    public dom: HTMLDivElement;


    public constructor(designer: VectorDesigner) {
        this.dom = document.createElement('div');
        this.dom.oncontextmenu = (e: MouseEvent) => {
            e.preventDefault();
        }
        this.dom.className = 'designer-toolbox';

        this.dom.appendChild(this.createButton('icon-ATS', "锚点", 'text/create-anchor'));
        this.addBreak(this.dom);
        this.dom.appendChild(this.createButton('icon-menci', '门', 'text/create-door'));
    }













    private addBreak(parent: HTMLElement) {
        var hr = document.createElement('hr');
        hr.className = 'break';
        parent.appendChild(hr);
    }




    private createButton(iconName: string, title: string, classType: string): HTMLButtonElement {
        const icon = document.createElement('span');
        icon.classList.add('icon');
        icon.classList.add('iconfont');
        icon.classList.add(iconName);
        var button = document.createElement('button');
        button.appendChild(icon);
        button.draggable = true;
        button.title = title;
        button.ondragstart = (e: DragEvent) => {
            e.dataTransfer.setData(classType, 'designer');
            e.dataTransfer.setDragImage(new Image(), 0, 0);
            e.dataTransfer.effectAllowed = 'move'; // only allow moves
        }
        return button;
    }

    public dispose() {

    }
}