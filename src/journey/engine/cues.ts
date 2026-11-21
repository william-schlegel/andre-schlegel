import type { Cue, Phrase, Posting } from '../content/types';

/**
 * What the Narration calls for at a given moment. Everything here is a pure function of the
 * time, so that moving in the Timeline gives exactly the state that listening would have given.
 */

/** Index of the last item whose key is <= value, or -1. `items` must be sorted by key. */
export function lastAtOrBefore<T>(items: readonly T[], value: number, key: (item: T) => number): number {
  let low = 0;
  let high = items.length - 1;
  let found = -1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    if (key(items[middle]) <= value) {
      found = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return found;
}

/** A caption stays up this long after its last word when nothing follows at once. */
export const CAPTION_LINGER = 0.6;

/** The phrase Eric is saying, or -1 during his pauses. */
export function phraseIndexAt(phrases: readonly Phrase[], time: number): number {
  const index = lastAtOrBefore(phrases, time, (p) => p.start);
  if (index < 0) return -1;
  return time < phrases[index].end + CAPTION_LINGER ? index : -1;
}

/** The cues on the table: shown, and not yet taken away. */
export function cuesOnTable(cues: readonly Cue[], time: number): Cue[] {
  return cues.filter((cue) => cue.at <= time && (cue.until === undefined || time < cue.until));
}

/**
 * The cue the eye is on: the latest one shown, for as long as it holds. When its hold is over
 * and nothing else has come, the eye goes back to the whole table (null).
 */
export function cueInFocus(cues: readonly Cue[], time: number): Cue | null {
  let latest: Cue | null = null;
  for (const cue of cues) {
    if (cue.at > time) continue;
    if (!latest || cue.at >= latest.at) latest = cue;
  }
  if (!latest) return null;
  if (latest.until !== undefined && time >= latest.until) return null;
  if (latest.hold !== undefined && time >= latest.at + latest.hold) return null;
  return latest;
}

export function postingAt(postings: readonly Posting[], time: number): Posting | null {
  const index = lastAtOrBefore(postings, time, (p) => p.from);
  return index < 0 ? null : postings[index];
}

/** How far a cue is into its entrance, from 0 to 1, for moves tied to the Narration. */
export function progress(time: number, from: number, duration: number): number {
  if (duration <= 0) return time >= from ? 1 : 0;
  return Math.min(1, Math.max(0, (time - from) / duration));
}

/** mm:ss, the way the Timeline writes a moment of the Narration. */
export function formatTime(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, '0')}`;
}
