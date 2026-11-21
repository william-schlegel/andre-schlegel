import { useFrame, useLoader } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Color, MathUtils, SRGBColorSpace, TextureLoader, type MeshBasicMaterial, type MeshStandardMaterial } from 'three';
import type { Place } from '../content/types';
import { contactShadowTexture, glowTexture } from './surfaces';

interface DecorationProps {
  src: string;
  width: number;
  depth: number;
  place: Place;
  /** Eric has named it: it catches the light. */
  lit: boolean;
}

/**
 * A decoration lying on the table. Until Eric names it, it keeps to the half-light; then it
 * catches the lamp (a glint, and it stays bright).
 */
export function Decoration(props: DecorationProps) {
  return (
    <Suspense fallback={null}>
      <DecorationOnTable {...props} />
    </Suspense>
  );
}

const DIM = new Color('#5d564c');
const BRIGHT = new Color('#d8d4cc');

function DecorationOnTable({ src, width, depth, place, lit }: DecorationProps) {
  const texture = useLoader(TextureLoader, src);
  useEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);
  const shadow = useMemo(() => contactShadowTexture(), []);
  const glow = useMemo(() => glowTexture(), []);
  const material = useRef<MeshStandardMaterial>(null);
  const halo = useRef<MeshBasicMaterial>(null);
  // starts where it should be: no glint when one arrives in the middle of the Ouverture
  const light = useRef(lit ? 1 : 0);
  const glint = useRef(0);
  const wasLit = useRef(lit);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    if (lit && !wasLit.current) glint.current = 1;
    wasLit.current = lit;
    light.current = MathUtils.damp(light.current, lit ? 1 : 0, 4, dt);
    glint.current = Math.max(0, glint.current - dt / 1.4);
    if (material.current) {
      material.current.color.lerpColors(DIM, BRIGHT, light.current);
      material.current.emissiveIntensity = 0.3 * glint.current;
    }
    if (halo.current) halo.current.opacity = 0.16 * light.current + 0.5 * glint.current;
  });

  return (
    <group position={[place.x, 0.004, place.z]} rotation-y={-MathUtils.degToRad(place.turn ?? 0)}>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.003}>
        <planeGeometry args={[width * 1.5, depth * 1.25]} />
        <meshBasicMaterial map={shadow} transparent opacity={0.6} depthWrite={false} color="#000" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.002}>
        <planeGeometry args={[width * 3.2, depth * 1.9]} />
        <meshBasicMaterial ref={halo} map={glow} transparent opacity={0} depthWrite={false} color="#ffd9a0" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          ref={material}
          map={texture}
          emissiveMap={texture}
          emissive="#fff3dc"
          emissiveIntensity={0}
          transparent
          alphaTest={0.55}
          roughness={0.45}
          metalness={0.15}
        />
      </mesh>
    </group>
  );
}
