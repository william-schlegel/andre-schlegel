import type { BufferGeometry } from 'three';
import { body, cast, dome, pair, pillar, propeller, strut, surface, tip, wheel, wing, type Rib } from './kit';

/**
 * Bloch MB.200 (1933): a shoulder-wing twin with a slab-sided fuselage, a turret on the nose,
 * a thick tapered wing, two radial engines and a fixed undercarriage in trousers.
 * Span 22.45 m, length 16 m.
 */
export function bloch200(): BufferGeometry {
  const parts: BufferGeometry[] = [];

  // the fuselage: a box, hardly rounded
  parts.push(
    body([
      [8.0, -0.42, 0.22, 0.3, 2.6],
      [7.7, -0.3, 0.5, 0.68, 3],
      [6.9, -0.1, 0.68, 1.0, 4],
      [5.6, 0, 0.74, 1.15, 5],
      [2.0, 0, 0.74, 1.15, 5],
      [-1.5, 0.02, 0.72, 1.1, 5],
      [-4.5, 0.15, 0.55, 0.85, 4.5],
      [-6.8, 0.33, 0.32, 0.58, 4],
      [-8.0, 0.45, 0.08, 0.36, 3],
    ]),
  );

  // nose turret, pilots' hood, dorsal turret, ventral gun position
  parts.push(dome([7.05, 0.72, 0], 0.55, 0.62, 0.52));
  parts.push(
    body([
      [6.0, 1.1, 0.08, 0.05, 3],
      [5.55, 1.3, 0.5, 0.3, 3.2],
      [4.5, 1.42, 0.56, 0.4, 3.5],
      [3.5, 1.36, 0.5, 0.3, 3.2],
      [2.7, 1.2, 0.25, 0.08, 3],
    ]),
  );
  parts.push(dome([-2.1, 1.08, 0], 0.5, 0.42, 0.5));
  parts.push(
    body([
      [-1.3, -1.12, 0.05, 0.04, 2.6],
      [-1.9, -1.32, 0.36, 0.28, 2.8],
      [-2.9, -1.32, 0.36, 0.28, 2.8],
      [-3.7, -1.0, 0.05, 0.04, 2.6],
    ]),
  );

  // the wing: thick at the root, tapered on both edges, a little dihedral
  const root: Rib = { at: [4.0, 0.84, 0], chord: 4.6, thickness: 0.17 };
  const shoulder: Rib = { at: [4.0, 0.86, 0.9], chord: 4.6, thickness: 0.17 };
  const outer: Rib = { at: [2.72, 1.3, 10.6], chord: 1.9, thickness: 0.12 };
  parts.push(wing([root, shoulder, outer, ...tip(outer, 0.62)]));

  // engines: a ring cowl ahead of the leading edge, the nacelle fading under the wing
  const engineAt = 3.35;
  const nacelle = body(
    [
      [6.0, 0.55, 0.46, 0.46, 2],
      [5.92, 0.55, 0.7, 0.7, 2],
      [5.05, 0.55, 0.72, 0.72, 2],
      [4.95, 0.55, 0.56, 0.56, 2],
      [3.4, 0.6, 0.56, 0.62, 2.4],
      [1.5, 0.72, 0.42, 0.45, 2.4],
      [-0.3, 0.84, 0.12, 0.14, 2.2],
    ],
    18,
  ).translate(0, 0, engineAt);
  parts.push(...pair(nacelle));
  parts.push(propeller([6.12, 0.55, engineAt], 1.6, 3, 0.35), propeller([6.12, 0.55, -engineAt], 1.6, 3, -0.6));

  // undercarriage: each wheel half-hidden in its trouser
  const trouser = pillar([
    [0.2, 3.6, engineAt, 0.9, 0.36],
    [-1.0, 3.5, engineAt, 0.86, 0.33],
    [-1.9, 3.45, engineAt, 0.98, 0.37],
    [-2.5, 3.45, engineAt, 0.8, 0.3],
  ]);
  parts.push(...pair(trouser));
  parts.push(wheel([3.45, -2.34, engineAt], 0.62, 0.3), wheel([3.45, -2.34, -engineAt], 0.62, 0.3));
  parts.push(strut([-7.0, 0.0, 0], [-7.35, -0.62, 0], 0.22, 0.1), wheel([-7.4, -0.72, 0], 0.22, 0.14));

  // tail: one tall fin, the tailplane carried on it and braced from below
  const finBase: Rib = { at: [-5.45, 0.7, 0], chord: 2.9, thickness: 0.09, lean: 90 };
  const finTop: Rib = { at: [-6.25, 2.55, 0], chord: 2.0, thickness: 0.08, lean: 90 };
  parts.push(surface([finBase, finTop, ...tip(finTop, 0.36, 'y')]));
  const tailRoot: Rib = { at: [-5.85, 1.25, 0], chord: 2.4, thickness: 0.1 };
  const tailOuter: Rib = { at: [-6.45, 1.25, 3.4], chord: 1.5, thickness: 0.09 };
  parts.push(wing([tailRoot, tailOuter, ...tip(tailOuter, 0.4)]));
  parts.push(...pair(strut([-7.0, 1.2, 2.1], [-7.0, -0.05, 0.3], 0.3, 0.07)));

  return cast(parts);
}

/** From the wheels to the top of the fin, and the span: what the stand has to carry. */
export const BLOCH_200 = { span: 22.45, length: 16, lowest: -2.96 };
