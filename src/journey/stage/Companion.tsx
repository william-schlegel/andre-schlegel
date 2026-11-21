import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  FrontSide,
  MathUtils,
  SRGBColorSpace,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
  type Texture,
} from 'three';
import { carnetOf, isSinglePage, lastView, scanUrl } from '../content/carnets';
import type { CarnetId, Frame, Place } from '../content/types';
import { contactShadowTexture, pageEdgeTexture, paperTexture } from './surfaces';
import { textureNow, whenFontsReady } from './textures';

/**
 * The Companion: a Carnet de vol as a book on the table. It lies closed or open at a view
 * (see content/carnets.ts); asked for another view, it turns its leaves one after the other
 * (several at a time when the way is long), each leaf bending as paper does.
 */

/** The carnets are 105 × 165 mm; on the table they are drawn twice that size, to be read. */
export const PAGE = { width: 0.21, height: 0.33 };
const BOARD = 0.0025; // thickness of a cover
const BLOCK = 0.012; // thickness of all the leaves together
const SEGMENTS = 22; // a turning leaf bends along this many strips
const LEAF_TURN = 0.85; // seconds for a single leaf
const LEAF_RIFFLE = 0.36; // seconds per leaf when several are turned in a row
const COVER_TURN = 1.5;

/** The rectangle the open book covers on the table. */
export function companionFrame(place: Place, open: boolean): Frame {
  const margin = 0.03;
  if (!open) return { x: place.x + PAGE.width / 2, z: place.z, width: PAGE.width + margin, depth: PAGE.height + margin };
  return { x: place.x, z: place.z, width: PAGE.width * 2 + margin, depth: PAGE.height + margin };
}

interface CompanionProps {
  carnet: CarnetId;
  place: Place;
  /** The view asked for: 0 closed, 1 the title page, n the nth scan. */
  view: number;
  /** The view the book shows when it first appears (no turning to get there). */
  startView?: number;
  /** Fetch the large scans (the camera is on the book). */
  sharp?: boolean;
  /** Lines framed in red pencil on the Spread shown: [x, y, w, h] as fractions of the Spread. */
  marks?: { spread: number; box: [number, number, number, number]; shown: boolean }[];
  onOpen?: () => void;
  /** Called at the start of every leaf (or cover) turned, for its sound. */
  onTurn?: (what: 'leaf' | 'cover') => void;
  /** Told which view is showing whenever it changes. */
  onView?: (view: number) => void;
}

type Side = 'left' | 'right';
interface Art {
  map: Texture;
  u0: number;
  u1: number;
}

function flatPage(side: Side): BufferGeometry {
  const x0 = side === 'right' ? 0 : -PAGE.width;
  const x1 = x0 + PAGE.width;
  const z = PAGE.height / 2;
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array([x0, 0, -z, x1, 0, -z, x0, 0, z, x1, 0, z]), 3));
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]), 3));
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), 2));
  geometry.setIndex([0, 2, 1, 1, 2, 3]);
  return geometry;
}

function setFlatU(geometry: BufferGeometry, u0: number, u1: number): void {
  const uv = geometry.getAttribute('uv') as BufferAttribute;
  if (uv.getX(0) === u0 && uv.getX(1) === u1) return;
  uv.setX(0, u0);
  uv.setX(1, u1);
  uv.setX(2, u0);
  uv.setX(3, u1);
  uv.needsUpdate = true;
}

/** The two faces of a turning leaf: same shape, different pictures. */
function leafGeometries(): { front: BufferGeometry; back: BufferGeometry; position: BufferAttribute; normal: BufferAttribute } {
  const count = (SEGMENTS + 1) * 2;
  const position = new BufferAttribute(new Float32Array(count * 3), 3);
  const normal = new BufferAttribute(new Float32Array(count * 3), 3);
  const index: number[] = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const a = i * 2;
    index.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
  }
  const make = () => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', position);
    geometry.setAttribute('normal', normal);
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(count * 2), 2));
    geometry.setIndex(index);
    return geometry;
  };
  return { front: make(), back: make(), position, normal };
}

function setLeafU(geometry: BufferGeometry, fromSpine: number, toEdge: number): void {
  const uv = geometry.getAttribute('uv') as BufferAttribute;
  if (uv.getX(0) === fromSpine && uv.getX(SEGMENTS * 2) === toEdge) return;
  for (let i = 0; i <= SEGMENTS; i++) {
    const u = fromSpine + ((toEdge - fromSpine) * i) / SEGMENTS;
    uv.setXY(i * 2, u, 1);
    uv.setXY(i * 2 + 1, u, 0);
  }
  uv.needsUpdate = true;
}

