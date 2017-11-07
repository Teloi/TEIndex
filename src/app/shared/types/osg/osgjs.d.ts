// declare module osg {
//
//   // vec3 is an object, not a class
//   export let Vec2;
//
//   export interface Vec2 {
//     create(): osg.Vec2;
//
//     createAndSet(x, y): osg.Vec2;
//
//     set(x, y, z, result: osg.Vec2): osg.Vec2;
//
//     length(): number;
//   }
//
//   // vec3 is an object, not a class
//   export let Vec3;
//
//   export interface Vec3 {
//     copy(a: osg.Vec3, result: osg.Vec3): osg.Vec3;
//
//     create(): osg.Vec3;
//
//     createAndSet(x, y, z): osg.Vec3;
//
//     set(x, y, z, result: osg.Vec3): osg.Vec3;
//
//     distance(a: osg.Vec3, b: osg.Vec3): number;
//
//     length(): number;
//
//     add(a: osg.Vec3, b: osg.Vec3, result: osg.Vec3): osg.Vec3;
//
//     sub(a: osg.Vec3, b: osg.Vec3, result: osg.Vec3): osg.Vec3;		// note:  a - b = result
//     mult(a: osg.Vec3, b: number, result: osg.Vec3): osg.Vec3;
//
//     normalize(a: osg.Vec3, result: osg.Vec3): osg.Vec3;
//
//     neg(a: osg.Vec3, result: osg.Vec3): osg.Vec3;
//   }
//
//
//   export let Vec4;
//
//   export interface Vec4 {
//     // createAndSet(x, y, z, w): osg.Vec4;
//     fromValues(x, y, z, w): osg.Vec4;
//   }
//
//   /*
//   export class Vec4 {
//     constructor(x, y, z, w);
//   }
//   */
//
//   // Matrix is an object, not a class
//   export let Matrix;
//
//   export interface Matrix {
//     create(): osg.Matrix;
//
//     setTrans(m: osg.Matrix, x: number, y: number, z: number): osg.Matrix;
//
//     getTrans(m: osg.Matrix, result: osg.Vec3): osg.Matrix;
//
//     makeTranslate(x, y, z, matrix);
//
//     getRotate(m: osg.Matrix, result: osg.Quat): osg.Quat;
//
//     setRotateFromQuat(m: osg.Matrix, q: osg.Quat): osg.Matrix;
//
//     makeOrtho(left: number, right: number, bottom: number, top: number, zNear: number, zFar: number, result: osg.Matrix);
//
//     makeScale(x, y, z, result?: osg.Matrix): osg.Matrix;
//
//     preMultScale(m: osg.Matrix, scale: osg.Vec3): osg.Matrix;
//
//     mult(a: osg.Matrix, b: osg.Matrix, result: osg.Matrix): osg.Matrix;				// arrrg,.. it is doing b * a (opposite of everything else)
//     inverse(m: osg.Matrix, result: osg.Matrix): osg.Matrix;
//
//     transformVec3(m: osg.Matrix, v: osg.Vec3, result: osg.Vec3): osg.Vec3;
//   }
//
//   export let Quat;
//
//   export interface Quat {
//     create(): osg.Quat;
//
//     transformVec3(q: osg.Quat, a: osg.Vec3, result: osg.Vec3): osg.Vec3;
//
//     makeRotateFromTo(from: osg.Vec3, to: osg.Vec3, out: osg.Quat): osg.Quat;
//   }
//
//
//   export let Plane;
//
//   export interface Plane extends osg.Vec4 {
//     create(): osg.Vec4;
//
//     // createAndSet(a, b, c, d): osg.Vec4;
//     setNormal(plane: osg.Plane, n: osg.Vec3);
//
//     setDistance(plane: osg.Plane, d: number);
//   }
//
//   /*
//   export class Plane {
//     //constructor(p:osg.Vec4);
//     setNormal(plane: osg.Plane, n: osg.Vec3);
//     setDistance(plane: osg.Plane, d: number);
//   }
//   */
//
//   export class StateAttribute {
//   }
//
//   export class StateSet {
//     setAttributeAndModes(attribute: StateAttribute, mode?);
//   }
//
//   export class CullFace extends StateAttribute {
//     static DISABLE: number;
//     static FRONT: number;
//     static BACK: number;
//     static FRONT_AND_BACK: number;
//
//     constructor(mode);
//   }
//
//   export class PrimitiveSet {
//     static POINTS: number;
//     static LINES: number;
//     static LINE_LOOP: number;
//     static LINE_STRIP: number;
//     static TRIANGLES: number;
//     static TRIANGLE_STRIP: number;
//     static TRIANGLE_FAN: number;
//   }
//
//   export class DrawElements {
//     constructor(mode, indices);
//   }
//
//   export class DrawArrays {
//     constructor(mode, first, count);
//   }
//
//   export class BufferArray {
//
//     static ELEMENT_ARRAY_BUFFER: number;
//     static ARRAY_BUFFER: number;
//
//     constructor(target, elements, itemSize, preserveArrayType?);
//   }
//
//   export class Utils {
//   }
//
//   export class Node {
//     addChild(node: osg.Node);
//
//     getOrCreateStateSet(): StateSet;
//
//     addUpdateCallback(cb): boolean;
//
//     dirtyBound();
//   }
//
//   export class Transform extends Node {
//     static RELATIVE_RF: number;
//     static ABSOLUTE_RF: number;
//   }
//
//   export class Viewport {
//     constructor(x: number, y: number, w: number, h: number);
//   }
//
//   export class CullSettings {
//   }
//
//   export class Camera extends osg.Transform {		// typescript does not allow multiple class; missing osg.CullSettings
//     static PRE_RENDER: number;
//     static NESTED_RENDER: number;
//     static POST_RENDER: number;
//
//     addChild(node: osg.Node);
//
//     setName(name: string);
//
//     getProjectionMatrix(): osg.Matrix;
//
//     setRenderOrder(order, orderNum: number);
//
//     setReferenceFrame(value);
//
//     setViewport(vp);
//
//     attachTexture(bufferComponent, texture, textureTarget?);
//
//     getViewMatrix(): osg.Matrix;
//   }
//
//   export class MatrixTransform extends Transform {
//     getMatrix(): osg.Matrix;
//   }
//
//   export class Texture {
//
//     static createFromURL(url: string);
//
//     setTextureSize(w: number, h: number);
//
//     setMinFilter(value: number | string);
//
//     setMagFilter(value: number | string);
//   }
//
//   export class FrameBufferObject {
//
//     static COLOR_ATTACHMENT0;
//     static DEPTH_ATTACHMENT;
//     static DEPTH_COMPONENT16;
//   }
//
//   export class Geometry extends osg.Node {
//     getAttributes();
//
//     getPrimitives();
//
//     dirty();
//   }
//
//   // shapes
//   export function createAxisGeometry(size: number): osg.Geometry;
//
//   export function createTexturedQuadGeometry(cornerx, cornery, cornerz,
//                                              wx, wy, wz, hx, hy, hz, l?: number, b?: number, r?: number, t?: number): osg.Geometry;
//
//   export function createGridGeometry(cx, cy, cz, wx, wy, wz, hx, hy, hz, res1, res2): osg.Geometry;
//
//   export function createTexturedSphereGeometry(radius, widthSegments?: number, heightSegments?: number,
//                                                phiStart?: number, phiLength?: number, thetaStart?: number,
//                                                thetaLength?: number): osg.Geometry;
//
// }
//
// declare module osgViewer {
//
//   export class View {
//     getCamera(): osg.Camera;
//
//     // this does not follow the original OpenSceneGraph inheritance diagram
//     // ( the getCamera should be in the osg.View but that does not exist in osgjs )
//   }
//
//   export class Viewer extends osgViewer.View {
//     _useVR: boolean;
//     _requestID: number;
//     _hmd: any;
//     _eventProxy: any;
//
//     constructor(canvas: HTMLElement);
//
//     init();
//
//     setSceneData(node: osg.Node);
//
//     setupManipulator();
//
//     getGraphicContext();
//
//     done(): boolean;
//
//     frame();
//
//     run();
//   }
// }
//
// declare module OSG {
//   export function globalify();
// }