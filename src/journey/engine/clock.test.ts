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
  loads: string[] = [];

  load(src: string) {
    this.src = src;
    this.loads.push(src);
    this.position = 0;
    this.ended = false;
    this.playing = false;
  }
  async play() {
    if (this.refuse) throw new Error('NotAllowedError');
    this.playing = true;
  }
  pause() {
    this.playing = false;
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
