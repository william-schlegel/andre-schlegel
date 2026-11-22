import type { Cue, ProjectionCue } from '../content/types';
import { useNarration } from '../engine/journey';

/** While an Archive film is projected: what it is, and whose it is. */
export function FilmCredit({ cues }: { cues: Cue[] }) {
  const film = useNarration((time) => cues.find((cue): cue is ProjectionCue => cue.kind === 'projection' && cue.starts <= time && time < cue.until) ?? null);
  if (!film) return null;
  return (
    <div className="pointer-events-none absolute bottom-[4.6rem] left-5 w-[min(19rem,26vw)]">
      <p className="typed text-[0.66rem] leading-relaxed tracking-[0.06em] text-paper/65 [text-shadow:0_1px_8px_rgb(0_0_0/0.95)]">
        <span className="uppercase tracking-[0.22em] text-lamp/90">Film d’archives</span>
        <br />
        {film.legend}
        <br />
        {film.source}
      </p>
    </div>
  );
}
