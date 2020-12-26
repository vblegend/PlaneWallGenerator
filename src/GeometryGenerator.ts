// import { WallPolygonParser } from "./WallPolygonParser";
// import * as THREE from "three";
// import { Material } from 'three';
// import { GraphicDocument, WallPolygon, CylinderPolygon, CubePolygon } from './Core/Common';
// import { MeshHelper } from "../../Utility/MeshHelper";


// // class IUVGenerator implements UVGenerator {
// //     public generateTopUV(geometry: ExtrudeBufferGeometry, vertices: number[], indexA: number, indexB: number, indexC: number): THREE.Vector2[] {

// //         const a_x = vertices[indexA * 3];
// //         const a_y = vertices[indexA * 3 + 1];
// //         const b_x = vertices[indexB * 3];
// //         const b_y = vertices[indexB * 3 + 1];
// //         const c_x = vertices[indexC * 3];
// //         const c_y = vertices[indexC * 3 + 1];

// //         // var box = new Box3().setFromArray(vertices);



// //         return [
// //             new THREE.Vector2(a_x, a_y),
// //             new THREE.Vector2(b_x, b_y),
// //             new THREE.Vector2(c_x, c_y)
// //         ];

// //     }
// //     public generateSideWallUV(geometry: ExtrudeBufferGeometry, vertices: number[], indexA: number, indexB: number, indexC: number, indexD: number): THREE.Vector2[] {

// //         const a_x = vertices[indexA * 3];
// //         const a_y = vertices[indexA * 3 + 1];
// //         const a_z = vertices[indexA * 3 + 2];
// //         const b_x = vertices[indexB * 3];
// //         const b_y = vertices[indexB * 3 + 1];
// //         const b_z = vertices[indexB * 3 + 2];
// //         const c_x = vertices[indexC * 3];
// //         const c_y = vertices[indexC * 3 + 1];
// //         const c_z = vertices[indexC * 3 + 2];
// //         const d_x = vertices[indexD * 3];
// //         const d_y = vertices[indexD * 3 + 1];
// //         const d_z = vertices[indexD * 3 + 2];

// //         if (Math.abs(a_y - b_y) < 0.01) {
// //             return [
// //                 new THREE.Vector2(a_y, 0 - a_z),
// //                 new THREE.Vector2(b_y, 0 - b_z),
// //                 new THREE.Vector2(c_y, 0 - c_z),
// //                 new THREE.Vector2(d_y, 0 - d_z)
// //             ];


// //         } else {
// //             return [
// //                 new THREE.Vector2(a_x, 0 - a_z),
// //                 new THREE.Vector2(b_x, 0 - b_z),
// //                 new THREE.Vector2(c_x, 0 - c_z),
// //                 new THREE.Vector2(d_x, 0 - d_z)
// //             ];


// //         }

// //     }
// // }


// export class GeometryGenerator {


//     /**
//      * 批量生成3D墙体模型
//      * @param walls 
//      * @param materials 
//      */
//     public static async generateObject(walls: GraphicDocument, materials: Material | Material[]): Promise<THREE.Group> {
//         let result: THREE.Group = new THREE.Group();
//         const polygons = WallPolygonParser.parse(walls, true);
//         for (let polygon of polygons) {
//             let mesh: THREE.Mesh;
//             if (polygon instanceof WallPolygon) {
//                 mesh = this.generateWall(polygon, materials);
//             } else if (polygon instanceof CylinderPolygon) {
//                 mesh = this.generateCylinder(polygon, materials);
//             } else if (polygon instanceof CubePolygon) {
//                 mesh = this.generateCube(polygon, materials);
//             }
//             result.add(mesh);
//         }
//         result.castShadow = true;
//         result.receiveShadow = true;
//         return result;
//     }

//     public static generateCylinder(cylinder: CylinderPolygon, materials: Material | Material[]): THREE.Mesh {
//         const height = this.unitConvert(cylinder.h);
//         const shape = this.generateCylinderShape(cylinder.r);
//         const geometry = this.generateGeometry(shape, height);
//         geometry.computeBoundingBox();
//         geometry.rotateX(90 / 180 * 3.14);
//         geometry.translate(0, -geometry.boundingBox.min.y, 0);
//         const mesh = new THREE.Mesh(geometry, materials);
//         mesh.position.set(this.unitConvert(cylinder.p[0]), 0, this.unitConvert(cylinder.p[1]));
//         mesh.name = 'graphic_' + cylinder.id;
//         this.mapCubeUV(mesh);
//         mesh.receiveShadow = true;
//         mesh.castShadow = true;
//         return mesh;
//     }


