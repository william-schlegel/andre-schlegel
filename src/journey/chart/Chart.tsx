import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackSide,
  DoubleSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  FrontSide,
  MathUtils,
  RingGeometry,
  SRGBColorSpace,
  type Mesh,
  type MeshBasicMaterial,
  type Texture,
} from 'three';
import type { Frame, Place } from '../content/types';
import { contactShadowTexture, paperTexture } from '../stage/surfaces';
import { whenFontsReady } from '../stage/textures';
import { drawSheet, onSheet, sheetSize, type Land } from './draw';
import { EVENTS, POSTS, SHEETS, type ChartEvent, type ChartSheet, type EventId, type Post, type PostId, type SheetId } from './places';

/**
 * How far the Chart is unrolled and how far its marks are inked, from 0 to 1. A Chapter
 * opening animates these; a Scene entered directly finds the Chart flat and inked.
 */
export const chartState = { unrolled: 1, inked: 1 };

const SEGMENTS = 72;
const ROLL = 0.021; // radius of the rolled part, in metres

const drawn = new Map<SheetId, Promise<Texture>>();

/** The sheet's drawing, made once (the coastlines are fetched apart from the rest of the site). */
function sheetTexture(id: SheetId): Promise<Texture> {
  let texture = drawn.get(id);
  if (!texture) {
    // a sheet that holds continents is drawn from the small-scale outlines
    const outlines = (SHEETS[id] as ChartSheet).world ? import('../content/generated/chart-monde.json') : import('../content/generated/chart-land.json');
    texture = Promise.all([outlines, whenFontsReady()]).then(([land]) => {
      const result = new CanvasTexture(drawSheet(id, land.default as Land[]));
      result.colorSpace = SRGBColorSpace;
      result.anisotropy = 16;
      return result;
    });
    drawn.set(id, texture);
  }
  return texture;
}

export function preloadSheet(id: SheetId): void {
  void sheetTexture(id);
}

/** The rectangle of the table around a post of the Chart, for the camera. */
export function chartSpot(sheet: SheetId, place: Place, post: PostId, width = 0.3): Frame {
  const local = onSheet(sheet, POSTS[post].at);
  const turn = MathUtils.degToRad(place.turn ?? 0);
  // the sheet is turned clockwise seen from above
  const x = place.x + local.x * Math.cos(turn) - local.z * Math.sin(turn);
  const z = place.z + local.x * Math.sin(turn) + local.z * Math.cos(turn);
  return { x, z, width, depth: width * 0.62 };
}

/** The rectangle of the table that holds a part of the Chart, given by its corners: [west, south] and [east, north]. */
export function chartBox(sheet: SheetId, place: Place, box: [[number, number], [number, number]]): Frame {
  const a = onSheet(sheet, box[0]);
  const b = onSheet(sheet, box[1]);
  const local = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
  const turn = MathUtils.degToRad(place.turn ?? 0);
  return {
    x: place.x + local.x * Math.cos(turn) - local.z * Math.sin(turn),
    z: place.z + local.x * Math.sin(turn) + local.z * Math.cos(turn),
    width: Math.abs(b.x - a.x),
    depth: Math.abs(a.z - b.z),
  };
}

export function chartFrame(sheet: SheetId, place: Place): Frame {
  const { width, depth } = sheetSize(sheet);
  return { x: place.x, z: place.z, width: width + 0.04, depth: depth + 0.04 };
}

interface ChartProps {
  sheet: SheetId;
  place: Place;
  /**
   * The posts inked on it, in the order the Narration reaches them. The first is the one a
   * Chapter opening inks; each of the others is reached by a Route drawn from the one before.
   */
  posts: PostId[];
  /** What happened there, inked as the Narration tells it: strikes, raids, landings. */
  events?: EventId[];
}

/**
 * A sheet of the Chart on the table. It unrolls from left to right; the rolled part rides on
 * the flat part until there is none left.
 */
