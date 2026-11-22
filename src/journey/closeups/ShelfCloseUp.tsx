import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import { AIRCRAFT } from '../content/models';
import { alongShelf, shelved } from '../content/shelf';
import type { ModelId } from '../content/types';
import { useJourney } from '../engine/store';
import { shelfPoseOf } from '../models/RecognitionModel';
import { shelfPlace } from '../models/Shelf';
import { stageLight } from '../stage/Light';
import { stageShot } from '../stage/shot';
import { CloseUpFrame } from './CloseUpFrame';
import { ModelInHand } from './ModelInHand';

gsap.registerPlugin(useGSAP);

const nameOf = (model: ModelId) => AIRCRAFT[model]?.name ?? model;
const show = (model: ModelId) => useJourney.setState({ closeUp: { kind: 'shelf', model } });

/**
 * The Shelf: all the Recognition models of the Journey side by side, to the same scale. The
 * visitor goes from one to the next (the buttons, the arrow keys) and takes each in hand as
 * he would on the table.
 */
export function ShelfCloseUp({ model }: { model: ModelId }) {
  const all = shelved();
  const index = all.findIndex((one) => one.model === model);
  const before = alongShelf(model, -1);
  const after = alongShelf(model, 1);
  const words = useRef<HTMLDivElement>(null);

  // the camera and the light are at the Shelf at once, and back at the table at once
  const arrived = useRef(false);
  useEffect(() => {
    arrived.current = true;
    stageLight.cut = true;
    return () => {
      stageShot.cut = true;
      stageLight.cut = true;
    };
  }, []);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      // from the model that is looked at now, however fast the keys follow one another
      const now = useJourney.getState().closeUp;
      if (now?.kind !== 'shelf') return;
      event.preventDefault();
      show(alongShelf(now.model, event.key === 'ArrowLeft' ? -1 : 1));
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  useGSAP(
    () => {
      gsap.fromTo('[data-words]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power1.out', delay: 0.35, stagger: 0.08 });
    },
    { scope: words },
  );

  const step = 'typed flex min-w-0 items-center gap-2 rounded-sm border border-paper/30 bg-night/70 px-3 py-[0.5rem] text-[0.72rem] uppercase tracking-[0.12em] text-paper/90 backdrop-blur-sm transition hover:border-lamp hover:text-lamp';

  return (
    <CloseUpFrame label="L’étagère : les avions du récit" veil={false}>
      <ModelInHand key={model} model={model} pose={shelfPoseOf(model)} place={shelfPlace(model)} tilt={71} least={0.44} cut={!arrived.current} />
      <div ref={words}>
        <header data-words className="pointer-events-none invisible absolute left-5 top-4">
          <p className="typed text-[0.68rem] uppercase tracking-[0.24em] text-lamp/80">L’étagère</p>
          <h2 className="title-face text-[1.55rem] leading-tight text-paper-light">Les avions du récit</h2>
          <p className="typed mt-[0.15rem] text-[0.74rem] text-paper/75 max-lg:hidden">Dix maquettes de reconnaissance, toutes à la même échelle, dans l’ordre où le récit les pose sur la table</p>
        </header>

        <nav data-words className="invisible absolute inset-x-0 bottom-5 flex low:bottom-3 items-center justify-center gap-4 px-4" aria-label="Aller d’une maquette à l’autre">
          <button type="button" onClick={() => show(before)} className={step} aria-label={`Maquette précédente : ${nameOf(before)}`}>
            <span aria-hidden="true">‹</span>
            <span className="truncate max-md:sr-only">{nameOf(before)}</span>
          </button>
          <ol className="flex items-center gap-[0.35rem] rounded-sm bg-night/70 px-3 py-[0.55rem] backdrop-blur-sm">
            {all.map((one, at) => (
              <li key={one.model} className="flex">
                <button
                  type="button"
                  onClick={() => show(one.model)}
                  title={nameOf(one.model)}
                  aria-label={`${nameOf(one.model)}, maquette ${at + 1} sur ${all.length}`}
                  aria-current={at === index ? 'true' : undefined}
                  className="group flex h-4 w-4 items-center justify-center"
                >
                  <span className={`block rounded-full transition-all ${at === index ? 'h-[9px] w-[9px] bg-lamp' : 'h-[6px] w-[6px] bg-paper/45 group-hover:bg-paper'}`} />
                </button>
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => show(after)} className={step} aria-label={`Maquette suivante : ${nameOf(after)}`}>
            <span className="truncate max-md:sr-only">{nameOf(after)}</span>
            <span aria-hidden="true">›</span>
          </button>
        </nav>
        <p data-words className="typed pointer-events-none invisible absolute bottom-[4.6rem] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-night/60 px-3 py-[0.3rem] text-[0.7rem] tracking-wider text-paper/80 backdrop-blur-sm max-lg:hidden" aria-live="polite">
          {index + 1} / {all.length} · glisser pour faire tourner la maquette · molette pour s’approcher · ← → pour passer à une autre
        </p>
      </div>
    </CloseUpFrame>
  );
}
