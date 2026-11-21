import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { carnetOf, isSinglePage, lastView } from '../content/carnets';
import type { CarnetId, Place } from '../content/types';
import { useJourney } from '../engine/store';
import { companionFrame } from '../stage/Companion';
import { lookAt, shotOn } from '../stage/shot';
import { CloseUpFrame } from './CloseUpFrame';

/**
 * The Carnet taken in hand: the camera comes down on the book lying on the table, and the
 * visitor turns its leaves. A click on a page brings the eye closer, to read the handwriting.
 */
export function CarnetCloseUp({ carnet, spread, place }: { carnet: CarnetId; spread: number; place: Place }) {
  const last = lastView(carnet);
  const book = carnetOf(carnet);
  const [near, setNear] = useState<{ u: number; v: number } | null>(null);
  const surface = useRef<HTMLDivElement>(null);

  const turnTo = useCallback(
    (view: number) => {
      const next = Math.min(last, Math.max(1, view));
      useJourney.setState({ closeUp: { kind: 'carnet', carnet, spread: next } });
    },
    [carnet, last],
  );

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') turnTo(spread + 1);
      if (event.key === 'ArrowLeft') turnTo(spread - 1);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [spread, turnTo]);

  // the camera: the whole open book, or a part of it under the pointer
  useEffect(() => {
    const frame = companionFrame(place, true);
    const aspect = window.innerWidth / window.innerHeight;
    if (!near) {
      lookAt(shotOn(frame, aspect, 2, 1.05));
      return;
    }
    const part = { x: frame.x + (near.u - 0.5) * frame.width * 0.8, z: frame.z + (near.v - 0.5) * frame.depth * 0.8, width: frame.width / 2.6, depth: frame.depth / 2.6 };
    lookAt(shotOn(part, aspect, 2, 1));
  }, [near, place]);

  const pointed = (event: PointerEvent<HTMLDivElement>) => {
    const box = surface.current!.getBoundingClientRect();
    return { u: (event.clientX - box.left) / box.width, v: (event.clientY - box.top) / box.height };
  };

  const label = spread === 1 && isSinglePage(carnet, 1) ? 'Page de titre' : `Double page ${spread - 1} sur ${last - 1}`;

  return (
    <CloseUpFrame label={book.title} veil={false}>
      {/* the page itself is on the stage behind: this surface only reads the pointer */}
      <div
        ref={surface}
        className="absolute inset-0"
        style={{ cursor: near ? 'zoom-out' : 'zoom-in' }}
        onClick={(event) => setNear(near ? null : pointed(event as unknown as PointerEvent<HTMLDivElement>))}
        onPointerMove={(event) => near && setNear(pointed(event))}
      />
      <div className="pointer-events-none absolute left-5 top-4 max-w-[60vw]">
        <p className="title-face text-[1.25rem] text-paper-light [text-shadow:0_1px_10px_rgb(0_0_0/0.95)]">{book.title}</p>
        <p className="typed text-[0.74rem] tracking-wide text-lamp/85 [text-shadow:0_1px_8px_rgb(0_0_0/0.95)]">
          {book.holder} — ouvert à {book.opened}
        </p>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-5 flex items-center justify-center gap-4">
        <button
          type="button"
          disabled={spread <= 1}
          onClick={() => turnTo(spread - 1)}
          aria-label="Tourner vers les pages précédentes"
          className="typed pointer-events-auto rounded-sm border border-paper/35 bg-night/75 px-4 py-2 text-[0.8rem] text-paper backdrop-blur-sm transition enabled:hover:border-lamp enabled:hover:text-lamp disabled:opacity-30"
        >
          ‹ Précédentes
        </button>
        <p className="typed min-w-[14rem] rounded-sm bg-night/75 px-4 py-2 text-center text-[0.8rem] text-paper/90 backdrop-blur-sm">{label}</p>
        <button
          type="button"
          disabled={spread >= last}
          onClick={() => turnTo(spread + 1)}
          aria-label="Tourner vers les pages suivantes"
          className="typed pointer-events-auto rounded-sm border border-paper/35 bg-night/75 px-4 py-2 text-[0.8rem] text-paper backdrop-blur-sm transition enabled:hover:border-lamp enabled:hover:text-lamp disabled:opacity-30"
        >
          Suivantes ›
        </button>
      </div>
      <p className="typed pointer-events-none absolute bottom-[4.4rem] left-1/2 -translate-x-1/2 text-[0.68rem] tracking-wider text-paper/55 [text-shadow:0_1px_6px_rgb(0_0_0/0.95)]">
        Cliquer sur une page pour s’en approcher · flèches ← → pour tourner les feuillets
      </p>
    </CloseUpFrame>
  );
}
