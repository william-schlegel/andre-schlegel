import type { BufferGeometry } from 'three';
import { body, cast, pair, propeller, strut, surface, tip, wheel, wing, type Rib } from './kit';

/**
 * Douglas DB-7 (1939): a slim, deep fuselage with a glazed nose, a shoulder wing, two long
 * nacelles reaching behind the trailing edge and, new for its day, a nose wheel: it stands
 * level on three legs. Span 18.67 m, length 14.32 m.
 */
export function db7(): BufferGeometry {
  const parts: BufferGeometry[] = [];

  // the fuselage: narrow and deep, tapering to a point at both ends
  parts.push(
    body([
      [7.15, -0.12, 0.1, 0.16, 2.2],
      [6.75, -0.08, 0.36, 0.5, 2.3],
      [5.8, -0.02, 0.56, 0.8, 2.5],
      [4.4, 0.05, 0.62, 0.98, 2.8],
      [2.0, 0.08, 0.62, 1.0, 3],
      [-0.6, 0.1, 0.6, 0.95, 3],
      [-3.0, 0.24, 0.47, 0.72, 2.8],
      [-5.4, 0.42, 0.3, 0.46, 2.5],
      [-7.15, 0.55, 0.06, 0.2, 2.2],
    ]),
  );

  // the pilot's long hood, and the gunner's behind the wing
  parts.push(
    body([
      [5.05, 0.98, 0.1, 0.05, 3],
      [4.55, 1.24, 0.4, 0.3, 3],
      [3.4, 1.36, 0.43, 0.34, 3],
      [2.3, 1.2, 0.36, 0.2, 3],
      [1.6, 1.05, 0.14, 0.05, 3],
    ]),
  );
  parts.push(
    body([
      [-0.9, 1.0, 0.1, 0.05, 3],
      [-1.5, 1.2, 0.38, 0.26, 3],
      [-2.5, 1.16, 0.36, 0.22, 3],
      [-3.2, 0.96, 0.1, 0.05, 3],
    ]),
  );

  // the wing, at the shoulder: straight leading edge, tapered, a little dihedral
  const root: Rib = { at: [2.95, 0.42, 0], chord: 3.7, thickness: 0.15 };
  const side: Rib = { at: [2.95, 0.44, 0.6], chord: 3.7, thickness: 0.15 };
  const outer: Rib = { at: [1.75, 1.05, 8.85], chord: 1.45, thickness: 0.11 };
  parts.push(wing([root, side, outer, ...tip(outer, 0.48)]));

  // engines slung under the wing; the nacelles run on well behind it
  const engineAt = 2.85;
  const nacelle = body(
    [
      [4.95, 0.12, 0.42, 0.42, 2],
      [4.88, 0.12, 0.66, 0.66, 2],
      [4.0, 0.12, 0.68, 0.68, 2],
      [3.9, 0.12, 0.56, 0.56, 2],
      [2.4, 0.08, 0.56, 0.66, 2.3],
      [0.4, 0.08, 0.5, 0.6, 2.3],
      [-1.4, 0.2, 0.3, 0.36, 2.2],
      [-2.5, 0.32, 0.05, 0.07, 2],
    ],
    18,
  ).translate(0, 0, engineAt);
  parts.push(...pair(nacelle));
  parts.push(propeller([5.08, 0.12, engineAt], 1.68, 3, 0.3), propeller([5.08, 0.12, -engineAt], 1.68, 3, -0.5));

  // the tricycle undercarriage: a leg under each nacelle, and one under the nose
  parts.push(...pair(strut([1.75, -0.4, engineAt], [1.75, -1.75, engineAt], 0.2, 0.16)));
  parts.push(wheel([1.75, -1.95, engineAt], 0.52, 0.3), wheel([1.75, -1.95, -engineAt], 0.52, 0.3));
  parts.push(strut([5.5, -0.7, 0], [5.6, -2.0, 0], 0.16, 0.13), wheel([5.62, -2.13, 0], 0.34, 0.2));

  // tail: a single fin, the tailplane set on the fuselage with a marked dihedral
  const finBase: Rib = { at: [-4.75, 0.8, 0], chord: 2.35, thickness: 0.09, lean: 90 };
  const finTop: Rib = { at: [-5.95, 3.0, 0], chord: 1.15, thickness: 0.07, lean: 90 };
  parts.push(surface([finBase, finTop, ...tip(finTop, 0.3, 'y')]));
  const tailRoot: Rib = { at: [-5.1, 0.78, 0], chord: 2.0, thickness: 0.09 };
  const tailOuter: Rib = { at: [-5.7, 1.28, 2.85], chord: 1.1, thickness: 0.07 };
  parts.push(wing([tailRoot, tailOuter, ...tip(tailOuter, 0.3)]));

  return cast(parts);
}

export const DB_7 = { span: 18.67, length: 14.32, lowest: -2.48 };
