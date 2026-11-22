import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { BonusesCloseUp } from './closeups/BonusesCloseUp';
import { CarnetCloseUp } from './closeups/CarnetCloseUp';
import { ChaptersCloseUp } from './closeups/ChaptersCloseUp';
import { ChartCloseUp } from './closeups/ChartCloseUp';
import { ModelCloseUp } from './closeups/ModelCloseUp';
import { PrintCloseUp } from './closeups/PrintCloseUp';
import { ShelfCloseUp } from './closeups/ShelfCloseUp';
import { TextCloseUp } from './closeups/TextCloseUp';
import { MissionsCloseUp } from './closeups/MissionsCloseUp';
import { TypedCloseUp } from './closeups/TypedCloseUp';
import { contentOf, missionsSheetOf, printOf, typedOf } from './content';
import { bonusById } from './content/bonuses';
import type { ChapterId } from './content/types';
import { begin, closeCloseUp, comeBack, forgetLeaving, getClock, goToChapter, openCloseUp, resumeAt, runClock, seek, togglePlay } from './engine/journey';
import { useJourney } from './engine/store';
import { poseOf } from './models/RecognitionModel';
import { Shelf } from './models/Shelf';
import { lookAt } from './stage/shot';
import { ChapterOpening } from './openings/ChapterOpening';
import { SCENES } from './scenes';
import { Ambience } from './sound/Ambience';
import { unlockSounds } from './sound/sounds';
import { Stage } from './stage/Stage';
import { Captions } from './ui/Captions';
import { Controls } from './ui/Controls';
import { Curtain } from './ui/Curtain';
import { EndCard } from './ui/EndCard';
import { FilmCredit } from './ui/FilmCredit';
import { Introduction } from './ui/Introduction';
import { MissionPhases } from './ui/MissionPhases';
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

  // back from the Sources: the Scene is found as it was left, before anything is painted
  useLayoutEffect(() => {
    if (comeBack()) {
      // nothing of the Journey has been touched yet on this page: its sounds wait for the first gesture
      const unlock = () => {
        unlockSounds();
        window.removeEventListener('pointerdown', unlock, true);
        window.removeEventListener('keydown', unlock, true);
      };
      window.addEventListener('pointerdown', unlock, true);
      window.addEventListener('keydown', unlock, true);
    }
    // shown again by the browser's « back » without being loaded: it is as it was left
    const shown = (event: PageTransitionEvent) => event.persisted && forgetLeaving();
    window.addEventListener('pageshow', shown);
    return () => window.removeEventListener('pageshow', shown);
  }, []);

  // while developing: a handle to drive the Journey from the browser's console
  useEffect(() => {
    if (import.meta.env.DEV) Object.assign(window, { journey: { clock: getClock(), store: useJourney, seek, begin, goToChapter, resumeAt, poseOf, lookAt } });
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

  const backToBonuses = useCallback(() => openCloseUp({ kind: 'bonuses' }), []);

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
  const bonus = closeUp?.kind === 'bonuses' && closeUp.id ? bonusById(closeUp.id) : null;
  const typedSheet = closeUp?.kind === 'typed' ? typedOf(chapter, closeUp.id) : null;
  const missionsSheet = closeUp?.kind === 'missions' ? missionsSheetOf(chapter, closeUp.id) : null;
  const shelf = closeUp?.kind === 'shelf' ? closeUp.model : null;

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-night">
      <Stage look={look} lit={shelf ? 'dark' : undefined}>
        <scene.Scene key={chapter} content={content} waiting={waiting} directed={phase === 'opening'} onBegin={phase === 'introduction' ? start : undefined} />
        {shelf && <Shelf model={shelf} />}
      </Stage>
      <Curtain place={shelf ? 'shelf' : 'table'} />
      <div className="vignette" />
      <div className="grain" />

      <Ambience look={look} active={phase !== 'introduction' || lamp} />

      <Introduction active={phase === 'introduction'} onLamp={setLamp} onBegin={start} onResume={resume} />

      {phase === 'opening' && <ChapterOpening key={chapter} content={content} />}

      {(phase === 'scene' || phase === 'end') && !closeUp && (
        <>
          <PostingCard chapter={content.chapter} postings={content.postings} />
          <Controls />
          {phase === 'scene' && <FilmCredit cues={content.cues} />}
          {phase === 'scene' && content.phases && <MissionPhases phases={content.phases} />}
          {captions && phase === 'scene' && <Captions phrases={content.phrases} />}
          <Timeline chapter={chapter} marks={content.marks} />
        </>
      )}

      {phase === 'end' && !closeUp && <EndCard chapter={chapter} />}

      {print && <PrintCloseUp print={print} />}
      {typedSheet && <TypedCloseUp sheet={typedSheet} />}
      {missionsSheet && <MissionsCloseUp sheet={missionsSheet} />}
      {closeUp?.kind === 'carnet' && <CarnetCloseUp carnet={closeUp.carnet} spread={closeUp.spread} place={content.companion.place} />}
      {closeUp?.kind === 'model' && <ModelCloseUp model={closeUp.model} chapter={chapter} />}
      {closeUp?.kind === 'text' && <TextCloseUp content={content} />}
      {closeUp?.kind === 'chapters' && <ChaptersCloseUp onChoose={choose} />}
      {closeUp?.kind === 'chart' && <ChartCloseUp />}
      {shelf && <ShelfCloseUp model={shelf} />}
      {closeUp?.kind === 'bonuses' && !bonus && <BonusesCloseUp chapter={chapter} />}
      {bonus && <PrintCloseUp key={bonus.id} print={{ ...bonus, bonus: true }} back={backToBonuses} />}

      <RotateNotice />
    </div>
  );
}
