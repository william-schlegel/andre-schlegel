import { chapterAt } from '../content/chapters';
import type { Chapter } from '../content/types';

/**
 * The Narration clock. Eric's voice is the only clock of the Journey (docs/adr/0001): the time
 * is read from the audio that is playing, never counted separately, so pictures cannot drift
 * away from the voice. The voice is cut into one file per Chapter; the clock hides that and
 * speaks in seconds of the Film's soundtrack.
 */

/** The little the clock needs from an audio element. */
export interface VoicePlayer {
  load(src: string): void;
  play(): Promise<void>;
  pause(): void;
  getTime(): number;
  setTime(seconds: number): void;
  /** True once the file has played to its end. */
  hasEnded(): boolean;
}

type FrameListener = (time: number) => void;
type ChapterEndListener = (chapter: Chapter) => void;

export class NarrationClock {
  private chapter: Chapter | null = null;
  private running = false;
  private finished = false;
  private now = 0;
  /** How many times the voice has been asked to play, or been paused: see `start`. */
  private requests = 0;
  private frameListeners = new Set<FrameListener>();
  private endListeners = new Set<ChapterEndListener>();

  constructor(
    private readonly player: VoicePlayer,
    private readonly voiceOf: (chapter: Chapter) => string,
  ) {}

  /** Seconds on the Film's soundtrack. */
  get time(): number {
    return this.now;
  }

  get isRunning(): boolean {
    return this.running;
  }

  get currentChapter(): Chapter | null {
    return this.chapter;
  }

  /** Put the clock at a moment of the Narration, loading that Chapter's voice if needed. */
  seek(time: number): void {
    const target = chapterAt(time);
    const clamped = Math.min(Math.max(time, target.start), target.end - 0.05);
    if (this.chapter?.id !== target.id) {
      this.chapter = target;
      this.player.load(this.voiceOf(target));
    }
    this.finished = false;
    this.now = clamped;
    this.player.setTime(clamped - target.start);
    if (this.running) void this.start();
    this.emit();
  }

  async play(): Promise<void> {
    if (!this.chapter) this.seek(this.now);
    if (this.finished) return;
    this.running = true;
    await this.start();
  }

  pause(): void {
    this.running = false;
    this.requests++;
    this.player.pause();
  }

  /** Read the voice's position. Called once per animation frame while the Journey is mounted. */
  tick(): void {
    const chapter = this.chapter;
    if (!chapter || this.finished) return;
    const time = chapter.start + this.player.getTime();
    if (this.player.hasEnded() || time >= chapter.end) {
      this.now = chapter.end;
      this.finished = true;
      this.running = false;
      this.player.pause();
      this.emit();
      for (const listener of this.endListeners) listener(chapter);
      return;
    }
    if (time !== this.now) {
      this.now = time;
      this.emit();
    }
  }

  onFrame(listener: FrameListener): () => void {
    this.frameListeners.add(listener);
    return () => this.frameListeners.delete(listener);
  }

  onChapterEnd(listener: ChapterEndListener): () => void {
    this.endListeners.add(listener);
    return () => this.endListeners.delete(listener);
  }

  /**
   * Ask the voice to play. Only the answer to the latest request counts: a browser refuses the
   * requests still waiting each time another voice file is loaded or the voice is paused, and
   * those refusals say nothing of the Narration (moving twice in a row must not stop it).
   */
  private async start(): Promise<void> {
    const request = ++this.requests;
    try {
      await this.player.play();
    } catch {
      // the browser refused (no gesture yet): stay paused rather than pretend
      if (request === this.requests) this.running = false;
    }
  }

  private emit(): void {
    for (const listener of this.frameListeners) listener(this.now);
  }
}

/** The clock's player in the browser: one audio element, reused for every Chapter. */
export function audioElementPlayer(audio: HTMLAudioElement): VoicePlayer {
  let pendingTime: number | null = null;
  audio.addEventListener('loadedmetadata', () => {
    if (pendingTime !== null) {
      audio.currentTime = pendingTime;
      pendingTime = null;
    }
  });
  return {
    load(src) {
      audio.src = src;
      audio.load();
    },
    play: () => audio.play(),
    pause: () => audio.pause(),
    getTime: () => pendingTime ?? audio.currentTime,
    setTime(seconds) {
      if (audio.readyState >= 1) {
        pendingTime = null;
        audio.currentTime = seconds;
      } else {
        // the file's length is not known yet: apply the position when it is
        pendingTime = seconds;
      }
    },
    hasEnded: () => audio.ended,
  };
}
