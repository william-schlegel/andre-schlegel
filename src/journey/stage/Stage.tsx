import { Canvas } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { PCFShadowMap } from 'three';
import { CameraRig } from './CameraRig';
import { Light } from './Light';
import type { LookName } from './looks';
import { FIELD_OF_VIEW } from './shot';
import { Table } from './Table';

/** Phones and small tablets get a lighter stage: fewer pixels, no cast shadows. */
export function isLightDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return Math.min(window.innerWidth, window.innerHeight) < 600 || (navigator.hardwareConcurrency ?? 8) <= 4;
}

/**
 * The stage: the table under its light, seen by the gliding camera. Scenes put their prints,
 * the Companion, the Recognition models and the Chart on it as children. `lit` is given when
 * the light is not the table's own (the Shelf brings its lamp: the table's goes out).
 */
export function Stage({ look, lit, children, glide }: { look: LookName; lit?: LookName; children: ReactNode; glide?: number }) {
  const light = isLightDevice();
  return (
    <Canvas
      flat
      shadows={light ? false : { type: PCFShadowMap }}
      dpr={light ? [1, 1.5] : [1, 2]}
      camera={{ fov: FIELD_OF_VIEW, near: 0.05, far: 30, position: [0, 1.9, 0.9] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <CameraRig glide={glide} />
      <Light look={lit ?? look} />
      <Table look={look} />
      {children}
    </Canvas>
  );
}
