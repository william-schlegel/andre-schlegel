import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { MathUtils, Object3D, type SpotLight, type Texture } from 'three';
import { shelved } from '../content/shelf';
import type { ModelCue, ModelId } from '../content/types';
import { woodTexture } from '../stage/surfaces';
import { modelSpan, RecognitionModel } from './RecognitionModel';

/**
 * The Shelf stands away from the table, in the dark of the room: the camera goes there and
 * comes back by a cut, and nothing of it is seen from a Scene.
 */
const SHELF_Z = -12;
const DEPTH = 0.56;
/** Between the wing tips of two neighbours, each turned the way it was set down. */
const GAP = 0.1;
/** Every model is set down three-quarter on, nose towards the visitor's left. */
const TURN = -32;
const TILE = 1.6; // metres of wood in one tile of the texture

const PLACES = new Map<ModelId, number>();
let length = 0;
function layOut(): void {
  if (PLACES.size) return;
  let x = 0;
  for (const { model } of shelved()) {
    const span = modelSpan(model);
    PLACES.set(model, x + span / 2);
    x += span + GAP;
  }
  length = x - GAP;
  // the middle of the Shelf is at x = 0
  for (const [model, at] of PLACES) PLACES.set(model, at - length / 2);
}

/** Where a model stands on the Shelf. */
export function shelfPlace(model: ModelId): { x: number; z: number } {
  layOut();
  return { x: PLACES.get(model) ?? 0, z: SHELF_Z };
}

function boards(tone: 'walnut' | 'oak', across: number, along: number, upright = false): Texture {
  const texture = woodTexture(tone).clone();
  texture.repeat.set(along / TILE, across / TILE);
  if (upright) {
    texture.center.set(0.5, 0.5);
    texture.rotation = Math.PI / 2;
    texture.repeat.set(across / TILE, along / TILE);
  }
  texture.needsUpdate = true;
  return texture;
}

/**
 * The Shelf: a long oak board against a panelled wall, with every Recognition model of the
 * Journey on it, all to the same scale. A picture light follows the model that is looked at.
 */
export function Shelf({ model }: { model: ModelId }) {
  layOut();
  const scene = useThree((state) => state.scene);
  const board = useMemo(() => boards('oak', DEPTH, length + 0.7), []);
  const wall = useMemo(() => boards('walnut', 4, length + 8, true), []);
  useEffect(
    () => () => {
      board.dispose();
      wall.dispose();
    },
    [board, wall],
  );
  const cues = useMemo(
    () =>
      shelved().map(
        (one): ModelCue => ({ kind: 'model', id: `shelf-${one.model}`, at: 0, model: one.model, place: { ...shelfPlace(one.model), turn: TURN }, label: one.label }),
      ),
    [],
  );

  // the picture light, and what it is turned to
  const lamp = useRef<SpotLight>(null);
  const aim = useMemo(() => new Object3D(), []);
  useEffect(() => {
    scene.add(aim);
    return () => void scene.remove(aim);
  }, [scene, aim]);
  const lit = useRef<number | null>(null);
  useFrame((_, delta) => {
    const wanted = shelfPlace(model).x;
    lit.current = lit.current === null ? wanted : MathUtils.damp(lit.current, wanted, 2.6, Math.min(delta, 0.1));
    aim.position.set(lit.current, 0.09, SHELF_Z - 0.04);
    lamp.current?.position.set(lit.current + 0.42, 1.3, SHELF_Z + 1.25);
  });

  return (
    <group>
      {/* the board: its top at the height of the table, so that a model stands on it as it does there */}
      <mesh position={[0, 0, SHELF_Z]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[length + 0.7, DEPTH]} />
        <meshStandardMaterial map={board} roughness={0.62} />
      </mesh>
      <mesh position={[0, -0.0235, SHELF_Z]}>
        <boxGeometry args={[length + 0.7, 0.045, DEPTH]} />
        <meshStandardMaterial color="#6b4f33" roughness={0.7} />
      </mesh>
      {/* the wall behind: dark panelling, its boards upright */}
      <mesh position={[0, 0.9, SHELF_Z - DEPTH / 2]} receiveShadow>
        <planeGeometry args={[length + 8, 4]} />
        <meshStandardMaterial map={wall} roughness={0.85} />
      </mesh>

      {cues.map((cue) => (
        <RecognitionModel key={cue.id} cue={cue} shown inHand={cue.model === model} shelved />
      ))}

      <spotLight
        ref={lamp}
        target={aim}
        color="#ffe2be"
        intensity={17}
        distance={7}
        decay={2}
        angle={0.5}
        penumbra={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-camera-near={0.3}
        shadow-camera-far={5}
      />
      {/* the rest of the Shelf is in the half-light of the room */}
      <hemisphereLight color="#77809a" groundColor="#2a1e14" intensity={0.55} />
    </group>
  );
}