export function Chart({ sheet, place, posts, events = [] }: ChartProps) {
  const { width, depth } = sheetSize(sheet);
  const [map, setMap] = useState<Texture | null>(null);
  const back = useMemo(() => paperTexture('card'), []);
  const shadow = useMemo(() => contactShadowTexture(), []);
  const shade = useRef<Mesh>(null);
  const last = useRef(-1);
  // posts that were there when the Chart was laid are already inked: only new ones are drawn
  const there = useRef(new Set<string>([...posts, ...events]));

  useEffect(() => {
    let alive = true;
    void sheetTexture(sheet).then((texture) => alive && setMap(texture));
    return () => {
      alive = false;
    };
  }, [sheet]);

  const geometry = useMemo(() => {
    const count = (SEGMENTS + 1) * 2;
    const result = new BufferGeometry();
    result.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
    const uv = new Float32Array(count * 2);
    const index: number[] = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      uv.set([i / SEGMENTS, 1, i / SEGMENTS, 0], i * 4);
      if (i < SEGMENTS) {
        const a = i * 2;
        index.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
      }
    }
    result.setAttribute('uv', new BufferAttribute(uv, 2));
    result.setIndex(index);
    return result;
  }, []);
  useEffect(() => {
    last.current = -1; // a new geometry has yet to be shaped
    return () => geometry.dispose();
  }, [geometry]);

  useFrame(() => {
    const unrolled = MathUtils.clamp(chartState.unrolled, 0, 1);
    if (unrolled === last.current) return;
    last.current = unrolled;
    const position = geometry.getAttribute('position') as BufferAttribute;
    const flat = unrolled * width;
    const rolled = width - flat;
    // the roll gets thinner as paper leaves it
    const radius = ROLL * (0.35 + 0.65 * Math.sqrt(rolled / width));
    for (let i = 0; i <= SEGMENTS; i++) {
      const along = (i / SEGMENTS) * width;
      let x = along;
      let y = 0.0012;
      if (along > flat) {
        const wound = along - flat;
        const angle = wound / radius;
        // each turn lies inside the one before
        const shrink = radius * Math.max(0.25, 1 - 0.045 * (angle / (Math.PI * 2)));
        x = flat + Math.sin(angle) * shrink;
        y = 0.0012 + radius - Math.cos(angle) * shrink;
      }
      position.setXYZ(i * 2, x - width / 2, y, -depth / 2);
      position.setXYZ(i * 2 + 1, x - width / 2, y, depth / 2);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    if (shade.current) {
      const covered = Math.max(flat + radius, 0.05);
      shade.current.scale.set(covered * 1.12, depth * 1.14, 1);
      shade.current.position.x = -width / 2 + covered / 2;
    }
  });

  return (
    <group position={[place.x, 0, place.z]} rotation-y={-MathUtils.degToRad(place.turn ?? 0)}>
      <mesh ref={shade} rotation-x={-Math.PI / 2} position-y={0.0005}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadow} transparent opacity={0.55} depthWrite={false} color="#000" />
      </mesh>
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial map={map ?? back} roughness={0.93} side={FrontSide} />
      </mesh>
      <mesh geometry={geometry}>
        <meshStandardMaterial map={back} roughness={0.95} side={BackSide} />
      </mesh>
      {posts.map((post, index) => (
        <PostMark key={post} sheet={sheet} post={post} from={index > 0 ? posts[index - 1] : null} lead={index === 0} fresh={!there.current.has(post)} />
      ))}
      {events.map((event) => (
        <EventMark key={event} sheet={sheet} event={EVENTS[event]} fresh={!there.current.has(event)} />
      ))}
    </group>
  );
}

const DASH = 0.0075; // a dash of the Route and the gap after it, in metres
const CLEAR = 0.019; // the Route stops short of a post's ring

