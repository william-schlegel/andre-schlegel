import { useRef, useSyncExternalStore } from 'react';
import { CHAPTERS, chapterAt, chapterById, nextChapter, reachableEnd } from '../content/chapters';
import type { Chapter, ChapterId } from '../content/types';
import { audioElementPlayer, NarrationClock } from './clock';
import { useJourney, type CloseUp } from './store';

/**
 * The Journey's conductor: the few moves a visitor can make (begin, pause, move in the
 * Timeline, go to a Chapter, open and close a Close-up) and what they do to the Narration.
 */

const SAVED_PLACE = 'andre-schlegel:place';
const LEFT_AT = 'andre-schlegel:left';

export const voiceOf = (chapter: Chapter) => `/media/${chapter.id}/voix.m4a`;

let audio: HTMLAudioElement | null = null;
let clock: NarrationClock | null = null;

export function getClock(): NarrationClock {
  if (!clock) {
    audio = new Audio();
    audio.preload = 'auto';
    clock = new NarrationClock(audioElementPlayer(audio), voiceOf);
    clock.onChapterEnd(chapterEnded);
    let lastSaved = 0;
    clock.onFrame((time) => {
      if (Math.abs(time - lastSaved) > 4 && useJourney.getState().phase === 'scene') {
        lastSaved = time;
        savePlace(time);
      }
    });
  }
  return clock;
}

