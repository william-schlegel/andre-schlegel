import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { MathUtils, Vector3, type PerspectiveCamera } from 'three';
import { stageShot, type Shot } from './shot';

/**
 * Glides the camera to the shot a Scene asks for. The move is damped, never linear, so the
 * picture comes to rest the way a hand-held loupe does; the pointer shifts the view slightly
 * (a light interaction: it never pauses the Narration).
 */
export function CameraRig({ glide = 2.2 }: { glide?: number }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const pointer = useThree((state) => state.pointer);
  const current = useRef<Required<Shot> | null>(null);
  const target = useRef(new Vector3());
  const sway = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const wanted = { y: 0, turn: 0, ...stageShot.wanted };
    const dt = Math.min(delta, 0.1);
    if (!current.current || stageShot.cut) {
      current.current = { ...wanted };
      stageShot.cut = false;
    } else {
      const now = current.current;
      now.x = MathUtils.damp(now.x, wanted.x, glide, dt);
      now.y = MathUtils.damp(now.y, wanted.y, glide, dt);
      now.z = MathUtils.damp(now.z, wanted.z, glide, dt);
      now.distance = MathUtils.damp(now.distance, wanted.distance, glide, dt);
      now.tilt = MathUtils.damp(now.tilt, wanted.tilt, glide, dt);
      now.turn = MathUtils.damp(now.turn, wanted.turn, glide, dt);
    }
    const shot = current.current;

    // a breath of movement, so a still picture is never frozen
    const time = state.clock.elapsedTime;
    const breath = shot.distance * 0.004;
    sway.current.x = MathUtils.damp(sway.current.x, pointer.x, 3, dt);
    sway.current.y = MathUtils.damp(sway.current.y, pointer.y, 3, dt);
    const offsetX = Math.sin(time * 0.23) * breath + sway.current.x * shot.distance * 0.018;
    const offsetZ = Math.cos(time * 0.19) * breath - sway.current.y * shot.distance * 0.012;

    // never exactly overhead: the camera needs to know which way is up
    const tilt = MathUtils.degToRad(Math.max(shot.tilt, 1));
    const turn = MathUtils.degToRad(shot.turn);
    const flat = Math.sin(tilt) * shot.distance;
    camera.position.set(
      shot.x + Math.sin(turn) * flat + offsetX,
      shot.y + Math.cos(tilt) * shot.distance,
      shot.z + Math.cos(turn) * flat + offsetZ,
    );
    target.current.set(shot.x + offsetX * 0.35, shot.y, shot.z + offsetZ * 0.35);
    camera.up.set(0, 1, 0);
    camera.lookAt(target.current);
  });

  return null;
}
