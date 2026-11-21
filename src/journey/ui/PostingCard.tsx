import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import type { Chapter, Posting } from '../content/types';
import { postingAt } from '../engine/cues';
import { useNarration } from '../engine/journey';

gsap.registerPlugin(useGSAP);

/** The typed card itself: also used, larger, by the Chapter openings. */
export function PostingSheet({ chapter, posting, typed }: { chapter: Chapter; posting: Posting; typed?: boolean }) {
  // `typed`: every character is its own span, so that a Chapter opening can strike them one by one
  const line = (text: string) =>
    typed
      ? text.split('').map((character, index) => (
          <span key={index} data-key className="whitespace-pre">
            {character}
          </span>
        ))
      : text;

  return (
    <div className="relative w-[19.5rem] bg-paper px-5 pb-4 pt-3 text-ink shadow-[0_10px_30px_rgb(0_0_0/0.55)] [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_1.45rem,rgb(60_90_140/0.16)_1.45rem,rgb(60_90_140/0.16)_calc(1.45rem+1px))]">
      <div className="flex items-baseline justify-between border-b border-red-ink/60 pb-1">
        <span className="title-face text-[1.02rem] tracking-wide">
          {chapter.number ? `Chapitre ${chapter.number}` : ''} · {chapter.title}
        </span>
        <span className="typed text-[0.62rem] uppercase tracking-[0.2em] text-red-ink">Affectation</span>
      </div>
      <dl className="typed mt-2 grid grid-cols-[auto_1fr] gap-x-3 text-[0.8rem] leading-[1.45rem]">
        <dt className="text-ink-soft">Grade</dt>
        <dd>{line(posting.rank)}</dd>
        <dt className="text-ink-soft">Base</dt>
        <dd>{line(posting.base)}</dd>
        <dt className="text-ink-soft">Unité</dt>
        <dd>{line(posting.unit)}</dd>
        <dt className="text-ink-soft">Dates</dt>
        <dd>{line(posting.dates)}</dd>
      </dl>
    </div>
  );
}

/** A Chapter opening has just brought the card to its corner: it is already there, it does not arrive again. */
export const postingArrival = { quiet: false };

/** Where André is serving, in the corner of the Scene. */
export function PostingCard({ chapter, postings }: { chapter: Chapter; postings: Posting[] }) {
  const posting = useNarration((time) => postingAt(postings, time));
  const card = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!posting || !card.current) return;
      if (postingArrival.quiet) {
        postingArrival.quiet = false;
        gsap.set(card.current, { autoAlpha: 1, rotate: -1.6 });
        return;
      }
      gsap.fromTo(card.current, { autoAlpha: 0, y: -14, rotate: -5 }, { autoAlpha: 1, y: 0, rotate: -1.6, duration: 0.7, ease: 'back.out(1.6)' });
    },
    { dependencies: [posting] },
  );

  if (!posting) {
    return (
      <div className="pointer-events-none absolute left-5 top-4">
        <p className="title-face text-[1.05rem] tracking-wide text-paper/80 [text-shadow:0_1px_10px_rgb(0_0_0/0.9)]">Commandant André Schlegel</p>
        <p className="typed text-[0.68rem] uppercase tracking-[0.22em] text-lamp/70">{chapter.title}</p>
      </div>
    );
  }

  return (
    <div id="posting-corner" ref={card} className="pointer-events-none invisible absolute left-5 top-5 origin-top-left scale-[0.86]">
      <PostingSheet chapter={chapter} posting={posting} />
    </div>
  );
}
