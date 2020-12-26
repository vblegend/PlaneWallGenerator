import { GraphicDocument, WallPolygon, HolePolygon, ObjectPolygon, CylinderPolygon, CubePolygon } from './Core/Common';
import { Anchor } from './Core/Anchor';
import { Wall } from './Core/Wall';
import { Hole } from './Core/Hole';
import { MathHelper } from './Core/MathHelper';
import { Cube } from './Core/Cube';

export class WallPolygonParser {



    /**
     * 解析点数据成多边形数据
     * @param area 
     * @param relocation 是否重定位墙的初始坐标位置为墙中心，如果为否 强的 position始终为0
     */
    public static parse(area: GraphicDocument, relocation?: boolean): ObjectPolygon[] {
        const result: ObjectPolygon[] = [];
        let anchors: { [key: number]: Anchor } = {};
        let walls: { [key: number]: Wall } = {};
        let heights: { [key: number]: number } = {};
        try {
            // parse anchors
            for (const anchor of area.anchors) {
                if (anchor && anchor.id && anchor.x && anchor.y && anchors[anchor.id] == null) {
                    anchors[anchor.id] = new Anchor(anchor.id, anchor.x, anchor.y);
                }
            }
            // parse walls
            for (const wall of area.walls) {
                if (wall && wall.id && wall.anchors && wall.anchors.length === 2) {
                    let object = walls[wall.id];
                    if (object == null) {
                        const from = anchors[wall.anchors[0]];
                        const to = anchors[wall.anchors[1]];
                        if (from && to) {
                            object = new Wall(wall.id, from, to, wall.thick);
                            walls[wall.id] = object;
                            heights[wall.id] = wall.height;

                            if (wall.holes && wall.holes.length > 0) {
                                for (const holeConfig of wall.holes) {
                                    const hole = new Hole();
                                    hole.id = holeConfig.id;
                                    hole.width = holeConfig.width;
                                    hole.height = holeConfig.height;
                                    hole.ground = holeConfig.ground;
                                    hole.location = holeConfig.location;
                                    // hole.thickness = holeConfig.thickness;
                                    object.addHole(hole);
                                }
                            }


                        }
                    }
                }
            }
            for (const key in anchors) {
                const anchor = anchors[key];
                if (anchor.targets.length > 0) {
                    anchors[key].build();
                }
            }
            for (const key in walls) {
                const wall = walls[key];
                wall.update();
                const config = new WallPolygon();
                config.id = wall.id;
                config.h = heights[wall.id];
                config.points = MathHelper.clone2Array(wall.points);
                config.p = [0, 0];
                config.holes = [];
                if (relocation) {
                    config.p = MathHelper.getCenter(config.points);
                    MathHelper.reLocation(config.points, config.p);
                }
                // holes
                if (wall.holes.length > 0) {
                    for (const hole of wall.holes) {
                        const holepolygon = new HolePolygon();
                        holepolygon.id = hole.id;
                        holepolygon.h = hole.height;
                        holepolygon.g = hole.ground;
                        holepolygon.p = [0, 0];
                        holepolygon.points = MathHelper.clone2Array(hole.points);
                        if (relocation) {
                            holepolygon.p = config.p;
                            MathHelper.reLocation(holepolygon.points, config.p);
                        }
                        config.holes.push(holepolygon);
                    }
                }
                result.push(config);
            }
            if (area.cylinders) {
                for (const cylinder of area.cylinders) {
                    const cy = new CylinderPolygon();
                    cy.id = cylinder.id;
                    cy.p = cylinder.p;
                    cy.r = cylinder.r;
                    cy.h = cylinder.h;
                    result.push(cy);
                }
            }

            if (area.cubes) {
                for (const cylinder of area.cubes) {
                    const cube = new Cube(cylinder.id, cylinder.p[0], cylinder.p[1], cylinder.x, cylinder.z, cylinder.y);
                    cube.update();
                    const cubepolygon = new CubePolygon();
                    cubepolygon.id = cylinder.id;
                    cubepolygon.points = MathHelper.clone2Array(cube.vertices);
                    cubepolygon.h = cube.height;
                    cubepolygon.p = [0, 0];
                    if (relocation) {
                        cubepolygon.p = MathHelper.getCenter(cubepolygon.points);
                        MathHelper.reLocation(cubepolygon.points, cubepolygon.p);
                    }
                    result.push(cubepolygon);
                }
            }
            return result;
        }
        catch (e) {
            throw e;
        } finally {
            anchors = {};
            walls = {};
            heights = {};
        }
    }






}