//     public static generateCube(cube: CubePolygon, materials: Material | Material[]): THREE.Mesh {
//         const height = this.unitConvert(cube.h);
//         const shape = this.generateWallShape(cube.points);
//         const geometry = this.generateGeometry(shape, height);
//         geometry.computeBoundingBox();
//         geometry.rotateX(90 / 180 * 3.14);
//         geometry.translate(0, -geometry.boundingBox.min.y, 0);
//         const mesh = new THREE.Mesh(geometry, materials);
//         mesh.position.set(this.unitConvert(cube.p[0]), 0, this.unitConvert(cube.p[1]));
//         mesh.name = 'graphic_' + cube.id;
//         this.mapCubeUV(mesh);
//         mesh.receiveShadow = true;
//         mesh.castShadow = true;
//         return mesh;
//     }



//     /**
//      * 生成单个
//      * @param wall 
//      * @param materials 
//      */
//     public static generateWall(wall: WallPolygon, materials: Material | Material[]): THREE.Mesh {
//         //find center
//         //offset points
//         // set position center
//         let height = this.unitConvert(wall.h);
//         const shape = this.generateWallShape(wall.points);
//         const geometry = this.generateGeometry(shape, height);
//         geometry.computeBoundingBox();
//         geometry.rotateX(90 / 180 * 3.14);
//         geometry.translate(0, -geometry.boundingBox.min.y, 0);
//         let mesh: THREE.Mesh = new THREE.Mesh(geometry, materials);
//         mesh.position.set(this.unitConvert(wall.p[0]), 0, this.unitConvert(wall.p[1]));
//         if (wall.holes.length > 0) {
//             for (let i = 0; i < wall.holes.length; i++) {
//                 const hole = wall.holes[i];
//                 const holeShape = this.generateWallShape(hole.points);
//                 const holeGeometry = this.generateGeometry(holeShape, this.unitConvert(hole.h));
//                 holeGeometry.rotateX(90 / 180 * 3.14);
//                 holeGeometry.translate(0, this.unitConvert(hole.h), 0);
//                 let holeMesh = new THREE.Mesh(holeGeometry);
//                 holeMesh.position.set(this.unitConvert(hole.p[0]), this.unitConvert(hole.g), this.unitConvert(hole.p[1]));
//                 // result.add(holeMesh);
//                 mesh = MeshHelper.subtract(mesh, holeMesh, materials);
//             }
//         }
//         //ThreeUvMapper.assignUVs(mesh.geometry as THREE.Geometry);
//         mesh.name = 'graphic_' + wall.id;
//         this.mapCubeUV(mesh);
//         mesh.receiveShadow = true;
//         mesh.castShadow = true;
//         return mesh;
//     }


//     private static unitConvert(value: number): number {
//         return value / 10;
//     }




//     private static mapCubeUV(mesh: THREE.Mesh) {
//         mesh.geometry.computeBoundingBox();
//         const max = mesh.geometry.boundingBox.max;
//         const min = mesh.geometry.boundingBox.min;
//         const offset = new THREE.Vector3(0 - min.x, 0 - min.y, 0 - min.z);
//         const range = new THREE.Vector3(max.x - min.x, max.y - min.y  /* minHeight */, max.z - min.z);
//         if (mesh.geometry instanceof THREE.Geometry) {
//             const faces = mesh.geometry.faces;
//             mesh.geometry.faceVertexUvs[0] = [];
//             for (let i = 0; i < faces.length; i++) {
//                 //
//                 const v1 = mesh.geometry.vertices[faces[i].a];
//                 const v2 = mesh.geometry.vertices[faces[i].b];
//                 const v3 = mesh.geometry.vertices[faces[i].c];
//                 if (Math.abs(max.y - v1.y) > 1 || Math.abs(max.y - v2.y) > 1 || Math.abs(max.y - v3.y) > 1) {
//                     if (Math.abs(v1.z - v2.z) < 1 && Math.abs(v3.z - v2.z) < 1) {
//                         // z面
//                         faces[i].materialIndex = 1;
//                         mesh.geometry.faceVertexUvs[0].push([
//                             new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y),
//                             new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y),
//                             new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y)
//                         ]);
//                     }
//                     else {
//                         // x面
//                         faces[i].materialIndex = 1;
//                         mesh.geometry.faceVertexUvs[0].push([
//                             new THREE.Vector2((v1.z + offset.z) / range.z, (v1.y + offset.y) / range.y),
//                             new THREE.Vector2((v2.z + offset.z) / range.z, (v2.y + offset.y) / range.y),
//                             new THREE.Vector2((v3.z + offset.z) / range.z, (v3.y + offset.y) / range.y)
//                         ]);
//                     }
//                 } else {
//                     // y面
//                     faces[i].materialIndex = 0;
//                     mesh.geometry.faceVertexUvs[0].push([
//                         new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y),
//                         new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y),
//                         new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y)
//                     ]);
//                 }
//             }
//         }
//         if (mesh.geometry instanceof THREE.Geometry) {
//             mesh.geometry.uvsNeedUpdate = true;
//             mesh.geometry.verticesNeedUpdate = true;
//             // mesh.geometry.computeFaceNormals();
//             // mesh.geometry.computeVertexNormals();
//             mesh.geometry.computeFaceNormals(); //重新计算几何体侧面法向量
//             mesh.geometry.computeVertexNormals();
//             mesh.geometry.groupsNeedUpdate = true;
//             mesh.geometry.uvsNeedUpdate = true;
//             // mesh.geometry.computeVertexNormals();
//         }
//         if (mesh.material instanceof THREE.Material) {
//             mesh.material.flatShading = THREE.FlatShading as any;
//             mesh.material.needsUpdate = true; //更新纹理
//         } else if (mesh.material instanceof Array) {
//             for (let m of mesh.material) {
//                 m.flatShading = THREE.FlatShading as any;
//                 m.needsUpdate = true; //更新纹理
//             }
//         }


