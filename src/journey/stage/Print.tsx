import { useFrame, useLoader, type ThreeEvent } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  CanvasTexture,
  DoubleSide,
  MathUtils,
  RingGeometry,
  SRGBColorSpace,
  TextureLoader,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
  type Texture,
} from 'three';
import type { Place, PrintCue } from '../content/types';
import { useNarration } from '../engine/journey';
import { contactShadowTexture, paperTexture } from './surfaces';
import { whenFontsReady } from './textures';

const BORDER = 0.011; // the white margin of a photographic print, in metres
const ARRIVAL = 0.95; // seconds for a print to land
const DEPARTURE = 0.4;

export function printDepth(cue: PrintCue): number {
  return (cue.width * cue.size[1]) / cue.size[0];
}

/** The rectangle a print covers on the table, margins included. */
export function printRect(cue: PrintCue) {
  const border = cue.paper === 'photo' || cue.paper === undefined ? BORDER : 0;
  return { x: cue.place.x, z: cue.place.z, width: cue.width + border * 2, depth: printDepth(cue) + border * 2 };
}

interface PrintProps {
  cue: PrintCue;
  /** Whether the Narration has reached it (and not yet taken it away). */
  shown: boolean;
  /** Its rank in the pile: later prints lie on top of earlier ones. */
  order: number;
  onOpen?: (cue: PrintCue) => void;
  /** Called once when the print touches the table, for its sound. */
  onLand?: () => void;
}

/**
 * A photograph or a document on the table. It arrives from the viewer's side, as if dealt
 * by hand, and settles with a slight turn; it lifts under the pointer; a click opens it as a Close-up.
 */
export function Print(props: PrintProps) {
  return (
    <Suspense fallback={null}>
      <PrintOnTable {...props} />
    </Suspense>
  );
}

function PrintOnTable({ cue, shown, order, onOpen, onLand }: PrintProps) {
  const texture = useLoader(TextureLoader, cue.src);
  useEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);
  const width = cue.width;
  const depth = printDepth(cue);
  const ringsShown = useNarration((time) => (cue.rings ?? []).filter((ring) => ring.at <= time).length);
  const labelsShown = useNarration((time) => (cue.labels ?? []).filter((label) => label.at <= time).length);

  return (
    <Leaf texture={texture} width={width} depth={depth} place={cue.place} paper={cue.paper ?? 'photo'} shown={shown} order={order} onOpen={onOpen && (() => onOpen(cue))} onLand={onLand}>
      {(cue.rings ?? []).map((ring, index) => (
        <PencilRing key={index} box={ring.box} width={width} depth={depth} shown={shown && index < ringsShown} />
      ))}
      {(cue.labels ?? []).map((label, index) => (
        <PencilLabel key={label.text} text={label.text} from={label.from} to={label.to} width={width} depth={depth} shown={shown && index < labelsShown} />
      ))}
    </Leaf>
  );
}

interface LeafProps {
  texture: Texture;
  /** Size of the picture on the table, in metres (a photographic print has a white margin around it). */
  width: number;
  depth: number;
  place: Place;
  paper: 'photo' | 'sheet' | 'bare';
  shown: boolean;
  order: number;
  onOpen?: () => void;
  onLand?: () => void;
  /** What is drawn on it (pencil rings, pencilled words). */
  children?: ReactNode;
}

