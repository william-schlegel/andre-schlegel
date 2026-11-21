import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { contentOf } from '../content';
import { AIRCRAFT } from '../content/models';
import type { ChapterId, ModelCue, ModelId } from '../content/types';
import { modelHeight, modelSpan, poseOf } from '../models/RecognitionModel';
import { FIELD_OF_VIEW, lookAt } from '../stage/shot';
import { CloseUpFrame } from './CloseUpFrame';

gsap.registerPlugin(useGSAP);

/**
 * A Recognition model taken in hand: the camera comes level with it, and the visitor turns
 * it every way (dragging), nearer or further (the wheel), as aircrews learnt silhouettes.
 */
export function ModelCloseUp({ model, chapter }: { model: ModelId; chapter: ChapterId }) {
  const aircraft = AIRCRAFT[model];
  const cue = contentOf(chapter).cues.find((item): item is ModelCue => item.kind === 'model' && item.model === model);
  const [near, setNear] = useState(1);
  const held = useRef<{ x: number; y: number } | null>(null);
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cue) return;
    // far enough to see the whole span, whatever the screen's shape
    const aspect = window.innerWidth / window.innerHeight;
    const half = Math.tan((FIELD_OF_VIEW * Math.PI) / 360);
    const distance = (modelSpan(model) * 1.25) / (2 * half * Math.min(aspect * 0.62, 1));
    lookAt({ x: cue.place.x + 0.05 * near, z: cue.place.z, y: modelHeight(model), distance: distance * near, tilt: 66 });
  }, [cue, model, near]);

  // start from a three-quarter view, the best to know an aircraft by
  useEffect(() => {
    const pose = poseOf(model);
    pose.touched = performance.now() / 1000;
    return () => {
      pose.pitch = 0;
      pose.touched = performance.now() / 1000 - 3;
    };
  }, [model]);

  useGSAP(() => {
    gsap.fromTo(card.current, { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'power2.out', delay: 0.25 });
  });

  const down = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    held.current = { x: event.clientX, y: event.clientY };
    poseOf(model).held = true;
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!held.current) return;
    const pose = poseOf(model);
    pose.yaw += (event.clientX - held.current.x) * 0.011;
    pose.pitch = Math.min(1.35, Math.max(-1.35, pose.pitch + (event.clientY - held.current.y) * 0.008));
    held.current = { x: event.clientX, y: event.clientY };
  };
  const up = () => {
    held.current = null;
    const pose = poseOf(model);
    pose.held = false;
    pose.touched = performance.now() / 1000;
  };

  return (
    <CloseUpFrame label={aircraft?.name ?? 'Maquette'} veil={false}>
      <div
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onWheel={(event) => setNear((value) => Math.min(1.5, Math.max(0.45, value * (event.deltaY > 0 ? 1.08 : 0.92))))}
      />
      {aircraft && (
        <div ref={card} className="pointer-events-none invisible absolute right-5 top-1/2 w-[19rem] -translate-y-1/2 bg-paper px-6 py-5 text-ink shadow-[0_20px_50px_rgb(0_0_0/0.6)]">
          <p className="typed text-[0.64rem] uppercase tracking-[0.22em] text-red-ink">Maquette de reconnaissance</p>
          <h2 className="title-face mt-1 text-[1.9rem] leading-none">{aircraft.name}</h2>
          <p className="mt-2 text-[1.05rem] italic leading-snug">{aircraft.kind}</p>
          <dl className="typed mt-3 grid grid-cols-[auto_1fr] gap-x-3 border-t border-ink/25 pt-3 text-[0.76rem] leading-[1.35rem]">
            {aircraft.facts.map(([name, value]) => (
              <div key={name} className="contents">
                <dt className="text-ink-soft">{name}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 border-t border-ink/25 pt-3 text-[0.98rem] leading-snug">{aircraft.role}</p>
        </div>
      )}
      <p className="typed pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-sm bg-night/70 px-4 py-2 text-[0.72rem] tracking-wider text-paper/85 backdrop-blur-sm">
        Glisser pour faire tourner la maquette · molette pour s’approcher
      </p>
    </CloseUpFrame>
  );
}
