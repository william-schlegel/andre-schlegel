import type { ChapterContent } from '../content/types';
import { lastAtOrBefore } from '../engine/cues';
import { seek, useNarration } from '../engine/journey';

/**
 * The steps of what the Chapter tells in order, typed on a slip beside the Scene: those told
 * fade, the one being told is marked. Each is a way to go straight to it. Where
 * the screen is too narrow for the slip, the Timeline's marks say the same.
 */
export function MissionPhases({ phases }: { phases: NonNullable<ChapterContent['phases']> }) {
  const { title, from, until, steps } = phases;
  const state = useNarration((time) => (time < from || time >= until ? -2 : lastAtOrBefore(steps, time, (step) => step.at)));
  if (state === -2) return null;

  return (
    <nav
      aria-label={title}
      className="absolute right-4 top-1/2 hidden w-[min(15.5rem,17.5vw)] -translate-y-[54%] rounded-sm bg-night/55 px-3 pb-2 pt-[0.6rem] backdrop-blur-[3px] [@media(min-aspect-ratio:8/5)]:block"
    >
      <p className="typed mb-2 border-b border-lamp/40 pb-1 text-[0.62rem] uppercase tracking-[0.22em] text-lamp/90">{title}</p>
      <ol className="space-y-[0.12rem]">
        {steps.map((step, index) => {
          const told = index < state;
          const now = index === state;
          return (
            <li key={step.at}>
              <button
                type="button"
                onClick={() => seek(step.at)}
                aria-current={now ? 'step' : undefined}
                className={`typed group flex w-full items-baseline gap-2 py-[0.14rem] text-left text-[0.7rem] leading-snug tracking-[0.03em] transition [text-shadow:0_1px_8px_rgb(0_0_0/0.95)] ${
                  now ? 'text-lamp' : told ? 'text-paper/35 hover:text-paper/80' : 'text-paper/75 hover:text-paper'
                }`}
              >
                <span className={`w-[1.5em] shrink-0 text-right tabular-nums ${now ? 'text-lamp' : 'text-paper/35'}`}>{String(index + 1).padStart(2, '0')}</span>
                <span className="relative">
                  {step.label}
                  {now && <span className="absolute -left-[0.1em] -right-[0.1em] -bottom-[0.12em] h-px origin-left animate-[phase-underline_0.5s_ease-out] bg-lamp/80" />}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
