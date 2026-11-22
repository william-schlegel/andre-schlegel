import { MUSIC } from '../content/music';
import type { ChapterId } from '../content/types';
import { useJourney } from '../engine/store';

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