/** The dashes of a Route between two points of the sheet, as one geometry drawn dash by dash. */
function routeGeometry(from: { x: number; z: number }, to: { x: number; z: number }): { geometry: BufferGeometry; dashes: number } {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const length = Math.hypot(dx, dz);
  const ux = dx / length;
  const uz = dz / length;
  const half = 0.0009;
  const dashes = Math.max(0, Math.floor((length - CLEAR * 2) / DASH));
  const positions: number[] = [];
  const index: number[] = [];
  for (let i = 0; i < dashes; i++) {
    const start = CLEAR + i * DASH;
    const end = start + DASH * 0.58;
    const base = positions.length / 3;
    for (const [along, side] of [
      [start, -half],
      [start, half],
      [end, -half],
      [end, half],
    ]) {
      positions.push(from.x + ux * along - uz * side, 0, from.z + uz * along + ux * side);
    }
    index.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setIndex(index);
  return { geometry, dashes };
}

/** A post's name is lettered at this scale: a canvas 512 pixels wide covers 96 mm of the sheet. */
const LABEL_SCALE = 0.096 / 512;

interface Inked {
  name?: string;
  note: string;
  /** Lettered to the left of its mark: the words end against it. */
  left?: boolean;
}

/** The width of a mark's lettering, in pixels: the longer of its name and its note. */
function labelPixels({ name = '', note }: Inked): number {
  return Math.max(512, Math.ceil(Math.max(name.length * 62, note.length * 27) + 24));
}

/** A name in red capitals and a typed note under it; the note alone when the place is already named on the sheet. */
function inkedLabel({ name, note, left }: Inked): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = labelPixels({ name, note });
  canvas.height = 160;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  const draw = () => {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#a8281e';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = left ? 'right' : 'left';
    if (name) {
      ctx.font = '700 84px "Old Standard TT", serif';
      ctx.fillText(name, left ? canvas.width - 6 : 6, 84);
    }
    ctx.font = '400 44px "Special Elite", monospace';
    ctx.fillText(note, left ? canvas.width - 8 : 8, name ? 140 : 96);
    texture.needsUpdate = true;
  };
  draw();
  void whenFontsReady().then(draw);
  return texture;
}

interface PostMarkProps {
  sheet: SheetId;
  post: PostId;
  /** The post André comes from: a Route is drawn from it. */
  from: PostId | null;
  /** The Chapter's first post is inked by the Chapter opening. */
  lead: boolean;
  /** Reached while the Chart lay there: it is drawn, rather than found already inked. */
  fresh: boolean;
}

