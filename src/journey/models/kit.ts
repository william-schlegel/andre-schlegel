import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * The airframe kit: the few shapes a solid recognition model is carved from. Everything is
 * measured in metres of the real aircraft: x towards the nose, y up, z towards the right
 * wing tip. A model is a list of solids merged into one piece, like a casting.
 *
 * Solids are "lofts": rings of points joined by a skin and closed at both ends. Whether a
 * ring runs clockwise or not does not matter: a solid's faces are turned outwards once it is
 * closed, so that its normals point out of it (the light's shadows are reckoned from them).
 */

export type Ring = Vector3[];

/** A skin stretched over a row of rings (all with the same number of points), closed at both ends. */
export function loft(rings: Ring[], caps: 'both' | 'none' = 'both'): BufferGeometry {
  const around = rings[0].length;
  const positions: number[] = [];
  const index: number[] = [];
  for (const ring of rings) for (const point of ring) positions.push(point.x, point.y, point.z);
  for (let r = 0; r < rings.length - 1; r++) {
    for (let i = 0; i < around; i++) {
      const a = r * around + i;
      const b = r * around + ((i + 1) % around);
      const c = a + around;
      const d = b + around;
      index.push(a, c, b, b, c, d);
    }
  }
  if (caps === 'both') {
    for (const [ring, flip] of [
      [rings[0], false],
      [rings[rings.length - 1], true],
    ] as const) {
      const centre = new Vector3();
      for (const point of ring) centre.add(point);
      centre.divideScalar(around);
      const at = positions.length / 3;
      // the cap has its own rim, so that its flat face is not smoothed into the skin
      for (const point of ring) positions.push(point.x, point.y, point.z);
      positions.push(centre.x, centre.y, centre.z);
      for (let i = 0; i < around; i++) {
        const a = at + i;
        const b = at + ((i + 1) % around);
        if (flip) index.push(a, at + around, b);
        else index.push(a, b, at + around);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setIndex(caps === 'both' && volume(positions, index) < 0 ? insideOut(index) : index);
  geometry.computeVertexNormals();
  return geometry;
}

/** The volume a closed skin holds: negative when its faces are wound facing inwards. */
export function volume(positions: ArrayLike<number>, index: ArrayLike<number>): number {
  let six = 0;
  for (let i = 0; i < index.length; i += 3) {
    const [a, b, c] = [index[i] * 3, index[i + 1] * 3, index[i + 2] * 3];
    six +=
      positions[a] * (positions[b + 1] * positions[c + 2] - positions[b + 2] * positions[c + 1]) +
      positions[a + 1] * (positions[b + 2] * positions[c] - positions[b] * positions[c + 2]) +
      positions[a + 2] * (positions[b] * positions[c + 1] - positions[b + 1] * positions[c]);
  }
  return six / 6;
}

/** The same faces, each wound the other way. */
function insideOut(index: ArrayLike<number>): number[] {
  const turned: number[] = [];
  for (let i = 0; i < index.length; i += 3) turned.push(index[i], index[i + 2], index[i + 1]);
  return turned;
}

/**
 * A cross-section of a body, in the plane x = const: a "superellipse", round when `square`
 * is 2 and more and more slab-sided as it grows.
 */
export function section(x: number, y: number, halfWidth: number, halfHeight: number, square = 2.4, points = 20): Ring {
  const ring: Ring = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const power = 2 / square;
    ring.push(new Vector3(x, y + Math.sign(s) * Math.pow(Math.abs(s), power) * halfHeight, Math.sign(c) * Math.pow(Math.abs(c), power) * halfWidth));
  }
  return ring;
}

/** A body: a fuselage, a nacelle, a float. Stations from nose to tail: [x, y, half width, half height, squareness]. */
export function body(stations: [number, number, number, number, number?][], points = 20): BufferGeometry {
  return loft(stations.map(([x, y, w, h, square]) => section(x, y, w, h, square ?? 2.4, points)));
}

/** An upright body: a leg fairing, a mast. Stations from top to bottom: [y, x, z, half length (along x), half width (along z)]. */
export function pillar(stations: [number, number, number, number, number][], points = 16): BufferGeometry {
  return loft(
    stations.map(([y, x, z, halfLength, halfWidth]) =>
      Array.from({ length: points }, (_, i) => {
        const angle = (i / points) * Math.PI * 2;
        // blunt in front, drawn out behind
        const along = Math.cos(angle);
        return new Vector3(x + (along > 0 ? along * halfLength * 0.8 : along * halfLength * 1.2), y, z + Math.sin(angle) * halfWidth);
      }),
    ),
  );
}

/** The outline of a wing section: chord along x from the leading edge (0) back to the trailing edge (−1). */
const PROFILE: [number, number][] = (() => {
  // thickness of a classic four-digit section, upper side from leading to trailing edge
  const along = [0, 0.012, 0.05, 0.12, 0.22, 0.34, 0.48, 0.64, 0.8, 0.92, 1];
  const half = (t: number) => 5 * (0.2969 * Math.sqrt(t) - 0.126 * t - 0.3516 * t * t + 0.2843 * t ** 3 - 0.1036 * t ** 4);
  const upper = along.map((t) => [-t, half(t)] as [number, number]);
  const lower = along
    .slice(1, -1)
    .reverse()
    .map((t) => [-t, -half(t) * 0.7] as [number, number]);
  return [...upper, ...lower];
})();

export interface Rib {
  /** The leading edge: x, y, z. */
  at: [number, number, number];
  chord: number;
  /** Thickness as a share of the chord. */
  thickness: number;
  /** Degrees: the rib leans around the x axis (for a fin, 90). */
  lean?: number;
}

function ribRing(rib: Rib): Ring {
  const lean = ((rib.lean ?? 0) * Math.PI) / 180;
  return PROFILE.map(([along, up]) => {
    const height = up * rib.thickness * rib.chord;
    return new Vector3(rib.at[0] + along * rib.chord, rib.at[1] + height * Math.cos(lean), rib.at[2] + height * Math.sin(lean));
  });
}

/**
 * A flying surface (wing, tailplane, fin) through its ribs, in order. The last ribs are
 * usually smaller ones that round the tip off.
 */
export function surface(ribs: Rib[]): BufferGeometry {
  return loft(ribs.map(ribRing));
}

/** A wing given by its ribs on the right side, mirrored to the left: one piece from tip to tip. */
export function wing(right: Rib[]): BufferGeometry {
  const left = right
    .slice(right[0].at[2] === 0 ? 1 : 0)
    .map((rib) => ({ ...rib, at: [rib.at[0], rib.at[1], -rib.at[2]] as [number, number, number] }))
    .reverse();
  return surface([...left, ...right]);
}

/** Rounds a tip off: two smaller ribs beyond `rib`, going `reach` further along z (or y for a fin). */
export function tip(rib: Rib, reach: number, axis: 'z' | 'y' = 'z'): Rib[] {
  return [
    [0.55, 0.86, 0.07],
    [0.9, 0.6, 0.16],
    [1, 0.28, 0.3],
  ].map(([out, size, back]) => {
    const at: [number, number, number] = [rib.at[0] - back * rib.chord, rib.at[1], rib.at[2]];
    if (axis === 'z') at[2] += Math.sign(rib.at[2] || 1) * reach * out;
    else at[1] += reach * out;
    return { ...rib, at, chord: rib.chord * size, thickness: rib.thickness * (0.9 - 0.3 * out) };
  });
}

/** A strut or a rod between two points: a streamlined bar `width` wide (along x) and `thickness` thick. */
export function strut(from: [number, number, number], to: [number, number, number], width: number, thickness: number): BufferGeometry {
  const a = new Vector3(...from);
  const b = new Vector3(...to);
  const along = b.clone().sub(a).normalize();
  // the bar's wide side faces the airflow (x); its thin side is across both
  const fore = new Vector3(1, 0, 0);
  const across = new Vector3().crossVectors(along, fore);
  if (across.lengthSq() < 1e-6) across.set(0, 0, 1);
  across.normalize();
  const chord = new Vector3().crossVectors(across, along).normalize();
  const ring = (centre: Vector3): Ring =>
    Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2;
      return centre
        .clone()
        .addScaledVector(chord, (Math.cos(angle) * width) / 2)
        .addScaledVector(across, (Math.sin(angle) * thickness) / 2);
    });
  return loft([ring(a), ring(b)]);
}

/** A wheel standing in the plane z = const. */
export function wheel(at: [number, number, number], radius: number, width: number): BufferGeometry {
  const rings: Ring[] = [];
  // a tyre: rounded shoulders
  for (const [offset, size] of [
    [-0.5, 0.72],
    [-0.36, 0.94],
    [-0.15, 1],
    [0.15, 1],
    [0.36, 0.94],
    [0.5, 0.72],
  ]) {
    rings.push(
      Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        return new Vector3(at[0] + Math.cos(angle) * radius * size, at[1] + Math.sin(angle) * radius * size, at[2] + offset * width);
      }),
    );
  }
  return loft(rings);
}