/** A leaf of paper dealt onto the table: how every print and typed sheet arrives, lies, lifts and leaves. */
export function Leaf({ texture, width, depth, place, paper, shown, order, onOpen, onLand, children }: LeafProps) {
  const border = paper === 'photo' ? BORDER : 0;
  const shadow = useMemo(() => contactShadowTexture(), []);
  const stock = useMemo(() => paperTexture('white'), []);

  const group = useRef<Group>(null);
  const picture = useRef<MeshStandardMaterial>(null);
  const margin = useRef<MeshStandardMaterial>(null);
  const shade = useRef<MeshBasicMaterial>(null);
  // presence: 0 away, 1 lying on the table. It starts where it should be, so that arriving
  // in the middle of a Chapter does not replay every landing.
  const presence = useRef(shown ? 1 : 0);
  const lift = useRef(0);
  const landed = useRef(shown);
  const [hovered, setHovered] = useState(false);

  const rest = 0.0015 + order * 0.0011;
  const turn = MathUtils.degToRad(place.turn ?? 0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const goal = shown ? 1 : 0;
    if (presence.current !== goal) {
      const step = dt / (shown ? ARRIVAL : DEPARTURE);
      presence.current = shown ? Math.min(1, presence.current + step) : Math.max(0, presence.current - step);
    }
    const p = presence.current;
    if (shown && !landed.current && p > 0.82) {
      landed.current = true;
      onLand?.();
    }
    if (!shown) landed.current = false;

    lift.current = MathUtils.damp(lift.current, hovered && shown ? 1 : 0, 9, dt);
    const node = group.current;
    if (!node) return;
    node.visible = p > 0.001;
    if (!node.visible) return;

    // ease out: fast at first, then it settles
    const e = 1 - Math.pow(1 - p, 3);
    const away = 1 - e;
    node.position.set(place.x + away * 0.1, rest + away * 0.34 + lift.current * 0.012, place.z + away * 0.5);
    node.rotation.set(-away * 0.55, -turn - away * 0.5, away * 0.12);
    const scale = 1 + lift.current * 0.025;
    node.scale.setScalar(scale);

    const opacity = Math.min(1, p * 2.5);
    // see-through only while it fades in: opaque things sort themselves out, see-through ones do not
    for (const material of [picture.current, margin.current]) {
      if (!material) continue;
      material.opacity = opacity;
      material.transparent = opacity < 1;
    }
    if (shade.current) shade.current.opacity = e * e * (0.5 - lift.current * 0.15);
  });

  const over = (event: ThreeEvent<PointerEvent>) => {
    if (!shown || !onOpen) return;
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'zoom-in';
  };
  const out = () => {
    setHovered(false);
    document.body.style.cursor = '';
  };
  useEffect(() => () => void (document.body.style.cursor = ''), []);

  return (
    <group ref={group} visible={false}>
      {/* the shadow stays on the table while the leaf lifts */}
      <mesh rotation-x={-Math.PI / 2} position-y={-rest + 0.0006} renderOrder={order}>
        <planeGeometry args={[(width + border * 2) * 1.32, (depth + border * 2) * 1.32]} />
        <meshBasicMaterial ref={shade} map={shadow} transparent opacity={0} depthWrite={false} color="#000" />
      </mesh>
      {border > 0 && (
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[width + border * 2, depth + border * 2]} />
          <meshStandardMaterial ref={margin} map={stock} roughness={0.9} transparent />
        </mesh>
      )}
      <mesh
        rotation-x={-Math.PI / 2}
        position-y={0.0004}
        receiveShadow
        onPointerOver={over}
        onPointerOut={out}
        onClick={(event) => {
          if (!shown || !onOpen) return;
          event.stopPropagation();
          out();
          onOpen();
        }}
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial ref={picture} map={texture} roughness={paper === 'photo' ? 0.62 : 0.92} transparent />
      </mesh>
      {children}
    </group>
  );
}

/** The oval Eric draws around someone on a photograph: red grease pencil, drawn in one stroke. */
function PencilRing({ box, width, depth, shown }: { box: [number, number, number, number]; width: number; depth: number; shown: boolean }) {
  const mesh = useRef<Mesh>(null);
  const drawn = useRef(shown ? 1 : 0);
  const last = useRef(-1);
  const [x, y, w, h] = box;

  useFrame((_, delta) => {
    const node = mesh.current;
    if (!node) return;
    const step = Math.min(delta, 0.1) / 0.55;
    drawn.current = shown ? Math.min(1, drawn.current + step) : Math.max(0, drawn.current - step * 2);
    if (drawn.current === last.current) return;
    last.current = drawn.current;
    node.visible = drawn.current > 0.01;
    node.geometry.dispose();
    // a little more than once round, as a hand closes a loop
    node.geometry = new RingGeometry(0.93, 1, 72, 1, Math.PI * 0.6, Math.PI * 2.06 * drawn.current);
  });
  useEffect(() => () => mesh.current?.geometry.dispose(), []);

  return (
    <mesh
      ref={mesh}
      visible={false}
      rotation-x={-Math.PI / 2}
      position={[(x + w / 2 - 0.5) * width, 0.0009, (y + h / 2 - 0.5) * depth]}
      scale={[(w * width) / 2, (h * depth) / 2, 1]}
    >
      <ringGeometry args={[0.93, 1, 72]} />
      <meshBasicMaterial color="#b3261c" transparent opacity={0.85} side={DoubleSide} depthWrite={false} />
    </mesh>
  );
}

