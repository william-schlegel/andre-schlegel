import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { CHAPTERS, nextChapter } from '../content/chapters';
import type { ChapterId } from '../content/types';
import { backToIntroduction, openChapters } from '../engine/journey';

gsap.registerPlugin(useGSAP);

/**
 * Where the Journey stops today. While Chapters are still being built, the card says which
 * one comes next; once the last Chapter is there it closes the Journey.
 */
export function EndCard({ chapter }: { chapter: ChapterId }) {
  const veil = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const next = nextChapter(chapter);
  const unfinished = CHAPTERS.some((item) => !item.ready);

  useGSAP(
    () => {
      // the last table is left in sight a moment before the card is laid over it
      gsap.fromTo(veil.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: 'power1.out', delay: unfinished ? 0 : 1.2 });
      gsap.fromTo(card.current, { autoAlpha: 0, y: 30, rotate: 2 }, { autoAlpha: 1, y: 0, rotate: -0.6, duration: 0.9, ease: 'power3.out', delay: unfinished ? 0.4 : 1.6 });
    },
    { scope: veil },
  );

  return (
    <div ref={veil} className="invisible absolute inset-0 z-10 flex items-center justify-center bg-night/55 backdrop-blur-[3px]">
      <div ref={card} className="invisible w-[min(38rem,90vw)] bg-paper px-10 py-9 text-center text-ink shadow-[0_30px_80px_rgb(0_0_0/0.7)]">
        {unfinished && next ? (
          <>
            <p className="typed text-[0.7rem] uppercase tracking-[0.24em] text-red-ink">À suivre</p>
            <h2 className="title-face mt-2 text-[2rem] leading-tight">
              Chapitre {next.number} · {next.title}
            </h2>
            <p className="typed mt-1 text-[0.82rem] text-ink-soft">{next.dates}</p>
            <p className="mt-5 text-[1.15rem] leading-snug">
              La suite du récit est en préparation : les chapitres suivants seront ajoutés ici, l’un après l’autre.
            </p>
          </>
        ) : (
          <>
            <p className="typed text-[0.7rem] uppercase tracking-[0.24em] text-red-ink">Fin du récit</p>
            <h2 className="title-face mt-2 text-[2rem] leading-tight">Commandant André Schlegel</h2>
            <p className="typed mt-1 text-[0.82rem] text-ink-soft">1914 – 1962</p>
            <p className="mt-5 text-[1.15rem] leading-snug">
              Navigateur de bombardier au groupe « Tunisie », « mort pour la France ». Son parcours est raconté par son petit-fils, Éric
              Lemoine, à partir de ses carnets de vol.
            </p>
          </>
        )}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={openChapters} className="typed shrink-0 whitespace-nowrap border border-ink/50 px-4 py-2 text-[0.78rem] uppercase tracking-[0.14em] transition hover:bg-ink hover:text-paper">
            Revoir un chapitre
          </button>
          <button type="button" onClick={backToIntroduction} className="typed shrink-0 whitespace-nowrap border border-ink/50 px-4 py-2 text-[0.78rem] uppercase tracking-[0.14em] transition hover:bg-ink hover:text-paper">
            Refermer le carnet
          </button>
          <a href="/sources" className="typed shrink-0 whitespace-nowrap border border-ink/50 px-4 py-2 text-[0.78rem] uppercase tracking-[0.14em] text-ink no-underline transition hover:bg-ink hover:text-paper">
            Sources
          </a>
        </div>
      </div>
    </div>
  );
}
