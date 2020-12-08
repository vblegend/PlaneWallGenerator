import { GroupWalls, WallPolygon, HolePolygon } from './Core/Common';
import { Anchor } from './Core/Anchor';
import { Wall } from "./Core/Wall";
import { Hole } from './Core/Hole';
import { MathHelper } from './Core/MathHelper';

export class WallPolygonParser {



    /**
     * 解析点数据成多边形数据
     * @param area 
     * @param relocation 是否重定位墙的初始坐标位置为墙中心，如果为否 强的 position始终为0
     */
    public static parse(area: GroupWalls, relocation?: boolean): WallPolygon[] {
        var result: WallPolygon[] = [];
        var anchors: { [key: number]: Anchor } = {};
        var walls: { [key: number]: Wall } = {};
        var heights: { [key: number]: number } = {};
        try {
            // parse anchors
            for (let anchor of area.anchors) {
                if (anchor && anchor.id && anchor.x && anchor.y && anchors[anchor.id] == null) {
                    anchors[anchor.id] = new Anchor(anchor.id, anchor.x, anchor.y);
                }
            }
            // parse walls
            for (let wall of area.walls) {
                if (wall && wall.id && wall.anchors && wall.anchors.length === 2) {
                    var object = walls[wall.id];
                    if (object == null) {
                        var from = anchors[wall.anchors[0]];
                        var to = anchors[wall.anchors[1]];
                        if (from && to) {
                            object = new Wall(wall.id, from, to, wall.thick);
                            walls[wall.id] = object;
                            heights[wall.id] = wall.height;

                            if (wall.holes && wall.holes.length > 0) {
                                for (let holeConfig of wall.holes) {
                                    let hole = new Hole();
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
            for (let key in anchors) {
                var anchor = anchors[key];
                if (anchor.targets.length > 0) {
                    anchors[key].build();
                }
            }
            for (let key in walls) {
                var wall = walls[key];
                wall.update();
                var config = new WallPolygon();
                config.id = wall.id;
                config.height = heights[wall.id];
                config.points = wall.points;
                config.position = [0, 0];
                config.holes = [];
                if (relocation) {
                    config.position = MathHelper.getCenter(config.points);
                    MathHelper.reLocation(config.points, config.position);
                }
                // holes
                if (wall.holes.length > 0) {
                    for (let hole of wall.holes) {
                        let holepolygon = new HolePolygon();
                        holepolygon.id = hole.id;
                        holepolygon.height = hole.height;
                        holepolygon.ground = hole.ground;
                        holepolygon.position = [0, 0];
                        holepolygon.points = hole.points;
                        if (relocation) {
                            holepolygon.position = config.position;
                            MathHelper.reLocation(holepolygon.points, config.position);
                        }
                        config.holes.push(holepolygon);
                    }
                }
                result.push(config);
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