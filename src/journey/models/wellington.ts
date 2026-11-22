import type { BufferGeometry } from 'three';
import { body, cast, dome, pair, propeller, surface, tip, wheel, wing, type Rib } from './kit';

/**
 * Vickers Wellington (1936): a long, deep, oval fuselage with a gun turret at each end, a
 * slender wing set at mid-height, two big radials and one tall fin. Span 26.26 m,
 * length 19.69 m.
 */
export function wellington(): BufferGeometry {
  const parts: BufferGeometry[] = [];

  // the fuselage: the nose turret, the deep belly of the bomb bay, the tail turret
  parts.push(
    body([
      [9.85, 0.12, 0.14, 0.18, 2],
      [9.62, 0.1, 0.44, 0.52, 2],
      [9.1, 0.06, 0.62, 0.8, 2.2],
      [8.3, 0.0, 0.82, 1.1, 2.4],
      [6.5, 0.0, 0.98, 1.38, 2.6],
      [3.0, 0.0, 1.02, 1.45, 2.6],
      [-1.0, 0.02, 1.0, 1.4, 2.6],
      [-5.0, 0.15, 0.8, 1.12, 2.5],
      [-8.2, 0.3, 0.55, 0.78, 2.3],
      [-9.3, 0.36, 0.46, 0.62, 2.1],
      [-9.7, 0.36, 0.34, 0.46, 2],
      [-9.84, 0.36, 0.12, 0.18, 2],
    ]),
  );

  // the pilots' hood, and the navigator's astrodome
  parts.push(
    body([
      [7.6, 1.04, 0.1, 0.05, 3],
      [7.1, 1.4, 0.5, 0.3, 3.2],
      [6.0, 1.56, 0.56, 0.36, 3.4],
      [5.0, 1.5, 0.5, 0.26, 3.2],
      [4.2, 1.36, 0.2, 0.06, 3],
    ]),
  );
  parts.push(dome([2.0, 1.4, 0], 0.32, 0.3, 0.32));

  // the wing, at mid-height: long and narrow, with a marked dihedral
  const root: Rib = { at: [5.6, -0.1, 0], chord: 5.2, thickness: 0.17 };
  const shoulder: Rib = { at: [5.6, -0.08, 1.0], chord: 5.2, thickness: 0.17 };
  const outer: Rib = { at: [3.3, 0.78, 12.5], chord: 1.7, thickness: 0.11 };
  parts.push(wing([root, shoulder, outer, ...tip(outer, 0.63)]));

  // two large radials; the nacelles end behind the trailing edge
  const engineAt = 3.6;
  const nacelle = body(
    [
      [7.75, -0.08, 0.4, 0.4, 2],
      [7.65, -0.08, 0.7, 0.7, 2],
      [6.7, -0.08, 0.72, 0.72, 2],
      [6.6, -0.08, 0.58, 0.58, 2],
      [4.8, -0.18, 0.6, 0.76, 2.3],
      [2.2, -0.22, 0.52, 0.62, 2.3],
      [0.2, -0.08, 0.3, 0.34, 2.2],
      [-0.8, 0.06, 0.05, 0.06, 2],
    ],
    18,
  ).translate(0, 0, engineAt);
  parts.push(...pair(nacelle));
  parts.push(propeller([7.9, -0.08, engineAt], 1.9, 3, 0.25), propeller([7.9, -0.08, -engineAt], 1.9, 3, -0.6));

  // the wheels, drawn up into the nacelles: a part of each still shows
  parts.push(wheel([4.3, -0.82, engineAt], 0.62, 0.36), wheel([4.3, -0.82, -engineAt], 0.62, 0.36));
  parts.push(wheel([-8.1, -0.5, 0], 0.24, 0.16));

  // tail: one tall fin, the tailplane on the fuselage
  const finBase: Rib = { at: [-6.5, 1.0, 0], chord: 3.2, thickness: 0.09, lean: 90 };
  const finTop: Rib = { at: [-8.1, 3.95, 0], chord: 1.6, thickness: 0.07, lean: 90 };
  parts.push(surface([finBase, finTop, ...tip(finTop, 0.42, 'y')]));
  const tailRoot: Rib = { at: [-6.8, 0.6, 0], chord: 2.9, thickness: 0.1 };
  const tailOuter: Rib = { at: [-7.8, 0.66, 3.6], chord: 1.4, thickness: 0.08 };
  parts.push(wing([tailRoot, tailOuter, ...tip(tailOuter, 0.36)]));

  return cast(parts);
}

export const WELLINGTON = { span: 26.26, length: 19.69, lowest: -1.45 };
