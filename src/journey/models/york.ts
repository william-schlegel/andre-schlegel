import type { BufferGeometry } from 'three';
import { body, cast, pair, propeller, surface, tip, wheel, wing, type Rib } from './kit';

/**
 * Avro York (1942): the wing, the four Merlins and the tail of the Lancaster on a new,
 * square-sided fuselage hung under the wing, with a third fin on its back to steady it.
 * Span 31.09 m, length 23.93 m.
 */
export function york(): BufferGeometry {
  const parts: BufferGeometry[] = [];

  // the fuselage: a long box with rounded corners, twice as roomy as the bomber's
  parts.push(
    body([
      [10.4, -0.5, 0.18, 0.22, 2.2],
      [10.0, -0.42, 0.6, 0.62, 2.5],
      [9.0, -0.2, 1.05, 1.0, 3],
      [7.6, 0.0, 1.28, 1.3, 4.2],
      [5.0, 0.0, 1.32, 1.34, 4.6],
      [-3.5, 0.0, 1.32, 1.34, 4.6],
      [-8.0, 0.28, 1.02, 1.0, 3.8],
      [-11.6, 0.66, 0.58, 0.6, 2.8],
      [-13.1, 0.82, 0.3, 0.36, 2.3],
      [-13.5, 0.86, 0.08, 0.12, 2],
    ]),
  );

  // the pilots' hood, stepped up above the nose
  parts.push(
    body([
      [9.2, 0.82, 0.1, 0.05, 3],
      [8.6, 1.32, 0.72, 0.36, 3.2],
      [7.4, 1.5, 0.84, 0.42, 3.4],
      [6.2, 1.44, 0.78, 0.3, 3.2],
      [5.2, 1.3, 0.3, 0.06, 3],
    ]),
  );

  // the Lancaster's wing, laid on top of the fuselage: a flat centre section, the outer panels raised
  const root: Rib = { at: [4.3, 1.02, 0], chord: 4.95, thickness: 0.19 };
  const shoulder: Rib = { at: [4.3, 1.02, 1.3], chord: 4.95, thickness: 0.19 };
  const knee: Rib = { at: [4.2, 1.04, 5.1], chord: 4.4, thickness: 0.17 };
  const outer: Rib = { at: [3.25, 2.22, 14.9], chord: 1.9, thickness: 0.12 };
  parts.push(wing([root, shoulder, knee, outer, ...tip(outer, 0.645)]));

  // four Merlins in line: narrow, deep cowlings with the radiator under the chin, each ending in a pointed spinner
  const inner = 3.55;
  const outerAt = 7.35;
  parts.push(
    ...pair(
      body(
        [
          [7.55, 0.5, 0.05, 0.05, 2],
          [7.25, 0.5, 0.26, 0.26, 2],
          [6.95, 0.48, 0.38, 0.4, 2.1],
          [6.85, 0.36, 0.46, 0.64, 2.5],
          [5.6, 0.32, 0.5, 0.76, 2.7],
          [3.6, 0.34, 0.52, 0.8, 2.7],
          [1.2, 0.42, 0.46, 0.66, 2.5],
          [-0.6, 0.74, 0.28, 0.34, 2.2],
          [-1.6, 0.9, 0.05, 0.06, 2],
        ],
        18,
      ).translate(0, 0, inner),
    ),
  );
  parts.push(
    ...pair(
      body(
        [
          [7.2, 0.86, 0.05, 0.05, 2],
          [6.9, 0.86, 0.26, 0.26, 2],
          [6.6, 0.84, 0.38, 0.4, 2.1],
          [6.5, 0.72, 0.46, 0.64, 2.5],
          [5.3, 0.7, 0.5, 0.72, 2.7],
          [3.4, 0.8, 0.46, 0.6, 2.5],
          [1.6, 1.08, 0.26, 0.3, 2.2],
          [0.6, 1.22, 0.05, 0.06, 2],
        ],
        18,
      ).translate(0, 0, outerAt),
    ),
  );
  parts.push(
    propeller([7.05, 0.5, inner], 1.98, 3, 0.2),
    propeller([7.05, 0.5, -inner], 1.98, 3, -0.55),
    propeller([6.7, 0.86, outerAt], 1.98, 3, 0.75),
    propeller([6.7, 0.86, -outerAt], 1.98, 3, -0.1),
  );

  // the wheels, drawn up into the inner nacelles: a part of each still shows
  parts.push(wheel([3.4, -0.46, inner], 0.82, 0.46), wheel([3.4, -0.46, -inner], 0.82, 0.46));
  parts.push(wheel([-11.3, -0.06, 0], 0.3, 0.2));

  // tail: the bomber's tailplane with an oval fin at each end, and the York's own third fin between them
  const tailRoot: Rib = { at: [-10.6, 1.15, 0], chord: 3.0, thickness: 0.1 };
  const tailOuter: Rib = { at: [-10.9, 1.15, 4.95], chord: 2.3, thickness: 0.09 };
  parts.push(wing([tailRoot, tailOuter]));
  const finLow: Rib = { at: [-10.75, 0.3, 5.0], chord: 2.5, thickness: 0.08, lean: 90 };
  const finHigh: Rib = { at: [-10.7, 2.5, 5.0], chord: 2.6, thickness: 0.08, lean: 90 };
  parts.push(...pair(surface([...tip(finLow, -0.62, 'y').reverse(), finLow, finHigh, ...tip(finHigh, 0.62, 'y')])));
  const middleBase: Rib = { at: [-9.4, 1.3, 0], chord: 3.3, thickness: 0.08, lean: 90 };
  const middleTop: Rib = { at: [-10.5, 3.0, 0], chord: 2.0, thickness: 0.07, lean: 90 };
  parts.push(surface([middleBase, middleTop, ...tip(middleTop, 0.45, 'y')]));

  return cast(parts);
}

export const YORK = { span: 31.09, length: 23.93, lowest: -1.36 };