/** A propeller at rest: a hub and its blades, facing forward. */
export function propeller(at: [number, number, number], radius: number, blades: number, turn = 0): BufferGeometry {
  const parts: BufferGeometry[] = [];
  parts.push(
    body(
      [
        [at[0] + radius * 0.2, at[1], 0.02, 0.02],
        [at[0] + radius * 0.12, at[1], radius * 0.085, radius * 0.085],
        [at[0], at[1], radius * 0.11, radius * 0.11],
        [at[0] - radius * 0.08, at[1], radius * 0.11, radius * 0.11],
      ],
      12,
    ).translate(0, 0, at[2]),
  );
  for (let blade = 0; blade < blades; blade++) {
    const angle = turn + (blade / blades) * Math.PI * 2;
    const rings: Ring[] = [];
    for (const [out, chord, twist] of [
      [0.08, 0.1, 1.0],
      [0.3, 0.17, 0.75],
      [0.6, 0.19, 0.5],
      [0.85, 0.15, 0.35],
      [0.97, 0.08, 0.3],
      [1, 0.02, 0.3],
    ]) {
      const r = out * radius;
      const half = (chord * radius) / 2;
      const thick = 0.012 * radius * (1.4 - out);
      rings.push(
        Array.from({ length: 8 }, (_, i) => {
          const around = (i / 8) * Math.PI * 2;
          // a flat ellipse, twisted: across the blade (tangent) and along the shaft (x)
          const u = Math.cos(around) * half;
          const v = Math.sin(around) * thick;
          const tangent = u * Math.cos(twist) - v * Math.sin(twist);
          const shaft = u * Math.sin(twist) + v * Math.cos(twist);
          return new Vector3(
            at[0] + shaft,
            at[1] + Math.cos(angle) * r - Math.sin(angle) * tangent,
            at[2] + Math.sin(angle) * r + Math.cos(angle) * tangent,
          );
        }),
      );
    }
    parts.push(loft(rings));
  }
  return cast(parts);
}