const LETTER = 0.6; // a typewriter letter's width, as a fraction of its height

/** A word Eric writes on a photograph, and the line he draws from it to what it names: red grease pencil. */
function PencilLabel({ text, from, to, width, depth, shown }: { text: string; from: [number, number]; to: [number, number]; width: number; depth: number; shown: boolean }) {
  // the lettering grows with the print: a word is about as tall as a thirtieth of the picture is wide
  const tall = width * 0.036;
  const wide = tall * LETTER * (text.length + 1);
  const word = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.height = 96;
    canvas.width = Math.ceil(96 * LETTER * (text.length + 1));
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    const draw = () => {
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '400 74px "Special Elite", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // a light edge, so the word reads on a dark picture as on a pale one
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(244, 236, 214, 0.38)';
      ctx.strokeText(text, canvas.width / 2, 52, canvas.width - 8);
      ctx.fillStyle = '#c22a1e';
      ctx.fillText(text, canvas.width / 2, 52, canvas.width - 8);
      texture.needsUpdate = true;
    };
    draw();
    void whenFontsReady().then(draw);
    return texture;
  }, [text]);
  useEffect(() => () => word.dispose(), [word]);

  // on the print: x to the right, z towards the viewer, from its centre
  const start = { x: (from[0] - 0.5) * width, z: (from[1] - 0.5) * depth };
  const end = { x: (to[0] - 0.5) * width, z: (to[1] - 0.5) * depth };
  const length = Math.hypot(end.x - start.x, end.z - start.z) || 1;
  const along = { x: (end.x - start.x) / length, z: (end.z - start.z) / length };
  // the line leaves the word's edge, not its middle
  const clear = Math.min((wide / 2 + tall * 0.2) / Math.max(Math.abs(along.x), 1e-6), (tall / 2 + tall * 0.15) / Math.max(Math.abs(along.z), 1e-6));
  const stroke = Math.max(0.001, length - clear);

  const line = useRef<Group>(null);
  const letters = useRef<MeshBasicMaterial>(null);
  const drawn = useRef(shown ? 1 : 0);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.1) / 0.7;
    drawn.current = shown ? Math.min(1, drawn.current + step) : Math.max(0, drawn.current - step * 2);
    // the word first, then the line drawn out from it
    if (letters.current) letters.current.opacity = MathUtils.clamp(drawn.current / 0.4, 0, 1) * 0.95;
    const node = line.current;
    if (!node) return;
    const out = MathUtils.clamp((drawn.current - 0.3) / 0.7, 0, 1);
    node.visible = out > 0.01;
    node.scale.x = Math.max(0.0001, out);
  });

  return (
    <group position-y={0.0009}>
      <mesh rotation-x={-Math.PI / 2} position={[start.x, 0, start.z]}>
        <planeGeometry args={[wide, tall * 1.3]} />
        <meshBasicMaterial ref={letters} map={word} transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* a thin stroke, pivoting on the end nearest the word */}
      <group position={[start.x + along.x * clear, 0, start.z + along.z * clear]} rotation-y={-Math.atan2(along.z, along.x)}>
        <group ref={line} visible={false}>
          <mesh rotation-x={-Math.PI / 2} position-x={stroke / 2}>
            <planeGeometry args={[stroke, Math.max(0.0012, tall * 0.07)]} />
            <meshBasicMaterial color="#c22a1e" transparent opacity={0.9} side={DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
