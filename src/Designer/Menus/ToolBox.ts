import { Vector2 } from '../../Core/Vector2';
import { DragService } from '../Plugins/DragService';
import { VectorDesigner } from '../VectorDesigner';


export class ToolBox {

    public dom: HTMLDivElement;


    public constructor(designer: VectorDesigner) {
        this.dom = document.createElement('div');
        this.dom.className = 'designer-toolplane';
        let doagBox = document.createElement('div');
        doagBox.oncontextmenu = (e: MouseEvent) => {
            e.preventDefault();
        }
        doagBox.className = 'designer-toolbox';
        doagBox.appendChild(this.createDragIcon('icon-ATS', "拖拽创建锚点", 'text/create-anchor'));
        this.addBreak(doagBox);
        doagBox.appendChild(this.createDragIcon('icon-menci', '拖拽创建门', 'text/create-door'));

        let toolBox = document.createElement('div');
        toolBox.oncontextmenu = (e: MouseEvent) => {
            e.preventDefault();
        }
        toolBox.className = 'designer-toolbox';
        toolBox.style.marginTop = '30px';
        let btnCenter = this.createButton('icon-dingwei3', '点击回到中心');
        btnCenter.className = 'Button';
        btnCenter.onclick = () => {
            designer.moveTo(100, new Vector2());
        }
        toolBox.appendChild(btnCenter);






        this.dom.appendChild(doagBox);
        this.dom.appendChild(toolBox);
    }













    private addBreak(parent: HTMLElement) {
        var hr = document.createElement('hr');
        hr.className = 'break';
        parent.appendChild(hr);
    }




    private createButton(iconName: string, title: string): HTMLButtonElement {
        const icon = document.createElement('span');
        icon.classList.add('icon');
        icon.classList.add('iconfont');
        icon.classList.add(iconName);
        var button = document.createElement('button');
        button.appendChild(icon);
        button.title = title;
        return button;
    }


    private createDragIcon(iconName: string, title: string, classType: string): HTMLSpanElement {
        const icon = document.createElement('span');
        icon.classList.add('icon');
        icon.classList.add('iconfont');
        icon.classList.add('drag-button');
        icon.classList.add(iconName);
        var button = document.createElement('div');
        button.appendChild(icon);
        icon.draggable = true;
        icon.title = title;
        icon.ondragstart = (e: DragEvent) => {
            e.dataTransfer.setData(classType, 'designer');
            e.dataTransfer.setDragImage(new Image(), 0, 0);
            e.dataTransfer.effectAllowed = 'move'; // only allow moves
        }
        return icon;
    }






    public dispose() {

    }
}