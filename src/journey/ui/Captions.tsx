import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import type { Phrase } from '../content/types';
import { phraseIndexAt } from '../engine/cues';
import { useNarration } from '../engine/journey';

gsap.registerPlugin(useGSAP);

/** Eric's words, phrase by phrase, as he says them. */
export function Captions({ phrases }: { phrases: Phrase[] }) {
  const index = useNarration((time) => phraseIndexAt(phrases, time));
  const line = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (index < 0 || !line.current) return;
      gsap.fromTo(line.current, { autoAlpha: 0, y: 8, filter: 'blur(3px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.32, ease: 'power2.out' });
    },
    { dependencies: [index] },
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[5.6rem] flex justify-center px-[8vw]" aria-live="off">
      {index >= 0 && (
        <p ref={line} key={index} className="caption-text max-w-[52ch] px-[3.5em] py-[0.5em] text-center text-paper-light [background:radial-gradient(closest-side,rgb(0_0_0/0.66),rgb(0_0_0/0.5)_55%,transparent)]">
          {phrases[index].text}
        </p>
      )}
    </div>
  );
}
