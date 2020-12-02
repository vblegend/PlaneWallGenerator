import { Vector2 } from "./Vector2";




export interface WallConfig2d {
    id: number;
    anchors: number[];
    thick: number;
    height: number;
}

export interface AnchorConfig2d {
    id: number;
    x:number;
    y:number;
}


export interface AreaWalls {
    anchors: AnchorConfig2d[];
    walls: WallConfig2d[];
}