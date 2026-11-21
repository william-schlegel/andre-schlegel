import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { CHAPTERS, reachableEnd } from '../content/chapters';
import type { ChapterId, TimelineMark } from '../content/types';
import { formatTime } from '../engine/cues';
import { getClock, seek, togglePlay, useNarration } from '../engine/journey';
import { useJourney } from '../engine/store';
import { layoutTimeline, positionOf, timeAt } from '../engine/timeline';

/**
 * The Timeline: the Narration from left to right, divided into Chapters, with the story's
 * dates written under the Chapter being told. Click or drag to move in it.
 */
export function Timeline({ chapter, marks }: { chapter: ChapterId; marks: TimelineMark[] }) {
  const playing = useJourney((state) => state.playing);
  const segments = useMemo(() => layoutTimeline(CHAPTERS, chapter), [chapter]);
  const reachable = reachableEnd();
  const bar = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  // ten steps per second is plenty for a playhead
  const time = useNarration((t) => Math.round(t * 10) / 10);
  const position = positionOf(segments, time);
  const nearestMark = useNarration((t) => {
    let found: TimelineMark | null = null;
    for (const mark of marks) if (mark.at <= t + 0.2) found = mark;
    return found;
  });

  const timeUnder = (event: ReactPointerEvent | PointerEvent): number => {
    const rect = bar.current!.getBoundingClientRect();
    return timeAt(segments, (event.clientX - rect.left) / rect.width);
  };

  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    seek(Math.min(timeUnder(event), reachable - 0.5));
  };
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    const under = timeUnder(event);
    setHover(under);
    if (dragging) seek(Math.min(under, reachable - 0.5));
  };
  const up = () => setDragging(false);

  const hoverChapter = hover === null ? null : CHAPTERS.find((c) => hover < c.end) ?? null;
  const hoverReachable = hover !== null && hover < reachable;

  return (
    <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 px-5 pb-3 pt-10 [background:linear-gradient(to_top,rgb(0_0_0/0.72),transparent)]">
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? 'Mettre la narration en pause' : 'Reprendre la narration'}
        className="mb-[0.35rem] grid h-10 w-10 shrink-0 place-items-center rounded-full border border-paper/40 text-paper transition hover:border-lamp hover:text-lamp"
      >
        {playing ? (
          <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
            <rect x="1" y="1" width="4" height="14" fill="currentColor" />
            <rect x="9" y="1" width="4" height="14" fill="currentColor" />
          </svg>
        ) : (
          <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
            <path d="M2 1 L13 8 L2 15 Z" fill="currentColor" />
          </svg>
        )}
      </button>

      <div className="relative min-w-0 flex-1">
        {/* the story's dates, above the Chapter being told */}
        <div className="pointer-events-none relative h-5">
          {nearestMark && (
            <span
              key={nearestMark.at}
              className="typed absolute bottom-0 -translate-x-1/2 whitespace-nowrap text-[0.72rem] text-lamp/90"
              style={{ left: `clamp(4rem, ${positionOf(segments, nearestMark.at) * 100}%, calc(100% - 4rem))` }}
            >
              {nearestMark.label}
            </span>
          )}
        </div>

        <div
          ref={bar}
          role="slider"
          tabIndex={0}
          aria-label="Avancement de la narration"
          aria-valuemin={0}
          aria-valuemax={Math.round(reachable)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={formatTime(time)}
          className="relative h-6 cursor-pointer touch-none"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={() => setHover(null)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') seek(getClock().time + 5);
            if (event.key === 'ArrowLeft') seek(getClock().time - 5);
          }}
        >
          {segments.map(({ chapter: item, left, width }) => (
            <div key={item.id} className="absolute top-[0.6rem] h-[3px]" style={{ left: `calc(${left * 100}% + 2px)`, width: `calc(${width * 100}% - 4px)` }}>
              <div className={`h-full rounded-full ${item.ready ? 'bg-paper/35' : 'bg-paper/12'}`} />
            </div>
          ))}
          {/* what has been told */}
          {segments.map(({ chapter: item, left, width }) => {
            const told = Math.min(1, Math.max(0, (time - item.start) / (item.end - item.start)));
            if (told <= 0) return null;
            return (
              <div
                key={item.id}
                className="absolute top-[0.6rem] h-[3px] rounded-full bg-lamp"
                style={{ left: `calc(${left * 100}% + 2px)`, width: `calc(${width * told * 100}% - ${told >= 1 ? 4 : 2}px)` }}
              />
            );
          })}
          {/* the dates of the Chapter being told */}
          {marks.map((mark) => (
            <div
              key={mark.at}
              className={`absolute top-[0.35rem] h-[11px] w-px ${mark.at <= time ? 'bg-lamp' : 'bg-paper/50'}`}
              style={{ left: `${positionOf(segments, mark.at) * 100}%` }}
              title={mark.label}
            />
          ))}
          <div
            className="absolute top-[0.2rem] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-lamp bg-night shadow-[0_0_12px_rgb(255_217_160/0.7)]"
            style={{ left: `${position * 100}%` }}
          />
          {hover !== null && hoverChapter && (
            <div
              className="typed pointer-events-none absolute bottom-7 -translate-x-1/2 whitespace-nowrap rounded-sm bg-paper px-2 py-1 text-[0.72rem] text-ink shadow-lg"
              style={{ left: `clamp(5rem, ${positionOf(segments, hover) * 100}%, calc(100% - 5rem))` }}
            >
              {hoverChapter.title}
              {hoverReachable ? ` · ${formatTime(hover)}` : ' · à venir'}
            </div>
          )}
        </div>

        {/* the Chapters' names */}
        <div className="pointer-events-none relative h-4">
          {segments.map(({ chapter: item, left, width }) => (
            <span
              key={item.id}
              className={`absolute top-0 overflow-hidden text-ellipsis whitespace-nowrap pl-[3px] text-[0.7rem] tracking-wide ${
                item.id === chapter ? 'title-face text-paper' : item.ready ? 'text-paper/55' : 'text-paper/30'
              }`}
              style={{ left: `${left * 100}%`, width: `${width * 100}%` }}
            >
              {width > 0.05 || item.id === chapter ? (item.number ? `${item.number}. ${item.title}` : item.title) : item.number ?? ''}
            </span>
          ))}
        </div>
      </div>

      <div className="typed mb-[0.85rem] w-[5.6rem] shrink-0 text-right text-[0.78rem] tabular-nums text-paper/80">
        {formatTime(time)} / {formatTime(CHAPTERS[CHAPTERS.length - 1].end)}
      </div>
    </div>
  );
}
