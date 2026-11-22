import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { formatTime } from '../engine/cues';
import { openChapters, savedPlace } from '../engine/journey';
import { playSound } from '../sound/sounds';
import { lampFlicker } from '../stage/Light';

gsap.registerPlugin(useGSAP);

interface IntroductionProps {
  /** The Introduction is what the visitor is looking at (and not yet the Journey). */
  active: boolean;
  onLamp: (on: boolean) => void;
  onBegin: () => void;
  onResume: (time: number) => void;
}

/**
 * The Introduction: the room is dark, the lamp comes on over the table, and the title is set
 * above the closed Carnet. Opening the Carnet begins the Journey.
 */
export function Introduction({ active, onLamp, onBegin, onResume }: IntroductionProps) {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(!active);
  const [place, setPlace] = useState<ReturnType<typeof savedPlace>>(null);

  useEffect(() => {
    if (active) {
      setGone(false);
      setPlace(savedPlace());
    }
  }, [active]);

  useGSAP(
    () => {
      if (gone) return;
      if (!active) {
        gsap.to(root.current, { autoAlpha: 0, duration: 0.7, ease: 'power1.in', onComplete: () => setGone(true) });
        return;
      }
      onLamp(false);
      const timeline = gsap.timeline();
      timeline
        .set(root.current, { autoAlpha: 1 })
        .set('[data-intro]', { autoAlpha: 0 })
        .call(
          () => {
            lampFlicker.until = performance.now() + 520;
            onLamp(true);
            playSound('lamp');
          },
          undefined,
          0.9,
        )
        .fromTo('[data-intro="rank"]', { autoAlpha: 0, letterSpacing: '0.9em' }, { autoAlpha: 1, letterSpacing: '0.42em', duration: 1.6, ease: 'power2.out' }, 2.3)
        .fromTo(
          '[data-intro="letter"]',
          { autoAlpha: 0, y: 18, filter: 'blur(6px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', stagger: 0.045 },
          2.6,
        )
        .fromTo('[data-intro="rule"]', { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 3.5)
        .fromTo('[data-intro="line"]', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out', stagger: 0.25 }, 3.8)
        .fromTo('[data-intro="start"]', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out', stagger: 0.15 }, 4.7);
      return () => void timeline.kill();
    },
    { dependencies: [active, gone], scope: root },
  );

  if (gone) return null;

  const name = 'André Schlegel';

  return (
    <div ref={root} className="pointer-events-none invisible absolute inset-0 flex flex-col items-center justify-between py-[4.5vh] text-center">
      <header className="flex flex-col items-center">
        <p data-intro="rank" className="typed text-[clamp(0.7rem,0.5rem+0.5vw,0.95rem)] uppercase tracking-[0.42em] text-lamp/85">
          Commandant
        </p>
        <h1 className="title-face mt-1 text-[clamp(2.6rem,1.2rem+5.2vw,6.2rem)] leading-none text-paper-light [text-shadow:0_2px_30px_rgb(0_0_0/0.9)]" aria-label={name}>
          {name.split('').map((letter, index) => (
            <span key={index} data-intro="letter" aria-hidden="true" className="inline-block whitespace-pre">
              {letter}
            </span>
          ))}
        </h1>
        <div data-intro="rule" className="mt-4 h-px w-[min(26rem,50vw)] bg-gradient-to-r from-transparent via-lamp/70 to-transparent" />
        <p data-intro="line" className="mt-4 text-[clamp(1rem,0.7rem+0.8vw,1.45rem)] italic text-paper/90 [text-shadow:0_1px_12px_rgb(0_0_0/0.9)]">
          Carrière militaire et aéronautique, 1935 – 1962
        </p>
        <p data-intro="line" className="mt-1 text-[clamp(0.85rem,0.65rem+0.5vw,1.1rem)] text-paper/65 [text-shadow:0_1px_12px_rgb(0_0_0/0.9)]">
          racontée par son petit-fils Éric Lemoine, d’après ses carnets de vol
        </p>
      </header>

      <footer className="flex flex-col items-center gap-3">
        <button
          data-intro="start"
          type="button"
          onClick={onBegin}
          className="pointer-events-auto group relative rounded-sm border border-lamp/60 bg-night/55 px-8 py-3 backdrop-blur-sm transition duration-300 hover:border-lamp hover:bg-lamp/10"
        >
          <span className="title-face text-[clamp(1.05rem,0.8rem+0.7vw,1.5rem)] tracking-wide text-paper-light">Ouvrir le carnet</span>
          <span className="absolute inset-x-6 -bottom-px h-px origin-center scale-x-0 bg-lamp transition duration-500 group-hover:scale-x-100" />
        </button>
        {place && (
          <div data-intro="start" className="pointer-events-auto flex items-center gap-5">
            <button type="button" onClick={() => onResume(place.time)} className="typed text-[0.8rem] text-lamp/90 underline decoration-lamp/40 underline-offset-4 transition hover:text-lamp">
              Reprendre : {place.chapter.number ? `chapitre ${place.chapter.number} · ` : ''}
              {place.chapter.title} — {formatTime(place.time)}
            </button>
            <button type="button" onClick={openChapters} className="typed text-[0.8rem] text-paper/70 underline decoration-paper/30 underline-offset-4 transition hover:text-paper">
              Choisir un chapitre
            </button>
          </div>
        )}
        <p data-intro="start" className="typed text-[0.72rem] tracking-wider text-paper/55">
          Un récit de 55 minutes · à écouter avec le son
        </p>
      </footer>
    </div>
  );
}
