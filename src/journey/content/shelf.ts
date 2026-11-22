import { CHAPTERS } from './chapters';
import { contentOf } from './index';
import type { ModelCue, ModelId } from './types';

/**
 * The Shelf: every Recognition model of the Journey side by side, in the order the Narration
 * sets them on the table, each with the label it had the first time.
 */
export interface Shelved {
  model: ModelId;
  label: string[];
  /** When the Narration first sets it down. */
  at: number;
}

const modelCues = (): ModelCue[] =>
  CHAPTERS.filter((chapter) => chapter.ready)
    .flatMap((chapter) => contentOf(chapter.id).cues.filter((cue): cue is ModelCue => cue.kind === 'model'))
    .sort((a, b) => a.at - b.at);

let shelf: Shelved[] | null = null;
export function shelved(): Shelved[] {
  if (!shelf) {
    shelf = [];
    for (const cue of modelCues()) if (!shelf.some((one) => one.model === cue.model)) shelf.push({ model: cue.model, label: cue.label, at: cue.at });
  }
  return shelf;
}

/**
 * The model the visitor finds in front of him as he comes to the Shelf: the one the Narration
 * set down last (before any model, the first of the Shelf).
 */
export function modelAt(time: number): ModelId {
  let latest: ModelCue | null = null;
  for (const cue of modelCues()) if (cue.at <= time) latest = cue;
  return latest?.model ?? shelved()[0].model;
}

/** The model `by` places further along the Shelf, which is gone round: after the last comes the first. */
export function alongShelf(model: ModelId, by: number): ModelId {
  const all = shelved();
  const index = all.findIndex((one) => one.model === model);
  return all[(((index + by) % all.length) + all.length) % all.length].model;
}
