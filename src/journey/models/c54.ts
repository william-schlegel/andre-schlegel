import type { BufferGeometry } from 'three';
import { body, cast, dome, pair, propeller, strut, surface, tip, wheel, wing, type Rib } from './kit';

/**
 * Douglas C-54 Skymaster (1942), the military DC-4: a long round fuselage, a low tapered
 * wing with four radials, one tall fin, and a nose wheel: it stands level on three legs.
 * Span 35.81 m, length 28.60 m.
 */
export function c54(): BufferGeometry {
  const parts: BufferGeometry[] = [];

  // the fuselage: a tube, the windscreen flush with the nose
  parts.push(
    body([
      [12.3, -0.3, 0.14, 0.18, 2],
      [11.9, -0.26, 0.56, 0.6, 2],
      [10.8, -0.1, 1.1, 1.15, 2],
      [9.2, 0.0, 1.46, 1.52, 2.1],
      [7.2, 0.0, 1.57, 1.62, 2.1],
      [-4.5, 0.0, 1.57, 1.62, 2.1],
      [-10.0, 0.34, 1.16, 1.22, 2.1],
      [-14.2, 0.84, 0.52, 0.62, 2],
      [-15.9, 1.02, 0.16, 0.26, 2],
      [-16.3, 1.05, 0.04, 0.08, 2],
    ]),
  );
  // the navigator's astrodome
  parts.push(dome([7.0, 1.56, 0], 0.3, 0.24, 0.3));

  // the wing, under the fuselage: swept back along its leading edge, straight behind, the tips raised
  const root: Rib = { at: [4.7, -0.92, 0], chord: 5.7, thickness: 0.17 };
  const side: Rib = { at: [4.7, -0.9, 1.5], chord: 5.7, thickness: 0.17 };
  const outer: Rib = { at: [1.7, 1.1, 17.2], chord: 2.05, thickness: 0.12 };
  parts.push(wing([root, side, outer, ...tip(outer, 0.705)]));

  // four radials; the inner nacelles are longer: the main wheels fold into them
  const inner = 4.25;
  const outerAt = 8.45;
  parts.push(
    ...pair(
      body(
        [
          [6.95, -0.3, 0.42, 0.42, 2],
          [6.85, -0.3, 0.7, 0.7, 2],
          [5.95, -0.3, 0.72, 0.72, 2],
          [5.85, -0.3, 0.58, 0.58, 2],
          [4.2, -0.36, 0.6, 0.72, 2.2],
          [1.4, -0.42, 0.52, 0.6, 2.2],
          [-0.8, -0.3, 0.26, 0.28, 2.1],
          [-1.7, -0.22, 0.05, 0.06, 2],
        ],
        18,
      ).translate(0, 0, inner),
    ),
  );
  parts.push(
    ...pair(
      body(
        [
          [6.2, 0.2, 0.42, 0.42, 2],
          [6.1, 0.2, 0.7, 0.7, 2],
          [5.2, 0.2, 0.72, 0.72, 2],
          [5.1, 0.2, 0.58, 0.58, 2],
          [3.5, 0.16, 0.56, 0.62, 2.2],
          [1.4, 0.18, 0.4, 0.42, 2.1],
          [0.0, 0.26, 0.05, 0.06, 2],
        ],
        18,
      ).translate(0, 0, outerAt),
    ),
  );
  parts.push(
    propeller([7.1, -0.3, inner], 2.0, 3, 0.2),
    propeller([7.1, -0.3, -inner], 2.0, 3, -0.55),
    propeller([6.35, 0.2, outerAt], 2.0, 3, 0.75),
    propeller([6.35, 0.2, -outerAt], 2.0, 3, -0.1),
  );

  // the tricycle undercarriage: twin wheels under each inner nacelle, and a leg under the nose
  parts.push(...pair(strut([2.6, -0.9, inner], [2.6, -2.75, inner], 0.26, 0.2)));
  for (const hand of [1, -1]) {
    parts.push(wheel([2.6, -2.95, hand * (inner + 0.3)], 0.56, 0.3), wheel([2.6, -2.95, hand * (inner - 0.3)], 0.56, 0.3));
  }
  parts.push(strut([10.2, -1.2, 0], [10.3, -3.0, 0], 0.2, 0.16), wheel([10.32, -3.13, 0], 0.38, 0.24));

  // tail: one tall fin with a long fillet, the tailplane on the fuselage
  const finBase: Rib = { at: [-10.4, 1.4, 0], chord: 5.2, thickness: 0.09, lean: 90 };
  const finTop: Rib = { at: [-13.9, 5.1, 0], chord: 2.2, thickness: 0.07, lean: 90 };
  parts.push(surface([finBase, finTop, ...tip(finTop, 0.5, 'y')]));
  const tailRoot: Rib = { at: [-11.6, 1.0, 0], chord: 3.7, thickness: 0.1 };
  const tailOuter: Rib = { at: [-13.2, 1.3, 5.75], chord: 1.7, thickness: 0.08 };
  parts.push(wing([tailRoot, tailOuter, ...tip(tailOuter, 0.4)]));

  return cast(parts);
}

export const C_54 = { span: 35.81, length: 28.6, lowest: -3.52 };
