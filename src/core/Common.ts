

/**
 * 锚点信息
 */
export interface ElementAnchor {
    /* 锚点id */
    id: number;
    /* 锚点x坐标 */
    x: number;
    /* 锚点y坐标 */
    y: number;
}

/**
 * 墙面
 */
export interface ElementWall {
    id: number;
    anchors: number[];
    thick: number;
    height: number;
    holes: ElementHole[],
}

/**
 * 洞，在墙里面
 */
export interface ElementHole {
    id: number;
    /* 洞的宽度 */
    width: number;
    /* 洞的位置 */
    location: number;
    /* 离地高度 */
    ground: number;
    /* 洞的高度 3D属性 */
    height: number;
}


/**
 * 圆柱体
 */
export interface ElementClinder {
    id: number;
    p: number[];
    r: number;
    h: number;
}

/**
 * 立方体
 */
export class ElementCube {
    public id: number;
    public p: number[];
    /* 长 */
    public x: number;
    /* 宽 */
    public z: number;
    /* 高 */
    public y: number;
}







/**
 * 图形文档对象
 */
export interface GraphicDocument {
    /* 锚点 */
    anchors: ElementAnchor[];
    /* 墙 */
    walls: ElementWall[];
    /* 圆柱 */
    cylinders: ElementClinder[];
    /* 立方体 */
    cubes: ElementCube[];
}


/**
 * 多边形对象
 */
export class ObjectPolygon {
    /* 多边形Id */
    public id: number;
    /* 多边形的位置 */
    public p: number[];
}




/**
 * 每面墙的多边形数据
 */
export class WallPolygon extends ObjectPolygon {
    /* 墙高度 */
    public h: number;
    /* 墙的点集合 */
    public points: number[][];
    /* 墙上的洞 */
    public holes: HolePolygon[];
}

/**
 * 圆柱的数据
 */
export class CylinderPolygon extends ObjectPolygon {
    /* 圆柱的半径 */
    public r: number;
    /* 圆柱的高度 */
    public h: number;
}

/**
 * 立方体的数据
 */
export class CubePolygon extends ObjectPolygon {
    /* 立方体的点集合 */
    public points: number[][];
}

/**
 * 门的数据
 */
export class HolePolygon extends ObjectPolygon {
    /* 门的点集合 */
    public points: number[][];
    /* 门的高度 */
    public h: number;
    /* 门下方离地高度 */
    public g: number;
}