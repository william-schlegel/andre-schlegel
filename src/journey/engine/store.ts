import { create } from 'zustand';
import type { CarnetId, ChapterId, ModelId } from '../content/types';

/**
 * Where the visitor is in the Journey.
 *  - introduction: the lamp-lit table, before any Narration
 *  - opening: a Chapter opening is playing; the Narration waits
 *  - scene: a Chapter's Scene, the Narration running or paused
 *  - end: the Narration has reached the last Chapter that is built
 */
export type Phase = 'introduction' | 'opening' | 'scene' | 'end';

/** A Close-up pauses the Narration, and resumes it when closed. */
export type CloseUp =
  | { kind: 'print'; id: string }
  | { kind: 'typed'; id: string }
  | { kind: 'carnet'; carnet: CarnetId; spread: number }
  | { kind: 'model'; model: ModelId }
  | { kind: 'text' }
  | { kind: 'chapters' };

export interface JourneyState {
  phase: Phase;
  chapter: ChapterId;
  /** The Narration is running (the visitor's intent; the clock follows). */
  playing: boolean;
  closeUp: CloseUp | null;
  /** Whether the Narration was running when the Close-up opened. */
  resumeOnClose: boolean;
  captions: boolean;
  /** Everything that sounds except Eric: objects, ambience, music. */
  sounds: boolean;
}

export const useJourney = create<JourneyState>(() => ({
  phase: 'introduction',
  chapter: 'ouverture',
  playing: false,
  closeUp: null,
  resumeOnClose: false,
  captions: true,
  sounds: true,
}));
