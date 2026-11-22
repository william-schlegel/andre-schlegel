import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { MathUtils, type MeshStandardMaterial } from 'three';
import { LOOKS, type LookName } from './looks';
import { clothTexture, deskPadTexture, woodTexture } from './surfaces';

/** The size of the leather desk pad on which the Dossier is laid, in metres. */
export const PAD = { width: 2.1, depth: 1.3 };

/**
 * The table everything lies on. At night it is a walnut desk with a leather pad; by day
 * (Tours) the pad is gone and the wood is pale oak; in Africa it is a trestle table under
 * canvas. One surface fades into the other.
 */
export function Table({ look }: { look: LookName }) {
  const surface = LOOKS[look].surface;
  const walnut = useMemo(() => woodTexture('walnut'), []);
  const oak = useMemo(() => woodTexture('oak'), []);
  const pad = useMemo(() => deskPadTexture(), []);
  const cloth = useMemo(() => clothTexture(), []);
  const oakMaterial = useRef<MeshStandardMaterial>(null);
  const clothMaterial = useRef<MeshStandardMaterial>(null);
  const padMaterial = useRef<MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    const ease = 1 - Math.exp(-1.2 * Math.min(delta, 0.1));
    if (oakMaterial.current) {
      oakMaterial.current.opacity = MathUtils.lerp(oakMaterial.current.opacity, surface === 'oak' ? 1 : 0, ease);
      oakMaterial.current.visible = oakMaterial.current.opacity > 0.01;
    }
    if (clothMaterial.current) {
      clothMaterial.current.opacity = MathUtils.lerp(clothMaterial.current.opacity, surface === 'cloth' ? 1 : 0, ease);
      clothMaterial.current.visible = clothMaterial.current.opacity > 0.01;
    }
    if (padMaterial.current) {
      padMaterial.current.opacity = MathUtils.lerp(padMaterial.current.opacity, surface === 'desk-pad' ? 1 : 0, ease);
      padMaterial.current.visible = padMaterial.current.opacity > 0.01;
    }
  });

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.004} receiveShadow>
        <planeGeometry args={[9, 6]} />
        <meshStandardMaterial map={walnut} roughness={0.62} metalness={0} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.003} receiveShadow>
        <planeGeometry args={[9, 6]} />
        <meshStandardMaterial ref={oakMaterial} map={oak} roughness={0.7} transparent opacity={0} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.002} receiveShadow>
        <planeGeometry args={[9, 6]} />
        <meshStandardMaterial ref={clothMaterial} map={cloth} roughness={0.96} transparent opacity={0} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0.04]} receiveShadow>
        <planeGeometry args={[PAD.width, PAD.depth]} />
        <meshStandardMaterial ref={padMaterial} map={pad} roughness={0.78} transparent opacity={surface === 'desk-pad' ? 1 : 0} />
      </mesh>
    </group>
  );
}
