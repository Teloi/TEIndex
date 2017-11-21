export class Volume {
  /**
   * compute the geometry volume
   * @param geometry
   * @returns {number}
   */
  static computeVolume(geometry) {

    if (geometry instanceof THREE.BufferGeometry) {
      geometry = new THREE.Geometry().fromBufferGeometry(geometry);
    }

    let volume = 0;
    for (let f = 0, fl = geometry.faces.length; f < fl; f++) {
      const face = geometry.faces[f];

      const vA = geometry.vertices[face.a];
      const vB = geometry.vertices[face.b];
      const vC = geometry.vertices[face.c];

      const x1 = vA.x,
        x2 = vB.x,
        x3 = vC.x;
      const y1 = vA.y,
        y2 = vB.y,
        y3 = vC.y;
      const z1 = vA.z,
        z2 = vB.z,
        z3 = vC.z;
      const V = (-x3 * y2 * z1 + x2 * y3 * z1 + x3 * y1 * z2 - x1 * y3 * z2 - x2 * y1 * z3 + x1 * y2 * z3) / 6;
      volume += V;
    }

    return volume;

  }

  /**
   * compute the buffergeometry volume
   * @param geometry
   * @returns {number}
   */
  static computeVolume_BufferGeometry_NoIndex(geometry) {

    const points = [];
    const positions = geometry.getAttribute('position').array;
    for (let i = 0; i < positions.length; i += 3) {
      points.push(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
    }
    let volume = 0;
    for (let i = 2; i < points.length; i += 3) {
      const vA = points[i - 2];
      const vB = points[i - 1];
      const vC = points[i];

      const x1 = vA.x,
        x2 = vB.x,
        x3 = vC.x;
      const y1 = vA.y,
        y2 = vB.y,
        y3 = vC.y;
      const z1 = vA.z,
        z2 = vB.z,
        z3 = vC.z;
      const V = (-x3 * y2 * z1 + x2 * y3 * z1 + x3 * y1 * z2 - x1 * y3 * z2 - x2 * y1 * z3 + x1 * y2 * z3) / 6;
      volume += V;
    }
    return volume;
  }
}