/** A dome: a turret, a cockpit hood. Half an ellipsoid sitting on y = at[1]. */
export function dome(at: [number, number, number], radiusX: number, radiusY: number, radiusZ: number): BufferGeometry {
  const rings: Ring[] = [];
  for (let level = 0; level <= 6; level++) {
    const up = (level / 6) * (Math.PI / 2);
    const size = Math.max(Math.cos(up), 0.02);
    rings.push(
      Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        return new Vector3(at[0] + Math.cos(angle) * radiusX * size, at[1] + Math.sin(up) * radiusY, at[2] + Math.sin(angle) * radiusZ * size);
      }),
    );
  }
  return loft(rings);
}

/** Mirrors a solid from the right side to the left. */
export function mirrored(geometry: BufferGeometry): BufferGeometry {
  const mirror = geometry.clone().scale(1, 1, -1);
  // a mirror turns a solid inside out: its faces are wound again to face outwards, and the normals follow
  mirror.setIndex(insideOut(mirror.getIndex()!.array));
  mirror.computeVertexNormals();
  return mirror;
}

/** Both sides: the solid and its mirror. */
export function pair(geometry: BufferGeometry): BufferGeometry[] {
  return [geometry, mirrored(geometry)];
}

/** Joins the solids into one piece. */
export function cast(parts: BufferGeometry[]): BufferGeometry {
  return mergeGeometries(parts);
}
