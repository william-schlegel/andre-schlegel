import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { MathUtils, SRGBColorSpace, VideoTexture, type Group, type MeshBasicMaterial, type PointLight } from 'three';
import type { ProjectionCue } from '../content/types';
import { getClock } from '../engine/journey';
import { houseLights } from './Light';
import { paperTexture } from './surfaces';
import { FIELD_OF_VIEW, type Shot } from './shot';

const FOOT = 0.06; // from the table to the bottom of the picture: the screen's case
const MARGIN = 0.025; // white cloth around the picture
const RISE = 1.3; // seconds for the screen to be pulled up

function pictureHeight(cue: ProjectionCue): number {
  return (cue.width * cue.size[1]) / cue.size[0];
}

/** The shot of someone sitting at the table and watching the screen. */
export function projectionShot(cue: ProjectionCue, aspect: number): Shot {
  const half = Math.tan(MathUtils.degToRad(FIELD_OF_VIEW / 2));
  const height = pictureHeight(cue);
  const distance = Math.max(height / (2 * half * 0.6), cue.width / (2 * half * aspect * 0.86));
  // the captions take more room below than the Posting does above
  const lower = 0.035 * 2 * half * distance;
  return { x: cue.place.x, z: cue.place.z, y: FOOT + height / 2 - lower, distance, tilt: 83 };
}

/**
 * An Archive film: a screen is pulled up at the back of the table, the house lights go
 * down, and the footage runs in step with its own sound, which is part of the Narration.
 * The picture is a slave of the Narration's clock: pausing, or moving in the Timeline,
 * holds or moves the film with it.
 */
export function Projection({ cue, shown }: { cue: ProjectionCue; shown: boolean }) {
  const height = pictureHeight(cue);
  const cloth = useMemo(() => paperTexture('white'), []);

  const video = useMemo(() => {
    const element = document.createElement('video');
    element.src = cue.src;
    element.muted = true; // its sound is in Eric's track
    element.playsInline = true;
    element.preload = 'auto';
    element.crossOrigin = 'anonymous';
    return element;
  }, [cue.src]);
  const film = useMemo(() => {
    const texture = new VideoTexture(video);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, [video]);
  useEffect(
    () => () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
      film.dispose();
      houseLights.down = false;
    },
    [video, film],
  );

  const whole = useRef<Group>(null);
  const screen = useRef<Group>(null);
  const picture = useRef<MeshBasicMaterial>(null);
  const spill = useRef<PointLight>(null);
  const up = useRef(shown ? 1 : 0);
  const lit = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const clock = getClock();
    const local = clock.time - cue.starts;
    const running = shown && local >= 0 && clock.time < cue.until;

    // the screen goes up, then the lights go down; they come back as it is lowered
    up.current = shown ? Math.min(1, up.current + dt / RISE) : Math.max(0, up.current - dt / (RISE * 0.6));
    houseLights.down = shown && clock.time > cue.at + RISE * 0.7 && clock.time < cue.until - 0.4;
    if (whole.current) whole.current.visible = up.current > 0.001;
    if (screen.current) {
      const eased = 1 - Math.pow(1 - up.current, 3);
      screen.current.scale.y = Math.max(0.001, eased);
    }

    // the film follows the Narration
    if (running) {
      const length = Number.isFinite(video.duration) ? video.duration : Infinity;
      const wanted = Math.min(local, length - 0.05);
      const slack = clock.isRunning ? 0.3 : 0.04;
      if (Math.abs(video.currentTime - wanted) > slack) video.currentTime = wanted;
      if (clock.isRunning && video.paused && local < length - 0.1) void video.play().catch(() => {});
      if (!clock.isRunning && !video.paused) video.pause();
    } else if (!video.paused) {
      video.pause();
    }

    // the lamp of a projector is never quite steady
    lit.current = MathUtils.damp(lit.current, running ? 1 : 0, 3, dt);
    const flicker = 0.93 + 0.07 * Math.sin(state.clock.elapsedTime * 47) * Math.sin(state.clock.elapsedTime * 13.1);
    if (picture.current) {
      picture.current.opacity = lit.current;
      picture.current.color.setScalar(flicker);
    }
    if (spill.current) spill.current.intensity = 0.5 * lit.current * flicker;
  });

  const clothWidth = cue.width + MARGIN * 2;
  const clothHeight = height + MARGIN * 2;

  return (
    <group ref={whole} visible={false} position={[cue.place.x, 0, cue.place.z]} rotation-y={-MathUtils.degToRad(cue.place.turn ?? 0)}>
      {/* the case the screen is rolled in */}
      <mesh position={[0, 0.016, 0]} castShadow receiveShadow>
        <boxGeometry args={[clothWidth + 0.05, 0.032, 0.045]} />
        <meshStandardMaterial color="#2c2a26" roughness={0.6} metalness={0.25} />
      </mesh>
      <group ref={screen} position={[0, 0.032, 0]}>
        {/* the upright behind, the rod on top */}
        <mesh position={[0, (clothHeight + 0.03) / 2, -0.012]}>
          <cylinderGeometry args={[0.006, 0.006, clothHeight + 0.03, 10]} />
          <meshStandardMaterial color="#3a3833" roughness={0.5} metalness={0.5} />
        </mesh>
        <mesh position={[0, clothHeight + FOOT - 0.032 - MARGIN + 0.012, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.007, 0.007, clothWidth + 0.03, 10]} />
          <meshStandardMaterial color="#3a3833" roughness={0.5} metalness={0.5} />
        </mesh>
        <mesh position={[0, FOOT - 0.032 - MARGIN + clothHeight / 2, 0]} castShadow>
          <planeGeometry args={[clothWidth, clothHeight]} />
          <meshStandardMaterial map={cloth} color="#d9d6cf" roughness={0.95} />
        </mesh>
        <mesh position={[0, FOOT - 0.032 + height / 2, 0.0015]}>
          <planeGeometry args={[cue.width, height]} />
          <meshBasicMaterial ref={picture} map={film} transparent opacity={0} toneMapped={false} />
        </mesh>
        {/* what the screen throws back on the table */}
        <pointLight ref={spill} position={[0, FOOT + height / 2, 0.35]} color="#dfe6f2" intensity={0} distance={2.2} decay={2} />
      </group>
    </group>
  );
}