//         //   mesh.geometry.buffersNeedUpdate = true;



//     }

//     /**
//     曲线分段 = int 。曲线上的点数。默认值为 12。
//     步骤 = int 。用于沿拉伸样条深度细分线段的点数。默认值为 1。
//     深度 = 浮动。拉伸形状的深度。默认值为 100。
//     斜面可操作 = 布尔。将斜面应用到形状上。默认值为 true。
//     斜面+ 浮动。斜面的原形有多深。默认值为 6。
//     斜面大小 = 浮动。与斜面延伸的形状轮廓的距离。默认值为斜面病 - 2。
//     斜面关闭 = 浮动。与斜面开始的形状轮廓的距离。默认值为 0。
//     斜面塞 = int 。斜面图层数。默认值为 3。
//     拉伸路径 = 三。曲线。应拉伸形状的 3D 样条路径。不支持路径拉伸的斜面。
//     UVGenerator = 对象。提供紫外线发生器功能的对象
//  */


//     /**
//        curveSegments — int. Number of points on the curves. Default is 12.
//        steps — int. Number of points used for subdividing segments along the depth of the extruded spline. Default is 1.
//        depth — float. Depth to extrude the shape. Default is 100.
//        bevelEnabled — bool. Apply beveling to the shape. Default is true.
//        bevelThickness — float. How deep into the original shape the bevel goes. Default is 6.
//        bevelSize — float. Distance from the shape outline that the bevel extends. Default is bevelThickness - 2.
//        bevelOffset — float. Distance from the shape outline that the bevel starts. Default is 0.
//        bevelSegments — int. Number of bevel layers. Default is 3.
//        extrudePath — THREE.Curve. A 3D spline path along which the shape should be extruded. Bevels not supported for path extrusion.
//        UVGenerator — Object. object that provides UV generator functions
//             depth: 100,
//             bevelThickness: 0, //厚度
//             bevelSize: 0,   //斜面大小
//             bevelSegments: 4, //横面
//             bevelOffset: 0,
//      */
//     private static generateGeometry(shape: THREE.Shape, depth: number): THREE.ExtrudeGeometry {
//         var options = {
//             depth: depth,
//             bevelEnabled: false,
//             curveSegments: 0,
//             steps: 1,
//             bevelThickness: 0,
//             bevelSize: 0,
//             bevelOffset: 0,
//             bevelSegments: 0,
//             // UVGenerator: new IUVGenerator()
//         };
//         return new THREE.ExtrudeGeometry(shape, options);
//     }





//     private static generateWallShape(array: number[][]): THREE.Shape {
//         var shape = new THREE.Shape();
//         shape.moveTo(this.unitConvert(array[0][0]), this.unitConvert(array[0][1]));
//         for (let i = 1; i < array.length; i++) {
//             shape.lineTo(this.unitConvert(array[i][0]), this.unitConvert(array[i][1]));
//         }
//         shape.closePath();
//         // 返回shape
//         return shape;
//     }




//     private static generateCylinderShape(radius: number): THREE.Shape {
//         var shape = new THREE.Shape();
//         let r = this.unitConvert(radius);
//         shape.absellipse(0, 0, r, r, 0, Math.PI * 2, true, 0);
//         shape.closePath();
//         // 返回shape
//         return shape;
//     }





// }