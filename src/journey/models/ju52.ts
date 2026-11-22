import type { BufferGeometry } from 'three';
import { body, cast, pair, propeller, strut, surface, tip, wheel, wing, type Rib } from './kit';

/**
 * Junkers Ju 52/3m (1932), built on in France after the war as the AAC.1 « Toucan »: a
 * square fuselage, three radials (one on the nose), a broad low wing with its flaps hung
 * behind it like a second, narrow wing, and a fixed undercarriage. Span 29.25 m,
 * length 18.90 m.
 */
export function ju52(): BufferGeometry {
  const parts: BufferGeometry[] = [];

  // the fuselage: the nose engine in its ring, then a box that tapers to the fin
  parts.push(
    body([
      [8.9, 0.1, 0.42, 0.42, 2],
      [8.8, 0.1, 0.72, 0.72, 2],
      [8.0, 0.1, 0.74, 0.74, 2],
      [7.9, 0.1, 0.56, 0.58, 2.2],
      [6.9, 0.16, 0.74, 0.86, 3.2],
      [5.6, 0.3, 0.84, 1.14, 4.4],
      [-1.5, 0.3, 0.84, 1.14, 4.6],
      [-6.0, 0.46, 0.58, 0.84, 3.8],
      [-9.0, 0.7, 0.2, 0.42, 2.8],
      [-9.75, 0.76, 0.05, 0.22, 2.2],
    ]),
  );

  // the pilots' cabin: a low glasshouse, flush with the top of the box
  parts.push(
    body([
      [6.9, 1.04, 0.1, 0.05, 3],
      [6.4, 1.42, 0.62, 0.28, 3.6],
      [5.5, 1.52, 0.72, 0.3, 3.8],
      [4.7, 1.48, 0.7, 0.1, 3.6],
    ]),
  );

  // the wing, under the fuselage: very broad at the root, swept back along its leading edge
  const root: Rib = { at: [5.3, -0.76, 0], chord: 4.9, thickness: 0.2 };
  const side: Rib = { at: [5.3, -0.74, 0.85], chord: 4.9, thickness: 0.2 };
  const outer: Rib = { at: [2.3, 0.42, 14.0], chord: 1.8, thickness: 0.13 };
  parts.push(wing([root, side, outer, ...tip(outer, 0.625)]));
  // the « double wing »: flaps and ailerons carried clear of the trailing edge, a little below it
  const flapRoot: Rib = { at: [0.22, -1.0, 0.95], chord: 0.8, thickness: 0.12 };
  const flapOuter: Rib = { at: [0.36, 0.2, 14.0], chord: 0.5, thickness: 0.12 };
  parts.push(...pair(surface([flapRoot, flapOuter])));

  // the two wing engines, ahead of the leading edge
  const engineAt = 2.95;
  parts.push(
    ...pair(
      body(
        [
          [6.9, -0.3, 0.4, 0.4, 2],
          [6.8, -0.3, 0.68, 0.68, 2],
          [6.05, -0.3, 0.7, 0.7, 2],
          [5.95, -0.3, 0.54, 0.54, 2],
          [4.5, -0.4, 0.5, 0.56, 2.2],
          [2.8, -0.5, 0.3, 0.32, 2.1],
          [1.8, -0.52, 0.05, 0.06, 2],
        ],
        18,
      ).translate(0, 0, engineAt),
    ),
  );
  parts.push(propeller([9.05, 0.1, 0], 1.45, 2, 0.5), propeller([7.05, -0.3, engineAt], 1.45, 2, 1.25), propeller([7.05, -0.3, -engineAt], 1.45, 2, -0.2));

  // the fixed undercarriage: a leg under each wing engine, braced to the wing and to the fuselage
  const axle: [number, number, number] = [4.35, -2.55, engineAt + 0.1];
  parts.push(...pair(strut([4.3, -0.95, engineAt], axle, 0.24, 0.18)));
  parts.push(...pair(strut([2.2, -0.9, engineAt], axle, 0.14, 0.1)));
  parts.push(...pair(strut([4.2, -0.8, 0.8], axle, 0.14, 0.1)));
  parts.push(wheel(axle, 0.62, 0.34), wheel([axle[0], axle[1], -axle[2]], 0.62, 0.34));
  parts.push(wheel([-8.7, -0.32, 0], 0.24, 0.16));

  // tail: one broad fin, the tailplane low on it
  const finBase: Rib = { at: [-6.6, 1.2, 0], chord: 3.1, thickness: 0.09, lean: 90 };
  const finTop: Rib = { at: [-8.5, 3.45, 0], chord: 1.6, thickness: 0.07, lean: 90 };
  parts.push(surface([finBase, finTop, ...tip(finTop, 0.4, 'y')]));
  const tailRoot: Rib = { at: [-6.9, 0.95, 0], chord: 2.7, thickness: 0.1 };
  const tailOuter: Rib = { at: [-7.5, 0.95, 4.7], chord: 1.6, thickness: 0.08 };
  parts.push(wing([tailRoot, tailOuter, ...tip(tailOuter, 0.36)]));

  return cast(parts);
}

export const JU_52 = { span: 29.25, length: 18.9, lowest: -3.18 };
