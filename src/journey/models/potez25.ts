import type { BufferGeometry } from 'three';
import { body, cast, pair, propeller, strut, surface, tip, wheel, wing, type Rib } from './kit';

/**
 * Potez 25 (1925): a two-seat sesquiplane — a broad upper wing, a much smaller lower one —
 * with a twelve-cylinder engine in a pointed nose, two open cockpits one behind the other
 * and a fixed, cross-axle undercarriage. Span 14.14 m, length 9.1 m.
 */
export function potez25(): BufferGeometry {
  const parts: BufferGeometry[] = [];

  parts.push(
    body([
      [4.25, 0.05, 0.26, 0.3, 2.5],
      [4.0, 0.03, 0.42, 0.5, 3],
      [3.0, 0, 0.48, 0.6, 3.2],
      [1.5, 0, 0.5, 0.62, 3.5],
      [0, 0, 0.48, 0.6, 3.5],
      [-2.0, 0.08, 0.36, 0.45, 3.2],
      [-3.8, 0.2, 0.18, 0.28, 3],
      [-4.75, 0.28, 0.04, 0.16, 2.5],
    ]),
  );

  // the engine's three banks of cylinders, in a W under their fairings
  const bank = (y: number, z: number) =>
    body(
      [
        [3.95, y, 0.04, 0.04],
        [3.7, y, 0.17, 0.15],
        [2.75, y, 0.17, 0.15],
        [2.45, y, 0.04, 0.04],
      ],
      10,
    ).translate(0, 0, z);
  parts.push(bank(0.62, 0), bank(0.34, 0.44), bank(0.34, -0.44));
  parts.push(propeller([4.42, 0.05, 0], 1.5, 2, 0.5));

  // the pilot's windscreen and the ring of the observer's gun
  parts.push(
    body(
      [
        [0.75, 0.62, 0.05, 0.02],
        [0.55, 0.78, 0.3, 0.16, 3],
        [0.45, 0.72, 0.32, 0.1, 3],
      ],
      10,
    ),
  );
  parts.push(
    body(
      [
        [-0.42, 0.66, 0.2, 0.05],
        [-0.55, 0.7, 0.4, 0.07],
        [-1.05, 0.7, 0.4, 0.07],
        [-1.18, 0.66, 0.2, 0.05],
      ],
      14,
    ),
  );

  // upper wing: broad and of constant chord; lower wing: short and narrow
  const upperRoot: Rib = { at: [2.35, 1.72, 0], chord: 2.3, thickness: 0.11 };
  const upperOuter: Rib = { at: [2.35, 1.86, 6.5], chord: 2.3, thickness: 0.1 };
  parts.push(wing([upperRoot, upperOuter, ...tip(upperOuter, 0.57)]));
  const lowerRoot: Rib = { at: [1.55, -0.45, 0], chord: 1.35, thickness: 0.1 };
  const lowerOuter: Rib = { at: [1.55, -0.32, 4.3], chord: 1.35, thickness: 0.1 };
  parts.push(wing([lowerRoot, lowerOuter, ...tip(lowerOuter, 0.4)]));

  // between the wings: a pair of struts leaning outwards, and a diagonal
  parts.push(
    ...pair(strut([1.2, -0.36, 3.9], [1.85, 1.78, 4.9], 0.2, 0.06)),
    ...pair(strut([0.5, -0.36, 3.9], [0.55, 1.78, 4.9], 0.2, 0.06)),
    ...pair(strut([1.2, -0.36, 3.9], [0.55, 1.78, 4.9], 0.12, 0.05)),
  );
  // the cabane, from the fuselage to the upper wing
  parts.push(
    ...pair(strut([2.3, 0.55, 0.42], [1.95, 1.7, 0.8], 0.16, 0.05)),
    ...pair(strut([1.0, 0.58, 0.44], [0.65, 1.7, 0.8], 0.16, 0.05)),
    ...pair(strut([2.3, 0.55, 0.42], [0.65, 1.7, 0.8], 0.1, 0.04)),
  );

  // undercarriage: two vees and the axle
  parts.push(
    ...pair(strut([2.45, -0.52, 0.42], [1.75, -1.92, 1.0], 0.2, 0.07)),
    ...pair(strut([0.9, -0.52, 0.42], [1.75, -1.92, 1.0], 0.2, 0.07)),
    strut([1.75, -1.95, -1.1], [1.75, -1.95, 1.1], 0.14, 0.14),
    wheel([1.75, -1.95, 1.15], 0.42, 0.17),
    wheel([1.75, -1.95, -1.15], 0.42, 0.17),
    strut([-4.15, 0.05, 0], [-4.55, -0.45, 0], 0.16, 0.06),
  );

  // tail
  const finBase: Rib = { at: [-3.45, 0.42, 0], chord: 1.25, thickness: 0.07, lean: 90 };
  const finTop: Rib = { at: [-3.9, 1.3, 0], chord: 1.15, thickness: 0.06, lean: 90 };
  parts.push(surface([finBase, finTop, ...tip(finTop, 0.34, 'y')]));
  const tailRoot: Rib = { at: [-3.2, 0.42, 0], chord: 1.55, thickness: 0.08 };
  const tailOuter: Rib = { at: [-3.5, 0.42, 1.8], chord: 1.1, thickness: 0.07 };
  parts.push(wing([tailRoot, tailOuter, ...tip(tailOuter, 0.3)]));

  return cast(parts);
}

export const POTEZ_25 = { span: 14.14, length: 9.1, lowest: -2.37 };
