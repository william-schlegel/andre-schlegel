import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import type { TypedCue } from '../content/types';
import { CloseUpFrame } from './CloseUpFrame';

/** A citation taken in hand: the whole text, to be read at leisure. */
export function TypedCloseUp({ sheet }: { sheet: TypedCue }) {
  const paper = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(paper.current, { y: 40, rotate: -2, scale: 0.92 }, { y: 0, rotate: 0, scale: 1, duration: 0.6, ease: 'power3.out' });
  });

  return (
    <CloseUpFrame label={sheet.legend}>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 pb-6 pt-14">
        <div
          ref={paper}
          className="typed pointer-events-auto max-h-[74vh] w-[min(46rem,90vw)] select-text overflow-y-auto bg-paper px-[clamp(1.5rem,5vw,4rem)] py-[clamp(1.5rem,4vw,3rem)] text-ink shadow-[0_30px_80px_rgb(0_0_0/0.7)]"
        >
          <div className="text-center">
            {sheet.heading.map((line, index) => (
              <p key={index} className={index === 0 ? 'text-[1.5rem] tracking-[0.08em]' : 'mt-1 text-[1rem]'}>
                {line}
              </p>
            ))}
            <div className="mx-auto mt-4 h-px w-40 bg-ink/70" />
          </div>
          <p className="mt-7 whitespace-pre-line text-[clamp(1rem,0.85rem+0.5vw,1.25rem)] leading-[1.75]">{sheet.text}</p>
        </div>
        <div className="pointer-events-auto max-w-[70ch] text-center">
          <p className="text-[clamp(1.05rem,0.8rem+0.6vw,1.4rem)] text-paper-light">{sheet.legend}</p>
          <p className="typed mt-1 text-[0.74rem] tracking-wide text-paper/60">{sheet.source}</p>
        </div>
      </div>
    </CloseUpFrame>
  );
}
