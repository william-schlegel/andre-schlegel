import { useCallback, useEffect, useState } from 'react';
import { CarnetCloseUp } from './closeups/CarnetCloseUp';
import { ChaptersCloseUp } from './closeups/ChaptersCloseUp';
import { ModelCloseUp } from './closeups/ModelCloseUp';
import { PrintCloseUp } from './closeups/PrintCloseUp';
import { TextCloseUp } from './closeups/TextCloseUp';
import { contentOf, printOf } from './content';
import type { ChapterId } from './content/types';
import { begin, closeCloseUp, getClock, goToChapter, resumeAt, runClock, seek, togglePlay } from './engine/journey';
import { useJourney } from './engine/store';
import { ChapterOpening } from './openings/ChapterOpening';
import { SCENES } from './scenes';
import { Ambience } from './sound/Ambience';
import { unlockSounds } from './sound/sounds';
import { Stage } from './stage/Stage';
import { Captions } from './ui/Captions';
import { Controls } from './ui/Controls';
import { EndCard } from './ui/EndCard';
import { Introduction } from './ui/Introduction';
import { PostingCard } from './ui/PostingCard';
import { RotateNotice } from './ui/RotateNotice';
import { Timeline } from './ui/Timeline';

/**
 * The Journey: one table under one light, on which each Chapter lays its Scene; and over it,
 * the few words and controls the visitor needs.
 */
export default function Journey() {
  const phase = useJourney((state) => state.phase);
  const chapter = useJourney((state) => state.chapter);
  const closeUp = useJourney((state) => state.closeUp);
  const captions = useJourney((state) => state.captions);
  const [lamp, setLamp] = useState(false);

  useEffect(() => runClock(), []);

  // while developing: a handle to drive the Journey from the browser's console
  useEffect(() => {
    if (import.meta.env.DEV) Object.assign(window, { journey: { clock: getClock(), store: useJourney, seek, begin, goToChapter, resumeAt } });
  }, []);

  const content = contentOf(chapter);
  const scene = SCENES[chapter]!;
  const waiting = phase === 'introduction' || phase === 'opening';
  const look = phase === 'introduction' && !lamp ? 'dark' : scene.look;

  const start = useCallback(() => {
    unlockSounds();
    begin();
  }, []);
  const resume = useCallback((time: number) => {
    unlockSounds();
    resumeAt(time);
  }, []);
  const choose = useCallback((id: ChapterId) => {
    unlockSounds();
    closeCloseUp();
    goToChapter(id);
  }, []);

  // the keyboard: space pauses, the arrows move ten seconds
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const state = useJourney.getState();
      if (state.phase !== 'scene' || state.closeUp) return;
      if ((event.target as HTMLElement | null)?.closest('button, a, input, [role="slider"]') && event.key === ' ') return;
      if (event.key === ' ') {
        event.preventDefault();
        togglePlay();
      } else if (event.key === 'ArrowRight' && !(event.target as HTMLElement | null)?.closest('[role="slider"]')) seek(getClock().time + 10);
      else if (event.key === 'ArrowLeft' && !(event.target as HTMLElement | null)?.closest('[role="slider"]')) seek(getClock().time - 10);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  const print = closeUp?.kind === 'print' ? printOf(chapter, closeUp.id) : null;

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-night">
      <Stage look={look}>
        <scene.Scene key={chapter} content={content} waiting={waiting} directed={phase === 'opening'} onBegin={phase === 'introduction' ? start : undefined} />
      </Stage>
      <div className="vignette" />
      <div className="grain" />

      <Ambience look={look} active={phase !== 'introduction' || lamp} />

      <Introduction active={phase === 'introduction'} onLamp={setLamp} onBegin={start} onResume={resume} />

      {phase === 'opening' && <ChapterOpening key={chapter} content={content} />}

      {(phase === 'scene' || phase === 'end') && !closeUp && (
        <>
          <PostingCard chapter={content.chapter} postings={content.postings} />
          <Controls />
          {captions && phase === 'scene' && <Captions phrases={content.phrases} />}
          <Timeline chapter={chapter} marks={content.marks} />
        </>
      )}

      {phase === 'end' && !closeUp && <EndCard chapter={chapter} />}

      {print && <PrintCloseUp print={print} />}
      {closeUp?.kind === 'carnet' && <CarnetCloseUp carnet={closeUp.carnet} spread={closeUp.spread} place={content.companion.place} />}
      {closeUp?.kind === 'model' && <ModelCloseUp model={closeUp.model} chapter={chapter} />}
      {closeUp?.kind === 'text' && <TextCloseUp content={content} />}
      {closeUp?.kind === 'chapters' && <ChaptersCloseUp onChoose={choose} />}

      <RotateNotice />
    </div>
  );
}
