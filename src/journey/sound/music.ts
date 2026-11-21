import type { ChapterId } from '../content/types';
import { useJourney } from '../engine/store';

/**
 * Period music: a few seconds at a Chapter opening, fading as Eric speaks again.
 *
 * No recording is used until its source and licence have been approved (see the Sources
 * page): this list is empty on purpose, and a Chapter without an entry opens without music.
 */
export interface Recording {
  src: string;
  title: string;
  performer: string;
  year: string;
  source: string;
  licence: string;
  /** Where to start in the recording, in seconds. */
  from?: number;
}

export const MUSIC: Partial<Record<ChapterId, Recording>> = {};

let playing: HTMLAudioElement | null = null;

/** Starts the Chapter's music, if it has one; returns the function that fades it out. */
export function playChapterMusic(chapter: ChapterId): () => void {
  const recording = MUSIC[chapter];
  if (!recording || !useJourney.getState().sounds) return () => undefined;
  stopNow();
  const audio = new Audio(recording.src);
  audio.volume = 0.5;
  audio.currentTime = recording.from ?? 0;
  playing = audio;
  void audio.play().catch(() => undefined);
  return () => fadeOut(audio, 2.5);
}

function stopNow(): void {
  playing?.pause();
  playing = null;
}

function fadeOut(audio: HTMLAudioElement, seconds: number): void {
  const start = audio.volume;
  const began = performance.now();
  const step = () => {
    const done = (performance.now() - began) / (seconds * 1000);
    if (done >= 1) {
      audio.pause();
      if (playing === audio) playing = null;
      return;
    }
    audio.volume = start * (1 - done);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