/** Runs the clock off the screen's frames; returns the function that stops it. */
export function runClock(): () => void {
  const narration = getClock();
  let frame = 0;
  const loop = () => {
    narration.tick();
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(frame);
}

function chapterEnded(chapter: Chapter): void {
  const next = nextChapter(chapter.id);
  if (next?.ready) {
    useJourney.setState({ phase: 'opening', chapter: next.id, playing: false });
  } else {
    useJourney.setState({ phase: 'end', playing: false });
    clearPlace();
  }
}

/** The carnet is opened on the Introduction table: the Narration begins. Must be called from a gesture. */
export function begin(): void {
  const narration = getClock();
  useJourney.setState({ phase: 'scene', chapter: 'ouverture', playing: true, closeUp: null });
  if (audio) audio.muted = false;
  narration.seek(0);
  void narration.play().then(syncPlaying);
}

/** Take the Journey up again where a past visit left it. Must be called from a gesture. */
export function resumeAt(time: number): void {
  const narration = getClock();
  const chapter = chapterAt(Math.min(time, reachableEnd() - 1));
  useJourney.setState({ phase: 'scene', chapter: chapter.id, playing: true, closeUp: null });
  if (audio) audio.muted = false;
  narration.seek(Math.max(chapter.start, Math.min(time, chapter.end - 1)));
  void narration.play().then(syncPlaying);
}

/**
 * The visitor leaves for another page of the site (the Sources): the Narration stops, and
 * where he was is kept for his return, in this tab only.
 */
export function leave(): void {
  const { phase } = useJourney.getState();
  if (phase !== 'scene' && phase !== 'end') return;
  const time = getClock().time;
  if (phase === 'scene') {
    pause();
    savePlace(time);
  }
  try {
    sessionStorage.setItem(LEFT_AT, JSON.stringify({ phase, time }));
  } catch {
    // private browsing: he will come back to the Introduction, which offers to resume
  }
}

/** The page was left for the Sources and is shown again as it was (the browser's « back »): nothing is to be found again. */
export function forgetLeaving(): void {
  try {
    sessionStorage.removeItem(LEFT_AT);
  } catch {
    /* see leave */
  }
}

/**
 * Back from the Sources: the Scene (or the closing card) is found as it was left, the
 * Narration waiting. Nothing sounds until the visitor asks for it, so this needs no gesture.
 * Says whether there was a place to come back to.
 */
export function comeBack(): boolean {
  let left: { phase?: unknown; time?: unknown } | null = null;
  try {
    const raw = sessionStorage.getItem(LEFT_AT);
    sessionStorage.removeItem(LEFT_AT);
    left = raw ? (JSON.parse(raw) as { phase?: unknown; time?: unknown }) : null;
  } catch {
    return false;
  }
  if (!left || (left.phase !== 'scene' && left.phase !== 'end') || typeof left.time !== 'number' || !Number.isFinite(left.time)) return false;
  const narration = getClock();
  const time = Math.max(0, Math.min(left.time, reachableEnd() - 0.5));
  useJourney.setState({ phase: left.phase, chapter: chapterAt(time).id, playing: false, closeUp: null, resumeOnClose: false });
  if (audio) audio.muted = false;
  narration.seek(time);
  return true;
}

export function play(): void {
  const state = useJourney.getState();
  if (state.phase !== 'scene' || state.closeUp) return;
  useJourney.setState({ playing: true });
  void getClock().play().then(syncPlaying);
}

export function pause(): void {
  useJourney.setState({ playing: false });
  getClock().pause();
}

export function togglePlay(): void {
  if (useJourney.getState().playing) pause();
  else play();
}

/** Move in the Timeline. Going into another Chapter this way skips its Chapter opening. */
export function seek(time: number): void {
  const narration = getClock();
  const clamped = Math.max(0, Math.min(time, reachableEnd() - 0.5));
  const chapter = chapterAt(clamped);
  const state = useJourney.getState();
  if (state.phase !== 'scene' || state.chapter !== chapter.id) {
    useJourney.setState({ phase: 'scene', chapter: chapter.id });
  }
  if (audio) audio.muted = false;
  narration.seek(clamped);
  if (state.playing) void narration.play().then(syncPlaying);
}

/**
 * Go to a moment of the Narration chosen in a Close-up (a place of the whole Chart): the
 * Close-up closes and Eric speaks from there. Must be called from a gesture.
 */
export function goToMoment(time: number): void {
  useJourney.setState({ closeUp: null, resumeOnClose: false, playing: true });
  seek(time);
}

/** Go to a Chapter from the list: its Chapter opening plays first (the Ouverture has none). */
export function goToChapter(id: ChapterId): void {
  const chapter = chapterById(id);
  if (!chapter.ready) return;
  const narration = getClock();
  narration.pause();
  narration.seek(chapter.start);
  if (chapter.number === null) {
    useJourney.setState({ phase: 'scene', chapter: id, playing: true, closeUp: null });
    if (audio) audio.muted = false;
    void narration.play().then(syncPlaying);
  } else {
    useJourney.setState({ phase: 'opening', chapter: id, playing: false, closeUp: null });
    // The voice will start by itself when the Chapter opening is over, long after this
    // gesture: some browsers only allow that for a sound a gesture has already started.
    if (audio) {
      const voice = audio;
      voice.muted = true;
      void narration
        .play()
        .catch(() => undefined)
        .then(() => {
          if (useJourney.getState().phase !== 'opening') return;
          narration.pause();
          narration.seek(chapter.start);
        });
    }
  }
}

/** The Chapter opening is over (or skipped): the Scene takes over and Eric speaks. */
export function finishOpening(): void {
  const state = useJourney.getState();
  if (state.phase !== 'opening') return;
  const narration = getClock();
  const chapter = chapterById(state.chapter);
  narration.seek(chapter.start);
  if (audio) audio.muted = false;
  useJourney.setState({ phase: 'scene', playing: true });
  void narration.play().then(syncPlaying);
}

/** The list of Chapters can be opened from anywhere, the Introduction included. */
export function openChapters(): void {
  const state = useJourney.getState();
  if (state.phase === 'scene' || state.phase === 'end') openCloseUp({ kind: 'chapters' });
  else if (state.phase === 'introduction') useJourney.setState({ closeUp: { kind: 'chapters' }, resumeOnClose: false });
}

export function openCloseUp(closeUp: CloseUp): void {
  const state = useJourney.getState();
  if (state.phase !== 'scene' && state.phase !== 'end') return;
  // a Close-up opened from another Close-up keeps the first one's promise to resume
  const resumeOnClose = state.closeUp ? state.resumeOnClose : state.playing;
  getClock().pause();
  useJourney.setState({ closeUp, resumeOnClose, playing: false });
}

export function closeCloseUp(): void {
  const state = useJourney.getState();
  if (!state.closeUp) return;
  useJourney.setState({ closeUp: null, resumeOnClose: false });
  if (state.resumeOnClose && state.phase === 'scene') play();
}

/** Back to the Introduction table (from the closing card). */
export function backToIntroduction(): void {
  getClock().pause();
  useJourney.setState({ phase: 'introduction', chapter: 'ouverture', playing: false, closeUp: null });
}

function syncPlaying(): void {
  // if the browser refused to play, show the truth
  const running = getClock().isRunning;
  if (useJourney.getState().playing !== running) useJourney.setState({ playing: running });
}

// ---------- the place kept between visits ----------

function savePlace(time: number): void {
  try {
    localStorage.setItem(SAVED_PLACE, JSON.stringify({ time: Math.round(time), saved: Date.now() }));
  } catch {
    // private browsing: nothing is kept, the Journey still works
  }
}

function clearPlace(): void {
  try {
    localStorage.removeItem(SAVED_PLACE);
  } catch {
    /* see savePlace */
  }
}

/** Where a past visit stopped, if it went past the first seconds. */
export function savedPlace(): { time: number; chapter: Chapter } | null {
  try {
    const raw = localStorage.getItem(SAVED_PLACE);
    if (!raw) return null;
    const { time } = JSON.parse(raw) as { time: number };
    if (!(time > 20) || time >= reachableEnd() - 5) return null;
    return { time, chapter: chapterAt(time) };
  } catch {
    return null;
  }
}

// ---------- reading the Narration's time from React ----------

/**
 * A value derived from the Narration's time. The component re-renders only when the value
 * changes (say, when a new phrase starts), not at every frame.
 */
export function useNarration<T>(select: (time: number) => T, same: (a: T, b: T) => boolean = Object.is): T {
  const narration = getClock();
  const cached = useRef<{ value: T } | null>(null);
  const read = () => {
    const value = select(narration.time);
    if (!cached.current || !same(cached.current.value, value)) cached.current = { value };
    return cached.current.value;
  };
  return useSyncExternalStore(subscribeToFrames, read, read);
}

const subscribeToFrames = (notify: () => void) => getClock().onFrame(notify);

export const sameList = <T,>(a: readonly T[], b: readonly T[]) => a.length === b.length && a.every((item, i) => item === b[i]);

export { CHAPTERS };
