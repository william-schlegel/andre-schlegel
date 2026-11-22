import type { BufferGeometry } from 'three';
import { body, cast, dome, pair, propeller, strut, surface, tip, wheel, wing, type Rib } from './kit';

/**
 * Avro Anson (1935): a small low-wing twin, the fuselage a slab-sided box of wood and fabric
 * under a long glasshouse, a gun turret on its back, two small helmeted radials, and wheels
 * that never quite disappear into their nacelles. Span 17.22 m, length 12.88 m.
 */
export function anson(): BufferGeometry {
  const parts: BufferGeometry[] = [];

  // the fuselage: blunt-nosed, flat-sided
  parts.push(
    body([
      [6.3, -0.28, 0.12, 0.15, 2.2],
      [6.0, -0.22, 0.42, 0.5, 2.4],
      [5.2, -0.06, 0.64, 0.84, 3],
      [4.1, 0.04, 0.72, 0.98, 3.6],
      [1.0, 0.05, 0.72, 0.98, 4],
      [-1.5, 0.08, 0.66, 0.9, 3.6],
      [-3.9, 0.2, 0.45, 0.62, 3],
      [-5.6, 0.34, 0.2, 0.36, 2.6],
      [-6.45, 0.4, 0.05, 0.2, 2.2],
    ]),
  );

  // the glasshouse over the pilot and the pupils, and the turret behind it
  parts.push(
    body([
      [5.05, 0.84, 0.1, 0.05, 3],
      [4.55, 1.1, 0.5, 0.28, 3.4],
      [3.2, 1.2, 0.58, 0.34, 3.6],
      [0.6, 1.18, 0.58, 0.32, 3.6],
      [-0.5, 1.06, 0.4, 0.15, 3.2],
      [-1.1, 0.96, 0.1, 0.04, 3],
    ]),
  );
  parts.push(dome([-2.0, 0.92, 0], 0.5, 0.56, 0.48));

  // the wing, low: broad at the root, tapering to rounded tips
  const root: Rib = { at: [3.35, -0.8, 0], chord: 3.5, thickness: 0.17 };
  const shoulder: Rib = { at: [3.35, -0.78, 0.72], chord: 3.5, thickness: 0.17 };
  const outer: Rib = { at: [2.3, -0.26, 8.2], chord: 1.5, thickness: 0.12 };
  parts.push(wing([root, shoulder, outer, ...tip(outer, 0.41)]));

  // two small radials in close cowlings, the nacelles running back over the wing
  const engineAt = 2.5;
  const nacelle = body(
    [
      [4.75, -0.52, 0.3, 0.3, 2],
      [4.67, -0.52, 0.56, 0.56, 2],
      [4.0, -0.52, 0.6, 0.6, 2],
      [3.9, -0.52, 0.46, 0.46, 2],
      [2.6, -0.56, 0.46, 0.56, 2.3],
      [0.8, -0.62, 0.36, 0.42, 2.3],
      [-0.4, -0.66, 0.08, 0.1, 2.1],
    ],
    18,
  ).translate(0, 0, engineAt);
  parts.push(...pair(nacelle));
  parts.push(propeller([4.87, -0.52, engineAt], 1.15, 2, 0.5), propeller([4.87, -0.52, -engineAt], 1.15, 2, -0.2));

  // the wheels, wound up by hand: half of each still shows
  parts.push(wheel([2.9, -1.2, engineAt], 0.5, 0.28), wheel([2.9, -1.2, -engineAt], 0.5, 0.28));
  parts.push(strut([-5.5, 0.05, 0], [-5.75, -0.3, 0], 0.18, 0.09), wheel([-5.8, -0.38, 0], 0.18, 0.12));

  // tail: one rounded fin, the tailplane low on the fuselage
  const finBase: Rib = { at: [-4.35, 0.62, 0], chord: 2.3, thickness: 0.09, lean: 90 };
  const finTop: Rib = { at: [-5.2, 2.2, 0], chord: 1.4, thickness: 0.08, lean: 90 };
  parts.push(surface([finBase, finTop, ...tip(finTop, 0.34, 'y')]));
  const tailRoot: Rib = { at: [-4.5, 0.42, 0], chord: 2.1, thickness: 0.09 };
  const tailOuter: Rib = { at: [-5.05, 0.42, 2.6], chord: 1.15, thickness: 0.08 };
  parts.push(wing([tailRoot, tailOuter, ...tip(tailOuter, 0.3)]));

  return cast(parts);
}

export const ANSON = { span: 17.22, length: 12.88, lowest: -1.7 };
