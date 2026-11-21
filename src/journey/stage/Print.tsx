import { useFrame, useLoader, type ThreeEvent } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { MathUtils, SRGBColorSpace, TextureLoader, type Group, type MeshBasicMaterial, type MeshStandardMaterial } from 'three';
import type { PrintCue } from '../content/types';
import { contactShadowTexture, paperTexture } from './surfaces';

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

  const paper = cue.paper ?? 'photo';
  const border = paper === 'photo' ? BORDER : 0;
  const width = cue.width;
  const depth = printDepth(cue);
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
  const turn = MathUtils.degToRad(cue.place.turn ?? 0);

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
    node.position.set(cue.place.x + away * 0.1, rest + away * 0.34 + lift.current * 0.012, cue.place.z + away * 0.5);
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
      {/* the shadow stays on the table while the print lifts */}
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
          onOpen(cue);
        }}
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial ref={picture} map={texture} roughness={paper === 'photo' ? 0.62 : 0.92} transparent />
      </mesh>
    </group>
  );
}
