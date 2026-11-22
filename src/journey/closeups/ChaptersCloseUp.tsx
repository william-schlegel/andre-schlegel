import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { CHAPTERS } from '../content/chapters';
import type { ChapterId } from '../content/types';
import { formatTime } from '../engine/cues';
import { useJourney } from '../engine/store';
import { CloseUpFrame } from './CloseUpFrame';

gsap.registerPlugin(useGSAP);

/** The list of Chapters, as a table of contents: any Chapter that is built can be reached. */
export function ChaptersCloseUp({ onChoose }: { onChoose: (id: ChapterId) => void }) {
  const current = useJourney((state) => state.chapter);
  const phase = useJourney((state) => state.phase);
  const list = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      gsap.fromTo('li', { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power2.out', stagger: 0.04 });
    },
    { scope: list },
  );

  return (
    <CloseUpFrame label="Chapitres">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 py-[6vh]">
        <section className="pointer-events-auto flex max-h-full w-[min(40rem,92vw)] flex-col bg-paper text-ink shadow-[0_30px_80px_rgb(0_0_0/0.7)]">
          <header className="border-b border-ink/20 px-9 pb-3 pt-7">
            <p className="typed text-[0.7rem] uppercase tracking-[0.24em] text-red-ink">Commandant André Schlegel</p>
            <h2 className="title-face mt-1 text-[1.9rem] leading-tight">Chapitres</h2>
          </header>
          <ol ref={list} className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
            {CHAPTERS.map((chapter) => {
              const here = phase !== 'introduction' && chapter.id === current;
              return (
                <li key={chapter.id}>
                  <button
                    type="button"
                    disabled={!chapter.ready}
                    onClick={() => onChoose(chapter.id)}
                    className={`group grid w-full grid-cols-[2.4rem_1fr_auto] items-baseline gap-x-3 rounded-[2px] px-4 py-[0.55rem] text-left transition-colors ${
                      chapter.ready ? 'hover:bg-red-ink/10' : 'cursor-default opacity-45'
                    } ${here ? 'bg-lamp/45' : ''}`}
                  >
                    <span className="title-face text-[1.5rem] text-red-ink">{chapter.number ?? '·'}</span>
                    <span>
                      <span className="title-face text-[1.3rem]">{chapter.title}</span>
                      {chapter.dates && <span className="typed ml-3 text-[0.78rem] text-ink-soft">{chapter.dates}</span>}
                    </span>
                    <span className="typed text-[0.74rem] text-ink-soft">{chapter.ready ? formatTime(chapter.end - chapter.start) : 'en préparation'}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </CloseUpFrame>
  );
}
