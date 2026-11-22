import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import { BONUSES } from '../content/bonuses';
import { CHAPTERS } from '../content/chapters';
import type { ChapterId } from '../content/types';
import { openCloseUp } from '../engine/journey';
import { CloseUpFrame } from './CloseUpFrame';

gsap.registerPlugin(useGSAP);

/** How each print lies in the folder: a few degrees, never twice the same in a row. */
const TURNS = [-2.2, 1.4, -0.8, 2.4, -1.6, 0.9];

/** The most room a print takes in the folder, in rem. */
const WIDEST = 15;
const TALLEST = 14;

/**
 * The « Hors film » folder: what the Dossier holds that the Film does not show, sorted by
 * Chapter. Taking a print in hand opens it as any other; putting it down comes back here.
 */
export function BonusesCloseUp({ chapter }: { chapter: ChapterId }) {
  const folder = useRef<HTMLDivElement>(null);
  const here = useRef<HTMLElement>(null);
  const groups = CHAPTERS.map((entry) => ({ entry, bonuses: BONUSES.filter((bonus) => bonus.chapter === entry.id) })).filter((group) => group.bonuses.length > 0);

  // the folder opens at the Chapter being told (only the folder scrolls: scrollIntoView would move the page too)
  useEffect(() => {
    const box = folder.current;
    if (box && here.current) box.scrollTop += here.current.getBoundingClientRect().top - box.getBoundingClientRect().top;
  }, []);

  useGSAP(
    () => {
      gsap.fromTo('figure', { autoAlpha: 0, y: 26, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out', stagger: 0.05 });
    },
    { scope: folder },
  );

  return (
    <CloseUpFrame label="Documents hors film">
      <div className="pointer-events-none absolute inset-0 flex justify-center px-6 py-[6vh] [@media(max-height:520px)]:py-3">
        <section className="pointer-events-auto relative flex w-[min(62rem,94vw)] flex-col bg-[#b89a68] text-ink shadow-[0_30px_80px_rgb(0_0_0/0.7)]">
          <header className="border-b border-ink/25 px-9 pb-3 pt-6 [@media(max-height:520px)]:pb-2 [@media(max-height:520px)]:pt-3">
            <p className="typed text-[0.7rem] uppercase tracking-[0.24em] text-red-ink">Dossier André Schlegel</p>
            <h2 className="title-face mt-1 text-[1.9rem] leading-tight">Hors film</h2>
            <p className="mt-1 max-w-[62ch] text-[1.02rem] leading-snug text-ink/80 [@media(max-height:520px)]:hidden">
              Des documents et des photographies du dossier qu’Éric Lemoine n’a pas montrés dans son film. Ils sont rangés ici, à côté du chapitre auquel ils se rapportent.
            </p>
          </header>
          <div ref={folder} className="min-h-0 flex-1 overflow-y-auto px-9 pb-8 pt-2">
            {groups.map(({ entry, bonuses }) => (
              <section key={entry.id} ref={entry.id === chapter ? here : undefined} className="pt-5">
                <h3 className="flex items-baseline gap-3 border-b border-ink/25 pb-1">
                  <span className="typed text-[0.7rem] uppercase tracking-[0.2em] text-red-ink">{entry.number ? `Chapitre ${entry.number}` : 'Avant le premier chapitre'}</span>
                  <span className="title-face text-[1.25rem]">{entry.title}</span>
                  {entry.id === chapter && <span className="typed ml-auto text-[0.68rem] uppercase tracking-[0.16em] text-ink/70">chapitre en cours</span>}
                </h3>
                <div className="mt-4 flex flex-wrap items-start gap-x-7 gap-y-6">
                  {bonuses.map((bonus, index) => (
                    <figure key={bonus.id} className="invisible w-[min(15.5rem,40vw)]">
                      <button
                        type="button"
                        onClick={() => openCloseUp({ kind: 'bonuses', id: bonus.id })}
                        aria-label={`Prendre en main : ${bonus.legend}`}
                        className={`block cursor-zoom-in shadow-[0_8px_22px_rgb(0_0_0/0.45)] transition-transform duration-300 ease-out hover:z-10 hover:scale-[1.05] hover:rotate-0! focus-visible:scale-[1.05] focus-visible:rotate-0! ${
                          bonus.paper === 'photo' ? 'bg-[#f4f0e6] p-[0.35rem]' : ''
                        }`}
                        style={{ rotate: `${TURNS[index % TURNS.length]}deg` }}
                      >
                        {/* sized from the picture's proportions, so the folder does not shift as the pictures arrive */}
                        <img
                          src={bonus.small}
                          alt=""
                          draggable={false}
                          className="block h-auto max-w-full select-none"
                          style={{ width: `${bonus.size[0] * Math.min(WIDEST / bonus.size[0], TALLEST / bonus.size[1])}rem`, aspectRatio: `${bonus.size[0]} / ${bonus.size[1]}` }}
                        />
                      </button>
                      <figcaption className="mt-3 text-[0.92rem] leading-snug text-ink/90">{bonus.legend}</figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </CloseUpFrame>
  );
}
