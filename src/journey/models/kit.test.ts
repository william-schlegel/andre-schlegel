import type { BufferGeometry } from 'three';
import { describe, expect, it } from 'vitest';
import { anson } from './anson';
import { bloch200 } from './bloch200';
import { bloch210 } from './bloch210';
import { c54 } from './c54';
import { db7 } from './db7';
import { halifax } from './halifax';
import { ju52 } from './ju52';
import { body, mirrored, section, loft, volume } from './kit';
import { potez25 } from './potez25';
import { wellington } from './wellington';
import { york } from './york';

const held = (geometry: BufferGeometry) => volume(geometry.getAttribute('position').array, geometry.getIndex()!.array);

/** How far the normals point out of the solid: 1 when every one of them does. */
function outwardness(geometry: BufferGeometry): number {
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const middle = [(box.min.x + box.max.x) / 2, (box.min.y + box.max.y) / 2, (box.min.z + box.max.z) / 2];
  let out = 0;
  for (let i = 0; i < positions.count; i++) {
    const away = (positions.getX(i) - middle[0]) * normals.getX(i) + (positions.getY(i) - middle[1]) * normals.getY(i) + (positions.getZ(i) - middle[2]) * normals.getZ(i);
    if (away > 0) out++;
  }
  return out / positions.count;
}

describe('the airframe kit', () => {
  const stations: [number, number, number, number][] = [
    [2, 0, 0.1, 0.1],
    [1, 0, 1, 1],
    [-1, 0, 1, 1],
    [-2, 0, 0.1, 0.1],
  ];

  it('turns the faces of a solid outwards whichever way its rings run', () => {
    const one = body(stations);
    const other = loft(stations.map(([x, y, w, h]) => section(x, y, w, h).reverse()));
    for (const solid of [one, other]) {
      expect(held(solid)).toBeGreaterThan(0);
      expect(outwardness(solid)).toBeGreaterThan(0.95);
    }
  });

  it('keeps them outwards in a mirror', () => {
    const mirror = mirrored(body(stations).translate(0, 0, 3));
    expect(held(mirror)).toBeGreaterThan(0);
    expect(outwardness(mirror)).toBeGreaterThan(0.95);
  });

  it('casts every model as solids that hold a volume', () => {
    for (const make of [bloch200, potez25, bloch210, db7, anson, wellington, halifax, ju52, c54, york]) expect(held(make())).toBeGreaterThan(0);
  });
});
