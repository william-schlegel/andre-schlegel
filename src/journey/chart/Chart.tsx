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
import { POSTS, type PostId, type SheetId } from './places';

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
    texture = Promise.all([import('../content/generated/chart-land.json'), whenFontsReady()]).then(([land]) => {
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

export function chartFrame(sheet: SheetId, place: Place): Frame {
  const { width, depth } = sheetSize(sheet);
  return { x: place.x, z: place.z, width: width + 0.04, depth: depth + 0.04 };
}

interface ChartProps {
  sheet: SheetId;
  place: Place;
  /** The posts inked on it, in the order the Narration reaches them. */
  posts: PostId[];
}

/**
 * A sheet of the Chart on the table. It unrolls from left to right; the rolled part rides on
 * the flat part until there is none left.
 */
export function Chart({ sheet, place, posts }: ChartProps) {
  const { width, depth } = sheetSize(sheet);
  const [map, setMap] = useState<Texture | null>(null);
  const back = useMemo(() => paperTexture('card'), []);
  const shadow = useMemo(() => contactShadowTexture(), []);
  const shade = useRef<Mesh>(null);
  const last = useRef(-1);

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
        <PostMark key={post} sheet={sheet} post={post} order={index} count={posts.length} />
      ))}
    </group>
  );
}

function postLabel(post: PostId): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  const draw = () => {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#a8281e';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '700 84px "Old Standard TT", serif';
    ctx.fillText(POSTS[post].name, 6, 84);
    ctx.font = '400 44px "Special Elite", monospace';
    ctx.fillText(POSTS[post].note, 8, 140);
    texture.needsUpdate = true;
  };
  draw();
  void whenFontsReady().then(draw);
  return texture;
}

/** A post inked in red: a ring drawn around the place, then its name. */
function PostMark({ sheet, post, order, count }: { sheet: SheetId; post: PostId; order: number; count: number }) {
  const local = onSheet(sheet, POSTS[post].at);
  const label = useMemo(() => postLabel(post), [post]);
  const ring = useRef<Mesh>(null);
  const dot = useRef<Mesh>(null);
  const name = useRef<MeshBasicMaterial>(null);
  const last = useRef(-1);
  useEffect(() => {
    last.current = -1;
    return () => label.dispose();
  }, [label]);

  useFrame(() => {
    // each post takes its share of the inking, in order
    const flat = chartState.unrolled >= 0.999 ? 1 : 0;
    const inked = MathUtils.clamp(chartState.inked * count - order, 0, 1) * flat;
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
      <mesh ref={dot} rotation-x={-Math.PI / 2} visible={false}>
        <circleGeometry args={[0.0042, 24]} />
        <meshBasicMaterial color="#a8281e" transparent opacity={0.9} />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} visible={false}>
        <ringGeometry args={[0.0125, 0.0147, 56]} />
        <meshBasicMaterial color="#a8281e" transparent opacity={0.88} side={DoubleSide} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0.021 + 0.048, 0.0002, 0.006]}>
        <planeGeometry args={[0.096, 0.03]} />
        <meshBasicMaterial ref={name} map={label} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
