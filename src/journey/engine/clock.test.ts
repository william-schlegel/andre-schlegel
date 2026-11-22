import { describe, expect, it, vi } from 'vitest';
import { CHAPTERS } from '../content/chapters';
import type { Chapter } from '../content/types';
import { NarrationClock, type VoicePlayer } from './clock';

/** A voice that plays as fast as the test wants. */
class FakeVoice implements VoicePlayer {
  src = '';
  position = 0;
  playing = false;
  ended = false;
  refuse = false;
  /** As over a network: the voice only starts once its file has arrived (see `arrive`). */
  slow = false;
  loads: string[] = [];
  private waiting: { started: () => void; interrupted: (reason: Error) => void }[] = [];

  load(src: string) {
    this.src = src;
    this.loads.push(src);
    this.position = 0;
    this.ended = false;
    this.playing = false;
    this.interrupt();
  }
  play(): Promise<void> {
    if (this.refuse) return Promise.reject(new Error('NotAllowedError'));
    if (!this.slow) {
      this.playing = true;
      return Promise.resolve();
    }
    return new Promise((started, interrupted) => this.waiting.push({ started, interrupted }));
  }
  pause() {
    this.playing = false;
    this.interrupt();
  }
  /** The file has arrived: every request to play still waiting is answered. */
  arrive() {
    this.playing = this.waiting.length > 0 || this.playing;
    for (const request of this.waiting.splice(0)) request.started();
  }
  /** A browser refuses the requests to play still waiting when the voice is paused or another file is loaded. */
  private interrupt() {
    for (const request of this.waiting.splice(0)) request.interrupted(new Error('AbortError'));
  }
  getTime() {
    return this.position;
  }
  setTime(seconds: number) {
    this.position = seconds;
    this.ended = false;
  }
  hasEnded() {
    return this.ended;
  }
  /** Let some seconds of voice go by. */
  advance(seconds: number) {
    if (this.playing) this.position += seconds;
  }
}

const voiceOf = (chapter: Chapter) => `/media/${chapter.id}/voix.m4a`;
const ouverture = CHAPTERS[0];
const tours = CHAPTERS[1];
const algerie = CHAPTERS[2];

function setup() {
  const voice = new FakeVoice();
  const clock = new NarrationClock(voice, voiceOf);
  return { voice, clock };
}

describe('NarrationClock', () => {
  it('speaks in seconds of the Film, whatever the Chapter file', async () => {
    const { voice, clock } = setup();
    clock.seek(tours.start + 10);
    expect(voice.src).toBe('/media/tours/voix.m4a');
    expect(voice.position).toBeCloseTo(10);
    await clock.play();
    voice.advance(5);
    clock.tick();
    expect(clock.time).toBeCloseTo(tours.start + 15);
  });

  it('does not reload the voice when moving inside a Chapter', () => {
    const { voice, clock } = setup();
    clock.seek(tours.start + 10);
    clock.seek(tours.start + 60);
    expect(voice.loads).toEqual(['/media/tours/voix.m4a']);
    expect(voice.position).toBeCloseTo(60);
  });

  it('changes voice file when moving to another Chapter, and keeps playing if it was', async () => {
    const { voice, clock } = setup();
    clock.seek(ouverture.start + 5);
    await clock.play();
    clock.seek(tours.start + 20);
    expect(voice.loads).toEqual(['/media/ouverture/voix.m4a', '/media/tours/voix.m4a']);
    expect(voice.playing).toBe(true);
    expect(clock.isRunning).toBe(true);
  });

  it('keeps running when moved twice before the voice of the first Chapter has arrived', async () => {
    const { voice, clock } = setup();
    clock.seek(ouverture.start + 5);
    await clock.play();
    voice.slow = true;
    // a drag across the Timeline: one Chapter, then the next, faster than a file loads
    clock.seek(tours.start + 20);
    const first = clock.play();
    clock.seek(algerie.start + 20);
    const second = clock.play();
    await first;
    expect(clock.isRunning).toBe(true);
    voice.arrive();
    await second;
    expect(clock.isRunning).toBe(true);
    expect(voice.playing).toBe(true);
    expect(voice.src).toBe('/media/algerie/voix.m4a');
  });

  it('is not started again by a request to play that a pause interrupted', async () => {
    const { voice, clock } = setup();
    voice.slow = true;
    clock.seek(tours.start + 20);
    const asked = clock.play();
    clock.pause();
    await asked;
    expect(clock.isRunning).toBe(false);
    expect(voice.playing).toBe(false);
  });

  it('stays paused when moved while paused', () => {
    const { voice, clock } = setup();
    clock.seek(tours.start + 20);
    expect(voice.playing).toBe(false);
    expect(clock.isRunning).toBe(false);
  });

  it('tells its listeners the time only when it changes', async () => {
    const { voice, clock } = setup();
    const heard: number[] = [];
    clock.onFrame((time) => heard.push(time));
    clock.seek(ouverture.start);
    await clock.play();
    clock.tick();
    voice.advance(1);
    clock.tick();
    clock.tick();
    expect(heard).toEqual([0, 1]);
  });

  it('stops at the end of the Chapter and says so once', async () => {
    const { voice, clock } = setup();
    const ended = vi.fn();
    clock.onChapterEnd(ended);
    clock.seek(ouverture.end - 1);
    await clock.play();
    voice.advance(2);
    clock.tick();
    clock.tick();
    expect(ended).toHaveBeenCalledTimes(1);
    expect(ended).toHaveBeenCalledWith(ouverture);
    expect(clock.time).toBe(ouverture.end);
    expect(clock.isRunning).toBe(false);
    expect(voice.playing).toBe(false);
  });

  it('also ends when the file itself runs out a little early', async () => {
    const { voice, clock } = setup();
    const ended = vi.fn();
    clock.onChapterEnd(ended);
    clock.seek(ouverture.end - 1);
    await clock.play();
    voice.ended = true;
    clock.tick();
    expect(ended).toHaveBeenCalledTimes(1);
  });

  it('can be moved back after a Chapter has ended', async () => {
    const { voice, clock } = setup();
    clock.seek(ouverture.end - 1);
    await clock.play();
    voice.advance(2);
    clock.tick();
    clock.seek(ouverture.start + 3);
    await clock.play();
    voice.advance(1);
    clock.tick();
    expect(clock.time).toBeCloseTo(4);
    expect(clock.isRunning).toBe(true);
  });

  it('stays paused when the browser refuses to play', async () => {
    const { voice, clock } = setup();
    voice.refuse = true;
    clock.seek(0);
    await clock.play();
    expect(clock.isRunning).toBe(false);
  });

  it('never seeks past the end of a Chapter file', () => {
    const { voice, clock } = setup();
    clock.seek(tours.end);
    // tours.end belongs to the next Chapter
    expect(voice.src).toBe('/media/algerie/voix.m4a');
    expect(voice.position).toBeCloseTo(0);
  });
});