/** The printed cover of the carnet, drawn from its title page's wording. */
function coverTexture(carnet: CarnetId): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 1006;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  const draw = () => {
    const ctx = canvas.getContext('2d')!;
    const { width, height } = canvas;
    // grey-blue book cloth, with its weave
    ctx.fillStyle = '#35404a';
    ctx.fillRect(0, 0, width, height);
    for (let y = 0; y < height; y += 3) {
      ctx.fillStyle = `rgba(0,0,0,${0.05 + ((y * 7) % 5) * 0.012})`;
      ctx.fillRect(0, y, width, 1);
    }
    for (let x = 0; x < width; x += 3) {
      ctx.fillStyle = `rgba(255,255,255,${0.012 + ((x * 5) % 4) * 0.006})`;
      ctx.fillRect(x, 0, 1, height);
    }
    const worn = ctx.createRadialGradient(width / 2, height / 2, 120, width / 2, height / 2, 640);
    worn.addColorStop(0, 'rgba(255,255,255,0.05)');
    worn.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = worn;
    ctx.fillRect(0, 0, width, height);
    // the paper label
    const label = { x: 92, y: 250, w: width - 184, h: 330 };
    ctx.fillStyle = '#e6dbbb';
    ctx.fillRect(label.x, label.y, label.w, label.h);
    ctx.strokeStyle = '#1b1a17';
    ctx.lineWidth = 3;
    ctx.strokeRect(label.x + 12, label.y + 12, label.w - 24, label.h - 24);
    ctx.lineWidth = 1;
    ctx.strokeRect(label.x + 19, label.y + 19, label.w - 38, label.h - 38);
    ctx.fillStyle = '#1b1a17';
    ctx.textAlign = 'center';
    ctx.font = '700 46px "Old Standard TT", serif';
    ctx.fillText('CARNET', width / 2, label.y + 92);
    ctx.fillText('INDIVIDUEL', width / 2, label.y + 146);
    ctx.font = 'italic 400 30px "Old Standard TT", serif';
    ctx.fillText('des services aériens', width / 2, label.y + 196);
    ctx.fillRect(width / 2 - 60, label.y + 222, 120, 2);
    ctx.font = '400 26px "Special Elite", monospace';
    ctx.fillText(carnetOf(carnet).opened.replace(/^.*le /, '').toUpperCase(), width / 2, label.y + 276);
    texture.needsUpdate = true;
  };
  draw();
  void whenFontsReady().then(draw);
  return texture;
}

