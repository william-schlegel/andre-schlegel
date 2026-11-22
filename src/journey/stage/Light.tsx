import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Color, MathUtils, Object3D, type HemisphereLight, type SpotLight } from 'three';
import { LOOKS, type Look, type LookName } from './looks';
import { stageShot } from './shot';

/** Lets the Introduction make the lamp falter as it is switched on: a time of performance.now(), in ms. */
export const lampFlicker = { until: 0 };

/** A Projection asks for the house lights to go down; `level` is where they are, from 0 (up) to 1 (down). */
export const houseLights = { down: false, level: 0 };

/**
 * The stage's light. Going from one Look to another takes a few seconds, like a lamp warming
 * up or a morning coming: the values are eased every frame. The key light leans towards what
 * the camera is looking at, as a hand would turn a desk lamp.
 */
export function Light({ look, pace = 1.1 }: { look: LookName; pace?: number }) {
  const wanted: Look = LOOKS[look];
  const scene = useThree((state) => state.scene);
  const key = useRef<SpotLight>(null);
  const fill = useRef<HemisphereLight>(null);
  const aim = useMemo(() => new Object3D(), []);
  const colours = useMemo(() => ({ key: new Color(), sky: new Color(), ground: new Color(), backdrop: new Color() }), []);
  const started = useRef(false);

  useEffect(() => {
    scene.add(aim);
    return () => void scene.remove(aim);
  }, [scene, aim]);

  useFrame((_, delta) => {
    const spot = key.current;
    const hemisphere = fill.current;
    if (!spot || !hemisphere) return;
    const dt = Math.min(delta, 0.1);
    const ease = started.current ? 1 - Math.exp(-pace * dt) : 1;
    started.current = true;

    houseLights.level = MathUtils.damp(houseLights.level, houseLights.down ? 1 : 0, 1.6, dt);
    const lit = 1 - 0.93 * houseLights.level;

    spot.color.lerp(colours.key.set(wanted.key.colour), ease);
    let strength = MathUtils.lerp(spot.userData.strength ?? 0, wanted.key.strength, ease);
    spot.userData.strength = strength;
    strength *= lit;
    const now = performance.now();
    if (now < lampFlicker.until) {
      // a filament that catches: two or three stumbles
      const t = (now / 1000) * 31;
      strength *= 0.55 + 0.45 * Math.abs(Math.sin(t) * Math.sin(t * 0.37));
    }
    spot.intensity = strength;
    spot.angle = MathUtils.lerp(spot.angle, wanted.key.spread, ease);
    spot.penumbra = MathUtils.lerp(spot.penumbra, wanted.key.softness, ease);
    spot.position.x = MathUtils.lerp(spot.position.x, wanted.key.from[0], ease);
    spot.position.y = MathUtils.lerp(spot.position.y, wanted.key.from[1], ease);
    spot.position.z = MathUtils.lerp(spot.position.z, wanted.key.from[2], ease);

    // lean towards the camera's subject, without leaving the middle of the table
    const lean = 1 - Math.exp(-1.5 * dt);
    aim.position.x = MathUtils.lerp(aim.position.x, stageShot.wanted.x * 0.6, lean);
    aim.position.z = MathUtils.lerp(aim.position.z, stageShot.wanted.z * 0.6, lean);

    hemisphere.color.lerp(colours.sky.set(wanted.fill.sky), ease);
    hemisphere.groundColor.lerp(colours.ground.set(wanted.fill.ground), ease);
    hemisphere.userData.strength = MathUtils.lerp(hemisphere.userData.strength ?? 0, wanted.fill.strength, ease);
    hemisphere.intensity = hemisphere.userData.strength * (1 - 0.88 * houseLights.level);

    colours.backdrop.set(wanted.backdrop).multiplyScalar(1 - 0.8 * houseLights.level);
    if (scene.background instanceof Color) scene.background.lerp(colours.backdrop, ease);
    else scene.background = colours.backdrop.clone();
  });

  return (
    <>
      <spotLight
        ref={key}
        target={aim}
        castShadow
        intensity={0}
        distance={8}
        decay={2}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-camera-near={0.3}
        shadow-camera-far={5}
      />
      <hemisphereLight ref={fill} intensity={0} />
    </>
  );
}
