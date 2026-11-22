import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { AIRCRAFT } from '../content/models';
import type { ModelId } from '../content/types';
import { modelHeight, modelSpan, type ModelPose } from '../models/RecognitionModel';
import { FIELD_OF_VIEW, lookAt } from '../stage/shot';

gsap.registerPlugin(useGSAP);

interface ModelInHandProps {
  model: ModelId;
  /** The pose the visitor's hand turns: the model's on the table, or its twin's on the Shelf. */
  pose: ModelPose;
  /** Where the model stands. */
  place: { x: number; z: number };
  /** Degrees from the vertical the camera looks from. */
  tilt?: number;
  /** The least width the picture takes in, in metres: on the Shelf a small model is seen small beside its neighbours. */
  least?: number;
  /** The camera is there at once, rather than gliding to the model. */
  cut?: boolean;
  /** A line of help under the model. */
  hint?: string;
}

/**
 * A Recognition model taken in hand: the camera comes level with it, and the visitor turns
 * it every way (dragging), nearer or further (the wheel), as aircrews learnt silhouettes.
 * Its card says what it is, and what André Schlegel did aboard.
 */
export function ModelInHand({ model, pose, place, tilt = 66, least = 0, cut = false, hint }: ModelInHandProps) {
  const aircraft = AIRCRAFT[model];
  const [near, setNear] = useState(1);
  const held = useRef<{ x: number; y: number } | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const arrive = useRef(cut);

  useEffect(() => {
    // far enough to see the whole span, whatever the screen's shape
    const aspect = window.innerWidth / window.innerHeight;
    const half = Math.tan((FIELD_OF_VIEW * Math.PI) / 360);
    const distance = (Math.max(modelSpan(model), least) * 1.25) / (2 * half * Math.min(aspect * 0.62, 1));
    lookAt({ x: place.x + 0.05 * near, z: place.z, y: modelHeight(model), distance: distance * near, tilt }, arrive.current);
    arrive.current = false;
  }, [model, place.x, place.z, near, tilt, least]);

  // once put back, the model is left a moment as the visitor turned it
  useEffect(() => {
    pose.touched = performance.now() / 1000;
    return () => {
      pose.held = false;
      pose.touched = performance.now() / 1000 - 3;
    };
  }, [pose]);

  useGSAP(() => {
    gsap.fromTo(card.current, { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'power2.out', delay: 0.25 });
  });

  const down = (event: PointerEvent<HTMLDivElement>) => {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // a pointer that is already gone: the drag goes on without the capture
    }
    held.current = { x: event.clientX, y: event.clientY };
    pose.held = true;
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!held.current) return;
    pose.yaw += (event.clientX - held.current.x) * 0.011;
    pose.pitch = Math.min(1.35, Math.max(-1.35, pose.pitch + (event.clientY - held.current.y) * 0.008));
    held.current = { x: event.clientX, y: event.clientY };
  };
  const up = () => {
    held.current = null;
    pose.held = false;
    pose.touched = performance.now() / 1000;
  };

  return (
    <>
      <div
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onWheel={(event) => setNear((value) => Math.min(1.5, Math.max(0.45, value * (event.deltaY > 0 ? 1.08 : 0.92))))}
      />
      {aircraft && (
        <div
          ref={card}
          className="pointer-events-none invisible absolute right-5 top-1/2 w-[19rem] -translate-y-1/2 bg-paper px-6 py-5 text-ink shadow-[0_20px_50px_rgb(0_0_0/0.6)] low:right-3 low:top-[56%] low:w-[14.5rem] low:px-4 low:py-3"
        >
          <p className="typed text-[0.64rem] uppercase tracking-[0.22em] text-red-ink low:hidden">Maquette de reconnaissance</p>
          <h2 className="title-face mt-1 text-[1.9rem] leading-none low:mt-0 low:text-[1.25rem]">{aircraft.name}</h2>
          <p className="mt-2 text-[1.05rem] italic leading-snug low:mt-1 low:text-[0.85rem]">{aircraft.kind}</p>
          {/* on a low screen the card keeps to what the aircraft is, and its place in the story is left to the Narration */}
          <dl className="typed mt-3 grid grid-cols-[auto_1fr] gap-x-3 border-t border-ink/25 pt-3 text-[0.76rem] leading-[1.35rem] low:mt-2 low:pt-2 low:text-[0.66rem] low:leading-[1.05rem]">
            {aircraft.facts.map(([name, value]) => (
              <div key={name} className="contents">
                <dt className="text-ink-soft">{name}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 border-t border-ink/25 pt-3 text-[0.98rem] leading-snug low:hidden">{aircraft.role}</p>
        </div>
      )}
      {hint && (
        <p className="typed pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-sm bg-night/70 px-4 py-2 text-[0.72rem] tracking-wider text-paper/85 backdrop-blur-sm">
          {hint}
        </p>
      )}
    </>
  );
}
