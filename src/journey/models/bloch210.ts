import type { BufferGeometry } from 'three';
import { body, cast, dome, pair, propeller, strut, surface, tip, wheel, wing, type Rib } from './kit';

/**
 * Bloch MB.210 (1934): the Bloch 200 brought up to date. The same slab-sided fuselage, but
 * the wing is set low, the engines sit on it and the wheels fold back into their nacelles,
 * half showing. Span 22.81 m, length 18.83 m.
 */
export function bloch210(): BufferGeometry {
  const parts: BufferGeometry[] = [];

  // the fuselage: a long box
  parts.push(
    body([
      [9.4, -0.35, 0.2, 0.28, 2.6],
      [9.05, -0.2, 0.5, 0.66, 3],
      [8.2, -0.02, 0.7, 1.0, 4],
      [6.8, 0.05, 0.76, 1.15, 5],
      [2.5, 0.05, 0.76, 1.15, 5],
      [-1.5, 0.08, 0.72, 1.08, 5],
      [-5.0, 0.2, 0.55, 0.82, 4.5],
      [-8.0, 0.42, 0.3, 0.52, 4],
      [-9.4, 0.55, 0.08, 0.32, 3],
    ]),
  );

  // nose turret, pilots' hood, dorsal turret, ventral gun position
  parts.push(dome([8.35, 0.8, 0], 0.55, 0.6, 0.52));
  parts.push(
    body([
      [7.2, 1.15, 0.08, 0.05, 3],
      [6.7, 1.36, 0.5, 0.3, 3.2],
      [5.5, 1.48, 0.56, 0.4, 3.5],
      [4.4, 1.42, 0.5, 0.3, 3.2],
      [3.5, 1.25, 0.25, 0.08, 3],
    ]),
  );
  parts.push(dome([-2.6, 1.15, 0], 0.5, 0.4, 0.5));
  parts.push(
    body([
      [-1.9, -1.05, 0.05, 0.04, 2.6],
      [-2.5, -1.26, 0.36, 0.28, 2.8],
      [-3.5, -1.26, 0.36, 0.28, 2.8],
      [-4.3, -0.95, 0.05, 0.04, 2.6],
    ]),
  );

  // the wing, low on the fuselage: thick at the root, a marked dihedral
  const root: Rib = { at: [5.3, -0.8, 0], chord: 5.0, thickness: 0.17 };
  const shoulder: Rib = { at: [5.3, -0.78, 0.9], chord: 5.0, thickness: 0.17 };
  const outer: Rib = { at: [3.75, -0.02, 10.75], chord: 1.9, thickness: 0.12 };
  parts.push(wing([root, shoulder, outer, ...tip(outer, 0.65)]));

  // engines: closely cowled radials ahead of the leading edge, the nacelle running back over the wing
  const engineAt = 3.4;
  const nacelle = body(
    [
      [7.3, -0.32, 0.48, 0.48, 2],
      [7.22, -0.32, 0.72, 0.72, 2],
      [6.3, -0.32, 0.74, 0.74, 2],
      [6.2, -0.32, 0.58, 0.58, 2],
      [4.6, -0.42, 0.58, 0.68, 2.4],
      [2.5, -0.52, 0.45, 0.52, 2.4],
      [0.5, -0.62, 0.12, 0.14, 2.2],
    ],
    18,
  ).translate(0, 0, engineAt);
  parts.push(...pair(nacelle));
  parts.push(propeller([7.42, -0.32, engineAt], 1.65, 3, 0.2), propeller([7.42, -0.32, -engineAt], 1.65, 3, -0.75));

  // the wheels, folded back: half of each still shows under its nacelle
  parts.push(wheel([4.4, -1.12, engineAt], 0.6, 0.3), wheel([4.4, -1.12, -engineAt], 0.6, 0.3));
  parts.push(strut([-8.3, 0.1, 0], [-8.6, -0.42, 0], 0.22, 0.1), wheel([-8.65, -0.52, 0], 0.22, 0.14));

  // tail: one tall fin, the tailplane carried on it and braced from below
  const finBase: Rib = { at: [-6.6, 0.75, 0], chord: 3.1, thickness: 0.09, lean: 90 };
  const finTop: Rib = { at: [-7.5, 2.9, 0], chord: 2.1, thickness: 0.08, lean: 90 };
  parts.push(surface([finBase, finTop, ...tip(finTop, 0.36, 'y')]));
  const tailRoot: Rib = { at: [-7.0, 1.25, 0], chord: 2.5, thickness: 0.1 };
  const tailOuter: Rib = { at: [-7.6, 1.25, 3.6], chord: 1.5, thickness: 0.09 };
  parts.push(wing([tailRoot, tailOuter, ...tip(tailOuter, 0.4)]));
  parts.push(...pair(strut([-8.2, 1.2, 2.2], [-8.2, 0.1, 0.3], 0.3, 0.07)));

  return cast(parts);
}

export const BLOCH_210 = { span: 22.81, length: 18.83, lowest: -1.76 };