export function Companion({ carnet, place, view, startView, sharp = false, marks, onOpen, onTurn, onView }: CompanionProps) {
  const last = lastView(carnet);
  const wanted = MathUtils.clamp(Math.round(view), 0, last);

  const blank = useMemo(() => paperTexture('cream'), []);
  const edge = useMemo(() => pageEdgeTexture(), []);
  const shadow = useMemo(() => contactShadowTexture(), []);
  const cover = useMemo(() => coverTexture(carnet), [carnet]);
  const leftGeometry = useMemo(() => flatPage('left'), []);
  const rightGeometry = useMemo(() => flatPage('right'), []);
  const leaf = useMemo(() => leafGeometries(), []);

  const leftPage = useRef<Mesh>(null);
  const rightPage = useRef<Mesh>(null);
  const leafFront = useRef<Mesh>(null);
  const leafBack = useRef<Mesh>(null);
  const leftBlock = useRef<Mesh>(null);
  const rightBlock = useRef<Mesh>(null);
  const coverHinge = useRef<Group>(null);
  const shade = useRef<Mesh>(null);
  const marksGroup = useRef<Group>(null);

  const book = useRef({
    shown: MathUtils.clamp(Math.round(startView ?? view), 0, last),
    turn: null as null | { from: number; to: number; progress: number; duration: number },
    reported: -1,
  });

  useEffect(
    () => () => {
      leftGeometry.dispose();
      rightGeometry.dispose();
      leaf.front.dispose();
      leaf.back.dispose();
      cover.dispose();
    },
    [leftGeometry, rightGeometry, leaf, cover],
  );

  const scan = (which: number, large: boolean): Texture => {
    const small = textureNow(scanUrl(carnet, which, false));
    if (large) return textureNow(scanUrl(carnet, which, true)) ?? small ?? blank;
    return small ?? blank;
  };

  const art = (which: number, side: Side, large: boolean): Art => {
    if (which < 1 || which > last) return { map: blank, u0: 0, u1: 1 };
    if (isSinglePage(carnet, which)) return side === 'right' ? { map: scan(which, large), u0: 0, u1: 1 } : { map: blank, u0: 0, u1: 1 };
    return side === 'left' ? { map: scan(which, large), u0: 0, u1: 0.5 } : { map: scan(which, large), u0: 0.5, u1: 1 };
  };

  const paint = (mesh: Mesh | null, picture: Art) => {
    if (!mesh) return;
    const material = mesh.material as MeshStandardMaterial;
    if (material.map !== picture.map) material.map = picture.map;
  };

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const state = book.current;

    // ----- decide which leaf to turn next -----
    if (!state.turn && state.shown !== wanted) {
      const distance = Math.abs(wanted - state.shown);
      const direction = Math.sign(wanted - state.shown);
      const isCover = Math.min(state.shown, state.shown + direction) === 0;
      // a long way is covered in at most four turns, each taking several leaves at once
      const hop = isCover ? 1 : Math.max(1, Math.ceil(distance / 4));
      const to = isCover ? state.shown + direction : MathUtils.clamp(state.shown + direction * hop, 1, last);
      state.turn = { from: state.shown, to, progress: 0, duration: isCover ? COVER_TURN : distance > 1 ? LEAF_RIFFLE : LEAF_TURN };
      onTurn?.(isCover ? 'cover' : 'leaf');
    }
    if (state.turn) {
      state.turn.progress += dt / state.turn.duration;
      if (state.turn.progress >= 1) {
        state.shown = state.turn.to;
        state.turn = null;
      }
    }
    if (!state.turn && state.reported !== state.shown) {
      state.reported = state.shown;
      onView?.(state.shown);
    }

    // ----- where the book stands between two views -----
    const turn = state.turn;
    const lower = turn ? Math.min(turn.from, turn.to) : state.shown;
    const upper = turn ? Math.max(turn.from, turn.to) : state.shown;
    const forward = turn ? turn.to > turn.from : true;
    const raw = turn ? (forward ? turn.progress : 1 - turn.progress) : 0;
    const q = raw * raw * (3 - 2 * raw); // eased
    const position = turn ? lower + (upper - lower) * q : state.shown;

    const coverTurning = !!turn && lower === 0;
    const coverOpen = coverTurning ? q : state.shown >= 1 ? 1 : 0;
    const through = MathUtils.clamp((position - 1) / Math.max(1, last - 1), 0, 1);
    const leftThickness = BLOCK * through;
    const rightThickness = BLOCK * (1 - through) + 0.0004;
    const leftTop = BOARD + leftThickness;
    const rightTop = BOARD + rightThickness;

    // ----- the blocks of leaves and the pages on top of them -----
    if (leftBlock.current) {
      leftBlock.current.visible = leftThickness > 0.0002;
      leftBlock.current.scale.y = Math.max(leftThickness, 0.0001);
      leftBlock.current.position.y = BOARD + leftThickness / 2;
    }
    if (rightBlock.current) {
      rightBlock.current.scale.y = rightThickness;
      rightBlock.current.position.y = BOARD + rightThickness / 2;
    }
    const still = !turn;
    const leftArt = art(coverTurning ? 1 : lower, 'left', sharp && still);
    const rightArt = art(coverTurning ? 1 : upper, 'right', sharp && still);
    paint(leftPage.current, leftArt);
    paint(rightPage.current, rightArt);
    setFlatU(leftGeometry, leftArt.u0, leftArt.u1);
    setFlatU(rightGeometry, rightArt.u0, rightArt.u1);
    if (leftPage.current) {
      leftPage.current.position.y = leftTop + 0.0003;
      // nothing lies on the left until the cover has come down there
      leftPage.current.visible = coverOpen > 0.97;
    }
    if (rightPage.current) rightPage.current.position.y = rightTop + 0.0003;

    // ----- the turning leaf -----
    const leafTurning = !!turn && !coverTurning;
    if (leafFront.current && leafBack.current) {
      leafFront.current.visible = leafTurning;
      leafBack.current.visible = leafTurning;
      if (leafTurning) {
        const frontArt = art(lower, 'right', false);
        const backArt = art(upper, 'left', false);
        paint(leafFront.current, frontArt);
        paint(leafBack.current, backArt);
        setLeafU(leaf.front, frontArt.u0, frontArt.u1);
        setLeafU(leaf.back, backArt.u1, backArt.u0);
        // the hinge turns half a circle; the outer edge trails behind, as paper does in the air
        const hinge = Math.PI * q;
        const trail = 1.05 * Math.sin(Math.PI * q);
        const strip = PAGE.width / SEGMENTS;
        let x = 0;
        let y = MathUtils.lerp(rightTop, leftTop, q) + 0.0008;
        const half = PAGE.height / 2;
        for (let i = 0; i <= SEGMENTS; i++) {
          const along = i / SEGMENTS;
          const angle = MathUtils.clamp(hinge - trail * along * along, 0, Math.PI);
          if (i > 0) {
            x += Math.cos(angle) * strip;
            y += Math.sin(angle) * strip;
          }
          leaf.position.setXYZ(i * 2, x, y, -half);
          leaf.position.setXYZ(i * 2 + 1, x, y, half);
          const nx = -Math.sin(angle);
          const ny = Math.cos(angle);
          leaf.normal.setXYZ(i * 2, nx, ny, 0);
          leaf.normal.setXYZ(i * 2 + 1, nx, ny, 0);
        }
        leaf.position.needsUpdate = true;
        leaf.normal.needsUpdate = true;
        leaf.front.computeBoundingSphere();
        leaf.back.boundingSphere = leaf.front.boundingSphere;
      }
    }

    // ----- the front cover: on top when closed, flat on the table to the left when open -----
    if (coverHinge.current) {
      coverHinge.current.rotation.z = Math.PI * coverOpen;
      coverHinge.current.position.y = MathUtils.lerp(BOARD + BLOCK + 0.0004 + BOARD / 2, BOARD / 2, coverOpen);
    }

    if (shade.current) {
      shade.current.position.x = MathUtils.lerp(PAGE.width / 2, 0, coverOpen);
      shade.current.scale.x = MathUtils.lerp(PAGE.width, PAGE.width * 2, coverOpen) * 1.3;
    }
    if (marksGroup.current) marksGroup.current.position.y = Math.max(leftTop, rightTop) + 0.0012;

    // have the neighbours ready before they are needed
    if (wanted >= 1) textureNow(scanUrl(carnet, wanted, false));
    if (still && state.shown + 1 <= last) textureNow(scanUrl(carnet, state.shown + 1, false));
  });

  const pointerOver = (event: ThreeEvent<PointerEvent>) => {
    if (!onOpen) return;
    event.stopPropagation();
    document.body.style.cursor = 'pointer';
  };
  const pointerOut = () => {
    document.body.style.cursor = '';
  };
  const click = (event: ThreeEvent<MouseEvent>) => {
    if (!onOpen) return;
    event.stopPropagation();
    pointerOut();
    onOpen();
  };

  const boardWidth = PAGE.width + 0.005;
  const boardDepth = PAGE.height + 0.008;

  return (
    <group position={[place.x, 0, place.z]} rotation-y={-MathUtils.degToRad(place.turn ?? 0)}>
      <mesh ref={shade} rotation-x={-Math.PI / 2} position-y={0.0005} scale={[PAGE.width * 1.3, PAGE.height * 1.28, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadow} transparent opacity={0.7} depthWrite={false} color="#000" />
      </mesh>

      {/* back cover */}
      <mesh position={[boardWidth / 2 - 0.001, BOARD / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[boardWidth, BOARD, boardDepth]} />
        <meshStandardMaterial color="#2c353d" roughness={0.9} />
      </mesh>

      {/* the leaves not yet turned, and those already turned */}
      <mesh ref={rightBlock} position={[PAGE.width / 2, BOARD, 0]} castShadow>
        <boxGeometry args={[PAGE.width, 1, PAGE.height]} />
        <meshStandardMaterial map={edge} roughness={1} />
      </mesh>
      <mesh ref={leftBlock} position={[-PAGE.width / 2, BOARD, 0]} castShadow visible={false}>
        <boxGeometry args={[PAGE.width, 1, PAGE.height]} />
        <meshStandardMaterial map={edge} roughness={1} />
      </mesh>

      <mesh ref={rightPage} geometry={rightGeometry} receiveShadow onPointerOver={pointerOver} onPointerOut={pointerOut} onClick={click}>
        <meshStandardMaterial map={blank} roughness={0.95} />
      </mesh>
      <mesh ref={leftPage} geometry={leftGeometry} receiveShadow visible={false} onPointerOver={pointerOver} onPointerOut={pointerOut} onClick={click}>
        <meshStandardMaterial map={blank} roughness={0.95} />
      </mesh>

      <mesh ref={leafFront} geometry={leaf.front} castShadow visible={false} frustumCulled={false}>
        <meshStandardMaterial map={blank} roughness={0.95} side={FrontSide} />
      </mesh>
      <mesh ref={leafBack} geometry={leaf.back} visible={false} frustumCulled={false}>
        <meshStandardMaterial map={blank} roughness={0.95} side={BackSide} />
      </mesh>

      {/* front cover, hinged on the spine */}
      <group ref={coverHinge} position={[0, BOARD + BLOCK + BOARD / 2, 0]}>
        <mesh position={[boardWidth / 2 - 0.001, 0, 0]} castShadow receiveShadow onPointerOver={pointerOver} onPointerOut={pointerOut} onClick={click}>
          <boxGeometry args={[boardWidth, BOARD, boardDepth]} />
          <meshStandardMaterial attach="material-0" color="#2c353d" roughness={0.9} />
          <meshStandardMaterial attach="material-1" color="#2c353d" roughness={0.9} />
          <meshStandardMaterial attach="material-2" map={cover} roughness={0.85} />
          <meshStandardMaterial attach="material-3" map={blank} roughness={0.95} />
          <meshStandardMaterial attach="material-4" color="#2c353d" roughness={0.9} />
          <meshStandardMaterial attach="material-5" color="#2c353d" roughness={0.9} />
        </mesh>
      </group>

      <group ref={marksGroup}>
        {marks?.map((mark, index) => (
          <PencilFrame key={index} box={mark.box} isShown={() => mark.shown && !book.current.turn && book.current.shown === mark.spread} />
        ))}
      </group>
    </group>
  );
}

/** A frame drawn in red pencil around some lines of a Spread, one side after the other. */
function PencilFrame({ box, isShown }: { box: [number, number, number, number]; isShown: () => boolean }) {
  const [bx, by, bw, bh] = box;
  const width = bw * PAGE.width * 2;
  const depth = bh * PAGE.height;
  const centreX = -PAGE.width + (bx + bw / 2) * PAGE.width * 2;
  const centreZ = -PAGE.height / 2 + (by + bh / 2) * PAGE.height;
  const stroke = 0.0022;
  const sides = useRef<(Group | null)[]>([]);
  const drawn = useRef(0);

  useFrame((_, delta) => {
    const goal = isShown() ? 1 : 0;
    drawn.current = MathUtils.clamp(drawn.current + (goal > drawn.current ? 1 : -3) * (Math.min(delta, 0.1) / 0.9), 0, 1);
    sides.current.forEach((side, index) => {
      if (!side) return;
      // each side takes a quarter of the stroke
      const part = MathUtils.clamp(drawn.current * 4 - index, 0, 1);
      side.visible = part > 0.001;
      if (index % 2 === 0) side.scale.x = Math.max(part, 0.001);
      else side.scale.z = Math.max(part, 0.001);
    });
  });

  // the pencil goes round: top (left to right), right side (down), bottom (right to left), left side (up)
  const strokes: { from: [number, number, number]; size: [number, number, number]; centre: [number, number, number] }[] = [
    { from: [-width / 2, 0, -depth / 2], size: [width, 0.0004, stroke], centre: [width / 2, 0, 0] },
    { from: [width / 2, 0, -depth / 2], size: [stroke, 0.0004, depth], centre: [0, 0, depth / 2] },
    { from: [width / 2, 0, depth / 2], size: [width, 0.0004, stroke], centre: [-width / 2, 0, 0] },
    { from: [-width / 2, 0, depth / 2], size: [stroke, 0.0004, depth], centre: [0, 0, -depth / 2] },
  ];

  return (
    <group position={[centreX, 0, centreZ]}>
      {strokes.map((line, index) => (
        <group
          key={index}
          position={line.from}
          visible={false}
          ref={(group) => {
            sides.current[index] = group;
          }}
        >
          <mesh position={line.centre}>
            <boxGeometry args={line.size} />
            <meshBasicMaterial color="#b3261c" transparent opacity={0.82} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
