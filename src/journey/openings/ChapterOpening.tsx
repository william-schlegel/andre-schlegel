import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import { chartFrame, chartSpot, chartState, preloadSheet } from '../chart/Chart';
import type { ChapterContent } from '../content/types';
import { finishOpening } from '../engine/journey';
import { SCENES } from '../scenes';
import { playChapterMusic } from '../sound/music';
import { playSound } from '../sound/sounds';
import { lookAt, shotOn } from '../stage/shot';
import { postingArrival, PostingSheet } from '../ui/PostingCard';

gsap.registerPlugin(useGSAP);

/**
 * A Chapter opening: the Narration waits while the light changes, the Chart is unrolled, the
 * new place is inked on it and the Posting is typed on its card. It shows only what is
 * attested (the place, the Posting and its dates) and can be skipped.
 */
export function ChapterOpening({ content }: { content: ChapterContent }) {
  const { chapter } = content;
  const scene = SCENES[chapter.id]!;
  const posting = content.postings[0];
  const root = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  const finish = (played = false) => {
    if (done.current) return;
    done.current = true;
    chartState.unrolled = 1;
    chartState.inked = 1;
    // played to its end, the card is already in its corner
    postingArrival.quiet = played && !!posting;
    finishOpening();
  };

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        finish();
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(
    () => {
      const aspect = window.innerWidth / window.innerHeight;
      const opening = scene.opening;
      if (opening) preloadSheet(opening.sheet);
      chartState.unrolled = 0;
      chartState.inked = 0;
      lookAt(scene.wide, true);
      const fadeMusic = playChapterMusic(chapter.id);

      const keys = gsap.utils.toArray<HTMLElement>('[data-key]');
      const timeline = gsap.timeline({ onComplete: () => finish(true) });

      // ----- the Chapter's name -----
      timeline
        .set('[data-open="veil"]', { autoAlpha: 1 })
        .to('[data-open="veil"]', { autoAlpha: 0.35, duration: 1.6, ease: 'power1.inOut' }, 0)
        .fromTo('[data-open="number"]', { autoAlpha: 0, letterSpacing: '1em' }, { autoAlpha: 1, letterSpacing: '0.45em', duration: 1.1, ease: 'power2.out' }, 0.25)
        .fromTo(
          '[data-open="letter"]',
          { autoAlpha: 0, y: 40, rotateX: -70 },
          { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.9, ease: 'back.out(1.4)', stagger: 0.07 },
          0.45,
        )
        .fromTo('[data-open="rule"]', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 0.9)
        .fromTo('[data-open="dates"]', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 1.2)
        .to('[data-open="title"]', { autoAlpha: 0, y: -30, filter: 'blur(6px)', duration: 0.7, ease: 'power2.in' }, 2.6)
        .to('[data-open="veil"]', { autoAlpha: 0, duration: 0.9 }, 2.6);

      // ----- the Chart: unrolled, then the place inked -----
      if (opening) {
        timeline
          .call(() => lookAt(shotOn(chartFrame(opening.sheet, opening.place), aspect, 16, 0.94)), undefined, 2.3)
          .call(() => playSound('unroll'), undefined, 2.9)
          .to(chartState, { unrolled: 1, duration: 1.7, ease: 'power2.inOut' }, 2.9)
          .call(() => lookAt(shotOn(chartSpot(opening.sheet, opening.place, opening.post, 0.4), aspect, 14)), undefined, 4.5)
          .to(chartState, { inked: 1, duration: 1.3, ease: 'power1.inOut' }, 5.0);
      }

      // ----- the Posting, typed on its card, then stamped -----
      if (posting) {
        const typing = 1.9;
        timeline
          .set(keys, { autoAlpha: 0 })
          .fromTo('[data-open="card"]', { autoAlpha: 0, y: 80, rotate: 5 }, { autoAlpha: 1, y: 0, rotate: -1.5, duration: 0.6, ease: 'power3.out' }, 5.9)
          .to(keys, { autoAlpha: 1, duration: 0.01, stagger: { each: typing / Math.max(1, keys.length), onStart: () => Math.random() < 0.6 && playSound('key') } }, 6.4)
          .fromTo(
            '[data-open="stamp"]',
            { autoAlpha: 0, scale: 2.6, rotate: -28 },
            { autoAlpha: 0.86, scale: 1, rotate: -11, duration: 0.16, ease: 'power4.in', onComplete: () => playSound('stamp') },
            6.4 + typing + 0.25,
          )
          .fromTo('[data-open="card"]', { x: 0 }, { x: 3, duration: 0.04, yoyo: true, repeat: 3 }, 6.4 + typing + 0.41)
          // the card goes to the corner where it will stay during the Scene
          .to(
            '[data-open="card"]',
            {
              duration: 0.8,
              ease: 'power3.inOut',
              x: () => {
                const box = root.current!.querySelector<HTMLElement>('[data-open="card"]')!.getBoundingClientRect();
                return 20 - box.left - (box.width * (1 - 0.86)) / 2;
              },
              y: () => {
                const box = root.current!.querySelector<HTMLElement>('[data-open="card"]')!.getBoundingClientRect();
                return 20 - box.top - (box.height * (1 - 0.86)) / 2;
              },
              scale: 0.86,
              rotate: -1.6,
            },
            6.4 + typing + 1.25,
          )
          .to('[data-open="stamp"]', { autoAlpha: 0, duration: 0.5 }, 6.4 + typing + 1.4);
      } else {
        timeline.to({}, { duration: 0.8 }, 6.4);
      }
      timeline.call(fadeMusic, undefined, '-=0.6').to('[data-open="skip"]', { autoAlpha: 0, duration: 0.3 }, '-=0.4');

      return () => {
        timeline.kill();
        fadeMusic();
        chartState.unrolled = 1;
        chartState.inked = 1;
      };
    },
    { scope: root },
  );

  const stampDate = posting?.dates.split(' – ')[0] ?? '';

  return (
    <div ref={root} className="absolute inset-0 z-10 overflow-hidden">
      <div data-open="veil" className="invisible absolute inset-0 bg-night" />

      <div data-open="title" className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center [perspective:900px]">
        <p data-open="number" className="typed invisible text-[clamp(0.8rem,0.6rem+0.6vw,1.1rem)] uppercase tracking-[0.45em] text-lamp">
          Chapitre {chapter.number}
        </p>
        <h2 className="title-face mt-2 text-[clamp(3.5rem,1.5rem+9vw,10rem)] leading-none text-paper-light [text-shadow:0_4px_40px_rgb(0_0_0/0.9)]" aria-label={chapter.title}>
          {chapter.title.split('').map((letter, index) => (
            <span key={index} data-open="letter" aria-hidden="true" className="invisible inline-block whitespace-pre [transform-origin:50%_100%]">
              {letter}
            </span>
          ))}
        </h2>
        <div data-open="rule" className="mt-5 h-px w-[min(30rem,60vw)] bg-gradient-to-r from-transparent via-lamp to-transparent" />
        <p data-open="dates" className="typed invisible mt-5 text-[clamp(1rem,0.7rem+1vw,1.6rem)] tracking-[0.2em] text-paper/90">
          {chapter.dates}
        </p>
      </div>

      {posting && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[9vh] flex justify-center">
          <div data-open="card" className="invisible relative">
            <PostingSheet chapter={chapter} posting={posting} typed />
            <div data-open="stamp" className="typed invisible absolute bottom-3 right-3 border-[3px] border-double border-stamp px-2 py-1 text-center text-[0.62rem] uppercase leading-tight tracking-[0.12em] text-stamp">
              Affecté le
              <br />
              <span className="text-[0.78rem]">{stampDate}</span>
            </div>
          </div>
        </div>
      )}

      <button
        data-open="skip"
        type="button"
        onClick={() => finish()}
        className="typed absolute bottom-5 right-5 rounded-sm border border-paper/30 bg-night/60 px-4 py-2 text-[0.74rem] uppercase tracking-[0.16em] text-paper/85 backdrop-blur-sm transition hover:border-lamp hover:text-lamp"
      >
        Passer ›
      </button>
    </div>
  );
}