/** A post inked in red: the Route that leads to it, a ring drawn around the place, then its name. */
function PostMark({ sheet, post, from, lead, fresh }: PostMarkProps) {
  const local = onSheet(sheet, POSTS[post].at);
  const route = useMemo(() => {
    if (!from) return null;
    const origin = onSheet(sheet, POSTS[from].at);
    return routeGeometry({ x: origin.x - local.x, z: origin.z - local.z }, { x: 0, z: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet, post, from]);
  const way = useRef<Mesh>(null);
  // 0 → 1: the Route is drawn; 1 → 2: the post is inked
  const pen = useRef(fresh ? 0 : 2);
  useEffect(() => () => route?.geometry.dispose(), [route]);
  const label = useMemo(() => inkedLabel(POSTS[post]), [post]);
  const ring = useRef<Mesh>(null);
  const dot = useRef<Mesh>(null);
  const name = useRef<MeshBasicMaterial>(null);
  const last = useRef(-1);
  useEffect(() => {
    last.current = -1;
    return () => label.dispose();
  }, [label]);

  useFrame((_, delta) => {
    const flat = chartState.unrolled >= 0.999 ? 1 : 0;
    if (!lead) pen.current = Math.min(2, pen.current + Math.min(delta, 0.1) / (pen.current < 1 && route ? 1.5 : 1.1));
    if (way.current && route) {
      const drawnDashes = Math.round(route.dashes * MathUtils.clamp(pen.current, 0, 1) * flat);
      way.current.visible = drawnDashes > 0;
      route.geometry.setDrawRange(0, drawnDashes * 6);
    }
    const inked = (lead ? MathUtils.clamp(chartState.inked, 0, 1) : MathUtils.clamp(pen.current - 1, 0, 1)) * flat;
    if (inked === last.current) return;
    last.current = inked;
    const around = MathUtils.clamp(inked / 0.6, 0, 1);
    if (ring.current) {
      ring.current.visible = around > 0.001;
      ring.current.geometry.dispose();
      ring.current.geometry = new RingGeometry(0.0125, 0.0147, 56, 1, Math.PI / 2, Math.PI * 2 * around);
    }
    if (dot.current) {
      dot.current.visible = inked > 0.02;
      dot.current.scale.setScalar(MathUtils.clamp(inked / 0.15, 0, 1));
    }
    if (name.current) name.current.opacity = MathUtils.clamp((inked - 0.55) / 0.45, 0, 1) * 0.92;
  });

  return (
    <group position={[local.x, 0.0022, local.z]}>
      {route && (
        <mesh ref={way} geometry={route.geometry} visible={false}>
          <meshBasicMaterial color="#a8281e" transparent opacity={0.8} side={DoubleSide} />
        </mesh>
      )}
      <mesh ref={dot} rotation-x={-Math.PI / 2} visible={false}>
        <circleGeometry args={[0.0042, 24]} />
        <meshBasicMaterial color="#a8281e" transparent opacity={0.9} />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} visible={false}>
        <ringGeometry args={[0.0125, 0.0147, 56]} />
        <meshBasicMaterial color="#a8281e" transparent opacity={0.88} side={DoubleSide} />
      </mesh>
      <mesh
        rotation-x={-Math.PI / 2}
        position={[((POSTS[post] as Post).left ? -1 : 1) * (0.021 + (labelPixels(POSTS[post]) * LABEL_SCALE) / 2), 0.0002, (POSTS[post] as Post).label ?? 0.006]}
      >
        <planeGeometry args={[labelPixels(POSTS[post]) * LABEL_SCALE, 0.03]} />
        <meshBasicMaterial ref={name} map={label} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

type Point = { x: number; z: number };

const SHAFT = 28; // spans of an arrow's shaft
const STAGGER = 0.5; // an arrow is begun when the one before is half drawn

/** An arrow from one point of the sheet to another, bent like a stroke of the pen: a shaft drawn span by span, then its head. */
function arrowGeometry(from: Point, to: Point, bow: number, leave: number): BufferGeometry {
  const length = Math.hypot(to.x - from.x, to.z - from.z);
  // the control point stands to the left of the course
  const middle = { x: (from.x + to.x) / 2 + ((to.z - from.z) / length) * bow * length, z: (from.z + to.z) / 2 - ((to.x - from.x) / length) * bow * length };
  const at = (t: number): Point => ({
    x: (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * middle.x + t * t * to.x,
    z: (1 - t) * (1 - t) * from.z + 2 * (1 - t) * t * middle.z + t * t * to.z,
  });
  const head = 0.0085;
  const first = Math.min(0.5, leave / length);
  const last = 1 - Math.min(0.5, (head + 0.004) / length);
  const half = 0.001;
  const positions: number[] = [];
  const index: number[] = [];
  let tangent: Point = { x: 1, z: 0 };
  for (let i = 0; i <= SHAFT; i++) {
    const t = first + ((last - first) * i) / SHAFT;
    const here = at(t);
    const ahead = at(Math.min(1, t + 0.01));
    const size = Math.hypot(ahead.x - here.x, ahead.z - here.z) || 1;
    tangent = { x: (ahead.x - here.x) / size, z: (ahead.z - here.z) / size };
    positions.push(here.x - tangent.z * half, 0, here.z + tangent.x * half, here.x + tangent.z * half, 0, here.z - tangent.x * half);
    if (i < SHAFT) {
      const a = i * 2;
      index.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
    }
  }
  const end = at(last);
  const base = positions.length / 3;
  positions.push(
    end.x - tangent.z * 0.0036,
    0,
    end.z + tangent.x * 0.0036,
    end.x + tangent.z * 0.0036,
    0,
    end.z - tangent.x * 0.0036,
    end.x + tangent.x * head,
    0,
    end.z + tangent.z * head,
  );
  index.push(base, base + 1, base + 2);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setIndex(index);
  return geometry;
}

const SWEEP = 96; // spans of a reach's arc
const SWEEP_TIME = 2; // the arc takes about twice as long to draw as an arrow

/** The arc of a circle around a base, `km` away from it, as a compass would sweep it on the sheet. */
function reachGeometry(sheet: SheetId, from: [number, number], km: number, bearings: [number, number]): BufferGeometry {
  const radians = Math.PI / 180;
  const away = km / 6371;
  const latitude = from[1] * radians;
  const at = (bearing: number): Point => {
    const course = bearing * radians;
    const reached = Math.asin(Math.sin(latitude) * Math.cos(away) + Math.cos(latitude) * Math.sin(away) * Math.cos(course));
    const east = Math.atan2(Math.sin(course) * Math.sin(away) * Math.cos(latitude), Math.cos(away) - Math.sin(latitude) * Math.sin(reached));
    return onSheet(sheet, [from[0] + east / radians, reached / radians]);
  };
  const half = 0.0011;
  const positions: number[] = [];
  const index: number[] = [];
  for (let i = 0; i <= SWEEP; i++) {
    const bearing = bearings[0] + ((bearings[1] - bearings[0]) * i) / SWEEP;
    const here = at(bearing);
    const ahead = at(bearing + 0.2);
    const size = Math.hypot(ahead.x - here.x, ahead.z - here.z) || 1;
    const tangent = { x: (ahead.x - here.x) / size, z: (ahead.z - here.z) / size };
    positions.push(here.x - tangent.z * half, 0, here.z + tangent.x * half, here.x + tangent.z * half, 0, here.z - tangent.x * half);
    if (i < SWEEP) {
      const a = i * 2;
      index.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setIndex(index);
  return geometry;
}

/** What happened at a place, in red ink: its arrows one after the other, the arc of a reach, a cross on the place struck, then the words. */
function EventMark({ sheet, event, fresh }: { sheet: SheetId; event: ChartEvent; fresh: boolean }) {
  const arrows = useMemo(
    () => (event.arrows ?? []).map((arrow) => arrowGeometry(onSheet(sheet, arrow.from), onSheet(sheet, arrow.to), arrow.bow ?? 0, arrow.leave ?? 0)),
    [sheet, event],
  );
  useEffect(() => () => arrows.forEach((arrow) => arrow.dispose()), [arrows]);
  const reach = useMemo(() => (event.reach ? reachGeometry(sheet, event.reach.from, event.reach.km, event.reach.bearings) : null), [sheet, event]);
  useEffect(() => () => reach?.dispose(), [reach]);
  const label = useMemo(() => inkedLabel(event), [event]);
  useEffect(() => () => label.dispose(), [label]);
  const strikes = useMemo(() => [...(event.strike ? [event.strike] : []), ...(event.strikes ?? [])].map((place) => onSheet(sheet, place)), [sheet, event]);
  const lettering = onSheet(sheet, event.label);
  const width = labelPixels(event) * LABEL_SCALE;

  // the pen: each arrow is begun before the one before is finished; then the arc, then the cross, then the words
  const arrowsDone = arrows.length ? (arrows.length - 1) * STAGGER + 1 : 0;
  const shaftsDone = arrowsDone + (reach ? SWEEP_TIME : 0);
  // each cross takes 0.6 of a step, and is begun when the one before is half inked
  const struckAt = shaftsDone + (strikes.length ? 0.6 + (strikes.length - 1) * 0.3 : 0);
  const steps = struckAt + 0.8;
  const pen = useRef(fresh ? 0 : steps);
  const shafts = useRef<(Mesh | null)[]>([]);
  const crosses = useRef<(Mesh | null)[]>([]);
  const sweep = useRef<Mesh>(null);
  const words = useRef<MeshBasicMaterial>(null);

  useFrame((_, delta) => {
    const flat = chartState.unrolled >= 0.999;
    if (flat) pen.current = Math.min(steps, pen.current + Math.min(delta, 0.1) / 0.9);
    if (sweep.current && reach) {
      const swept = flat ? MathUtils.clamp((pen.current - arrowsDone) / SWEEP_TIME, 0, 1) : 0;
      // the compass starts slowly and lifts slowly
      const spans = Math.round(SWEEP * swept * swept * (3 - 2 * swept));
      sweep.current.visible = spans > 0;
      reach.setDrawRange(0, spans * 6);
    }
    arrows.forEach((arrow, index) => {
      const mesh = shafts.current[index];
      if (!mesh) return;
      const drawn = flat ? MathUtils.clamp(pen.current - index * STAGGER, 0, 1) : 0;
      const spans = Math.round(SHAFT * Math.min(1, drawn / 0.85));
      mesh.visible = spans > 0;
      // the head is inked when the shaft is whole
      arrow.setDrawRange(0, spans * 6 + (drawn >= 0.99 ? 3 : 0));
    });
    crosses.current.forEach((cross, index) => {
      if (!cross) return;
      const struck = flat ? MathUtils.clamp((pen.current - shaftsDone - index * 0.3) / 0.6, 0, 1) : 0;
      cross.visible = struck > 0.01;
      cross.scale.setScalar((0.4 + 0.6 * struck) * (event.small ? 0.52 : 1));
      (cross.material as MeshBasicMaterial).opacity = 0.9 * struck;
    });
    if (words.current) words.current.opacity = (flat ? MathUtils.clamp((pen.current - struckAt) / 0.8, 0, 1) : 0) * 0.92;
  });

  return (
    <group position-y={0.0022}>
      {arrows.map((arrow, index) => (
        <mesh key={index} ref={(mesh) => void (shafts.current[index] = mesh)} geometry={arrow} visible={false}>
          <meshBasicMaterial color="#a8281e" transparent opacity={0.85} side={DoubleSide} />
        </mesh>
      ))}
      {reach && (
        <mesh ref={sweep} geometry={reach} visible={false}>
          <meshBasicMaterial color="#a8281e" transparent opacity={0.85} side={DoubleSide} />
        </mesh>
      )}
      {strikes.map((strike, index) => (
        <mesh key={index} ref={(mesh) => void (crosses.current[index] = mesh)} geometry={CROSS} position={[strike.x, 0.0001, strike.z]} visible={false}>
          <meshBasicMaterial color="#a8281e" transparent opacity={0} side={DoubleSide} />
        </mesh>
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[lettering.x + width / 2, 0.0002, lettering.z]}>
        <planeGeometry args={[width, 0.03]} />
        <meshBasicMaterial ref={words} map={label} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** A cross of two strokes, as one marks a place on a chart. */
const CROSS = (() => {
  const reach = 0.0062;
  const half = 0.0011;
  const positions: number[] = [];
  const index: number[] = [];
  for (const [dx, dz] of [
    [1, 1],
    [1, -1],
  ]) {
    const ux = dx / Math.SQRT2;
    const uz = dz / Math.SQRT2;
    const base = positions.length / 3;
    positions.push(
      -ux * reach - uz * half, 0, -uz * reach + ux * half,
      -ux * reach + uz * half, 0, -uz * reach - ux * half,
      ux * reach - uz * half, 0, uz * reach + ux * half,
      ux * reach + uz * half, 0, uz * reach - ux * half,
    );
    index.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setIndex(index);
  return geometry;
})();
