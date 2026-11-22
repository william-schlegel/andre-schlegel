import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { CanvasTexture, DoubleSide, MathUtils, SRGBColorSpace, type BufferGeometry, type Group, type MeshStandardMaterial } from 'three';
import type { ModelCue, ModelId } from '../content/types';
import { contactShadowTexture } from '../stage/surfaces';
import { whenFontsReady } from '../stage/textures';
import { ANSON, anson } from './anson';
import { BLOCH_200, bloch200 } from './bloch200';
import { BLOCH_210, bloch210 } from './bloch210';
import { DB_7, db7 } from './db7';
import { HALIFAX, halifax } from './halifax';
import { POTEZ_25, potez25 } from './potez25';
import { WELLINGTON, wellington } from './wellington';

/** All the models are to the same scale, as a set of recognition models is. */
export const MODEL_SCALE = 1 / 60;
/** The height of the stand: from the table to the model's belly. */
const STAND = 0.085;

interface Airframe {
  make: () => BufferGeometry;
  span: number;
  length: number;
  lowest: number;
}

const AIRFRAMES: Partial<Record<ModelId, Airframe>> = {
  'bloch-200': { make: bloch200, ...BLOCH_200 },
  'potez-25': { make: potez25, ...POTEZ_25 },
  'bloch-210': { make: bloch210, ...BLOCH_210 },
  'db-7': { make: db7, ...DB_7 },
  anson: { make: anson, ...ANSON },
  wellington: { make: wellington, ...WELLINGTON },
  halifax: { make: halifax, ...HALIFAX },
};

const castings = new Map<ModelId, BufferGeometry>();
function casting(id: ModelId): BufferGeometry {
  let geometry = castings.get(id);
  if (!geometry) {
    const airframe = AIRFRAMES[id];
    if (!airframe) throw new Error(`No Recognition model of ${id} yet`);
    geometry = airframe.make();
    castings.set(id, geometry);
  }
  return geometry;
}

/** Where the visitor has turned each model: kept apart from React, read every frame. */
export const poses = new Map<ModelId, { yaw: number; pitch: number; touched: number; held: boolean }>();
export function poseOf(id: ModelId) {
  let pose = poses.get(id);
  if (!pose) {
    pose = { yaw: 0, pitch: 0, touched: -Infinity, held: false };
    poses.set(id, pose);
  }
  return pose;
}

/** The height above the table of the middle of a model on its stand, for the camera. */
export function modelHeight(id: ModelId): number {
  const airframe = AIRFRAMES[id];
  return STAND + (airframe ? -airframe.lowest * MODEL_SCALE * 0.5 : 0.02);
}

export function modelSpan(id: ModelId): number {
  return (AIRFRAMES[id]?.span ?? 20) * MODEL_SCALE;
}

function labelTexture(lines: string[]): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 220;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  const draw = () => {
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ece2c6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(27, 26, 23, 0.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
    ctx.fillStyle = '#1b1a17';
    ctx.textAlign = 'center';
    ctx.font = '700 70px "Old Standard TT", serif';
    ctx.fillText(lines[0] ?? '', canvas.width / 2, 92);
    ctx.font = '400 30px "Special Elite", monospace';
    lines.slice(1).forEach((line, index) => {
      ctx.fillStyle = index === 1 ? '#a8281e' : '#1b1a17';
      ctx.fillText(line, canvas.width / 2, 140 + index * 42);
    });
    texture.needsUpdate = true;
  };
  draw();
  void whenFontsReady().then(draw);
  return texture;
}

interface RecognitionModelProps {
  cue: ModelCue;
  shown: boolean;
  /** The model is the object of a Close-up: it may be turned every way. */
  inHand: boolean;
  onOpen?: () => void;
}

/**
 * A Recognition model on its stand. It turns slowly by itself; the visitor can take it and
 * turn it (dragging), and a simple click opens its Close-up.
 */
