import { useEffect, useRef } from 'react';
import type { ChapterContent } from '../content/types';
import { lastAtOrBefore } from '../engine/cues';
import { closeCloseUp, getClock, seek } from '../engine/journey';
import { useJourney } from '../engine/store';
import { CloseUpFrame } from './CloseUpFrame';

/** The whole text of the Chapter. Choosing a phrase takes the Narration there. */
export function TextCloseUp({ content }: { content: ChapterContent }) {
  const { chapter, phrases } = content;
  const now = Math.max(0, lastAtOrBefore(phrases, getClock().time, (phrase) => phrase.start));
  const current = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    current.current?.scrollIntoView({ block: 'center' });
  }, []);

  const go = (start: number) => {
    seek(start);
    // choosing a phrase is asking to hear it
    useJourney.setState({ resumeOnClose: true });
    closeCloseUp();
  };

  return (
    <CloseUpFrame label={`Texte du chapitre : ${chapter.title}`}>
      <div className="pointer-events-none absolute inset-0 flex justify-center px-6 py-[7vh]">
        <article className="pointer-events-auto relative flex w-[min(46rem,92vw)] flex-col bg-paper text-ink shadow-[0_30px_80px_rgb(0_0_0/0.7)]">
          <header className="border-b border-ink/20 px-10 pb-4 pt-8">
            <p className="typed text-[0.7rem] uppercase tracking-[0.24em] text-red-ink">{chapter.number ? `Chapitre ${chapter.number}` : 'Avant le premier chapitre'}</p>
            <h2 className="title-face mt-1 text-[2.1rem] leading-tight">{chapter.title}</h2>
            {chapter.dates && <p className="typed mt-1 text-[0.82rem] text-ink-soft">{chapter.dates}</p>}
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-10 py-6 text-[1.28rem] leading-[1.7]">
            <p>
              {phrases.map((phrase, index) => (
                <button
                  key={phrase.start}
                  ref={index === now ? current : undefined}
                  type="button"
                  onClick={() => go(phrase.start)}
                  className={`inline rounded-[2px] text-left transition-colors hover:bg-red-ink/15 ${index === now ? 'bg-lamp/60' : ''}`}
                >
                  {phrase.text}{' '}
                </button>
              ))}
            </p>
          </div>
          <footer className="typed border-t border-ink/20 px-10 py-3 text-[0.72rem] text-ink-soft">
            Récit d’Éric Lemoine, tel qu’il le dit dans le film. Choisir une phrase reprend l’écoute à cet endroit.
          </footer>
        </article>
      </div>
    </CloseUpFrame>
  );
}
