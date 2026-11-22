import type { BufferGeometry } from 'three';
import { body, cast, dome, pair, propeller, surface, tip, wheel, wing, type Rib } from './kit';

/**
 * Handley Page Halifax, as the Mark III the French squadrons flew from Elvington: a deep
 * slab-sided fuselage with a clear nose, a turret on its back and another in the tail, four
 * radials on a mid-set wing, and two large rectangular fins at the ends of the tailplane.
 * Span 31.75 m, length 21.82 m.
 */
export function halifax(): BufferGeometry {
  const parts: BufferGeometry[] = [];

  // the fuselage: tall and narrow, flat-sided over the bomb bay
  parts.push(
    body([
      [10.9, -0.35, 0.15, 0.2, 2.2],
      [10.5, -0.3, 0.5, 0.62, 2.4],
      [9.6, -0.15, 0.78, 1.05, 2.8],
      [8.2, 0.0, 0.85, 1.4, 3.4],
      [5.0, 0.0, 0.85, 1.45, 4],
      [-2.0, 0.0, 0.85, 1.45, 4],
      [-6.0, 0.12, 0.72, 1.2, 3.6],
      [-9.3, 0.3, 0.55, 0.85, 3],
      [-10.4, 0.36, 0.48, 0.66, 2.4],
      [-10.8, 0.36, 0.36, 0.5, 2.1],
      [-10.92, 0.36, 0.14, 0.2, 2],
    ]),
  );

  // the pilot's hood, the navigator's astrodome and the four-gun turret behind the wing
  parts.push(
    body([
      [8.6, 1.2, 0.1, 0.05, 3],
      [8.1, 1.62, 0.5, 0.32, 3.2],
      [6.9, 1.78, 0.56, 0.4, 3.4],
      [5.7, 1.7, 0.5, 0.28, 3.2],
      [4.9, 1.5, 0.2, 0.06, 3],
    ]),
  );
  parts.push(dome([3.6, 1.42, 0], 0.3, 0.28, 0.3));
  parts.push(dome([-2.7, 1.4, 0], 0.62, 0.52, 0.62));

  // the wing, at mid-height: a broad centre section carrying the engines, tapered outer panels
  const root: Rib = { at: [6.2, -0.2, 0], chord: 5.0, thickness: 0.19 };
  const shoulder: Rib = { at: [6.2, -0.18, 0.85], chord: 5.0, thickness: 0.19 };
  const knee: Rib = { at: [6.0, 0.15, 5.6], chord: 4.3, thickness: 0.17 };
  const outer: Rib = { at: [4.9, 0.95, 15.2], chord: 1.9, thickness: 0.12 };
  parts.push(wing([root, shoulder, knee, outer, ...tip(outer, 0.675)]));

  // four radials: the inner nacelles are long and deep (they hold the wheels), the outer ones short
  const inner = 3.7;
  const outerAt = 7.5;
  parts.push(
    ...pair(
      body(
        [
          [8.75, -0.2, 0.42, 0.42, 2],
          [8.65, -0.2, 0.72, 0.72, 2],
          [7.65, -0.2, 0.75, 0.75, 2],
          [7.55, -0.2, 0.6, 0.6, 2],
          [5.6, -0.3, 0.62, 0.82, 2.3],
          [3.0, -0.36, 0.55, 0.72, 2.3],
          [1.2, -0.2, 0.3, 0.36, 2.2],
          [0.4, -0.08, 0.05, 0.06, 2],
        ],
        18,
      ).translate(0, 0, inner),
    ),
  );
  parts.push(
    ...pair(
      body(
        [
          [8.45, 0.1, 0.42, 0.42, 2],
          [8.35, 0.1, 0.72, 0.72, 2],
          [7.35, 0.1, 0.75, 0.75, 2],
          [7.25, 0.1, 0.6, 0.6, 2],
          [5.6, 0.12, 0.55, 0.62, 2.2],
          [3.9, 0.22, 0.3, 0.32, 2.1],
          [3.0, 0.3, 0.05, 0.06, 2],
        ],
        18,
      ).translate(0, 0, outerAt),
    ),
  );
  parts.push(
    propeller([8.9, -0.2, inner], 1.98, 3, 0.2),
    propeller([8.9, -0.2, -inner], 1.98, 3, -0.55),
    propeller([8.6, 0.1, outerAt], 1.98, 3, 0.75),
    propeller([8.6, 0.1, -outerAt], 1.98, 3, -0.1),
  );

  // the wheels, drawn up into the inner nacelles: a part of each still shows
  parts.push(wheel([5.0, -0.98, inner], 0.75, 0.45), wheel([5.0, -0.98, -inner], 0.75, 0.45));
  parts.push(wheel([-9.0, -0.62, 0], 0.3, 0.2));

  // tail: a straight tailplane, a rectangular fin at each end standing above and below it
  const tailRoot: Rib = { at: [-8.2, 0.78, 0], chord: 2.9, thickness: 0.1 };
  const tailOuter: Rib = { at: [-8.4, 0.78, 4.5], chord: 2.4, thickness: 0.09 };
  parts.push(wing([tailRoot, tailOuter]));
  const finLow: Rib = { at: [-8.15, -0.5, 4.55], chord: 2.5, thickness: 0.08, lean: 90 };
  const finHigh: Rib = { at: [-8.05, 2.6, 4.55], chord: 2.7, thickness: 0.08, lean: 90 };
  parts.push(...pair(surface([...tip(finLow, -0.3, 'y').reverse(), finLow, finHigh, ...tip(finHigh, 0.3, 'y')])));

  return cast(parts);
}

export const HALIFAX = { span: 31.75, length: 21.82, lowest: -1.75 };