export function RecognitionModel({ cue, shown, inHand, onOpen }: RecognitionModelProps) {
  const geometry = useMemo(() => casting(cue.model), [cue.model]);
  const airframe = AIRFRAMES[cue.model]!;
  const label = useMemo(() => labelTexture(cue.label), [cue.label]);
  const shadow = useMemo(() => contactShadowTexture(), []);
  useEffect(() => () => label.dispose(), [label]);

  const root = useRef<Group>(null);
  const tipping = useRef<Group>(null);
  const turntable = useRef<Group>(null);
  const attitude = useRef<Group>(null);
  const card = useRef<MeshStandardMaterial>(null);
  const presence = useRef(shown ? 1 : 0);
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);
  const pose = poseOf(cue.model);
  const base = MathUtils.degToRad(cue.place.turn ?? 0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    presence.current = MathUtils.damp(presence.current, shown ? 1 : 0, shown ? 3.2 : 7, dt);
    const p = presence.current;
    const node = root.current;
    if (!node) return;
    node.visible = p > 0.01;
    if (card.current) {
      card.current.opacity = MathUtils.clamp((p - 0.6) / 0.4, 0, 1) * (inHand ? 0 : 1);
      // a label not there must not hide the label of the model that has taken its place
      card.current.visible = card.current.opacity > 0.01;
    }
    if (!node.visible) return;
    // set down from above, as by a hand
    node.position.y = (1 - p) * 0.3;
    node.scale.setScalar(0.55 + 0.45 * p);

    // left alone, it turns slowly on its stand; once touched it stays as the visitor left it
    const alone = performance.now() / 1000 - pose.touched > 5 && !pose.held;
    if (alone && !inHand) pose.yaw += dt * 0.16;
    if (!inHand && !pose.held) pose.pitch = MathUtils.damp(pose.pitch, 0, 2, dt);
    // the visitor's hand tips it towards them or away, whichever way it is turned
    if (tipping.current) tipping.current.rotation.x = pose.pitch;
    if (turntable.current) turntable.current.rotation.y = -base + pose.yaw;
    if (attitude.current) {
      // climbing a little and banked, as if in a turn
      attitude.current.rotation.z = MathUtils.degToRad(5);
      attitude.current.rotation.x = MathUtils.degToRad(-9);
    }
  });

  const down = (event: ThreeEvent<PointerEvent>) => {
    if (!shown) return;
    event.stopPropagation();
    (event.target as Element).setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, moved: 0 };
    pose.held = true;
  };
  const move = (event: ThreeEvent<PointerEvent>) => {
    const held = drag.current;
    if (!held) return;
    event.stopPropagation();
    const dx = event.clientX - held.x;
    const dy = event.clientY - held.y;
    held.x = event.clientX;
    held.y = event.clientY;
    held.moved += Math.abs(dx) + Math.abs(dy);
    pose.yaw += dx * 0.011;
    if (inHand) pose.pitch = MathUtils.clamp(pose.pitch + dy * 0.008, -1.3, 1.3);
  };
  const up = (event: ThreeEvent<PointerEvent>) => {
    const held = drag.current;
    if (!held) return;
    event.stopPropagation();
    (event.target as Element).releasePointerCapture(event.pointerId);
    drag.current = null;
    pose.held = false;
    pose.touched = performance.now() / 1000;
    if (held.moved < 5 && !inHand) onOpen?.();
  };
  const over = (event: ThreeEvent<PointerEvent>) => {
    if (!shown) return;
    event.stopPropagation();
    document.body.style.cursor = 'grab';
  };
  const out = () => {
    if (!drag.current) document.body.style.cursor = '';
  };
  useEffect(() => () => void (document.body.style.cursor = ''), []);

  const height = STAND - airframe.lowest * MODEL_SCALE * 0.5;
  const reach = (airframe.span * MODEL_SCALE) / 2;

  return (
    <group position={[cue.place.x, 0, cue.place.z]}>
      <group ref={root} visible={false}>
        {/* the stand: a turned wooden foot and a brass rod */}
        <mesh position-y={0.006} castShadow receiveShadow>
          <cylinderGeometry args={[0.03, 0.038, 0.012, 40]} />
          <meshStandardMaterial color="#3b2416" roughness={0.45} />
        </mesh>
        <mesh position-y={0.014} castShadow>
          <cylinderGeometry args={[0.012, 0.024, 0.006, 32]} />
          <meshStandardMaterial color="#3b2416" roughness={0.45} />
        </mesh>
        <mesh position-y={height / 2 + 0.006} castShadow>
          <cylinderGeometry args={[0.0022, 0.0022, height, 12]} />
          <meshStandardMaterial color="#b9995a" roughness={0.35} metalness={0.85} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position-y={0.0008}>
          <planeGeometry args={[0.13, 0.13]} />
          <meshBasicMaterial map={shadow} transparent opacity={0.6} depthWrite={false} color="#000" />
        </mesh>

        <group ref={tipping} position-y={height}>
          <group ref={turntable}>
            <group ref={attitude}>
            <mesh
              geometry={geometry}
              scale={MODEL_SCALE}
              castShadow
              receiveShadow
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onPointerOver={over}
              onPointerOut={out}
            >
              {/* one colour, no markings: the dull grey of a moulded recognition model */}
              <meshStandardMaterial color="#7b807d" roughness={0.5} metalness={0.15} side={DoubleSide} />
            </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* its typed label, lying in front of the stand */}
      <mesh rotation-x={-Math.PI / 2} rotation-z={MathUtils.degToRad(-3)} position={[0, 0.0026, Math.min(reach * 0.75, 0.13) + 0.03]}>
        <planeGeometry args={[0.15, 0.0516]} />
        <meshStandardMaterial ref={card} map={label} roughness={0.92} transparent opacity={0} />
      </mesh>
    </group>
  );
}
