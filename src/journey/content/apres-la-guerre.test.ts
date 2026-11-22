import { describe, expect, it } from 'vitest';
import { apresLaGuerre } from './apres-la-guerre';
import { carnetOf } from './carnets';
import { chapterById } from './chapters';
import type { ChartCue, SpreadCue } from './types';
import { POSTS } from '../chart/places';

describe('Après la guerre', () => {
  const chapter = chapterById('apres-la-guerre');
  const { cues, postings, phrases, companion } = apresLaGuerre;

  it('keeps every cue, phrase and Posting inside the Chapter', () => {
    for (const cue of cues) {
      expect(cue.at, cue.id).toBeGreaterThanOrEqual(chapter.start);
      expect(cue.until ?? cue.at, cue.id).toBeLessThanOrEqual(chapter.end);
    }
    expect(phrases[0].start).toBeGreaterThanOrEqual(chapter.start);
    expect(phrases.at(-1)!.end).toBeLessThanOrEqual(chapter.end);
    expect(postings[0].from).toBe(chapter.start);
    expect(new Set(cues.map((cue) => cue.id)).size).toBe(cues.length);
  });

  it('inks the Route to Buenos Aires in the order Eric gives it', () => {
    const inked = cues.filter((cue): cue is ChartCue => cue.kind === 'chart');
    expect(inked.map((cue) => cue.view)).toEqual(['dakar', 'rio', 'buenos-aires']);
    for (const cue of inked) expect(POSTS).toHaveProperty(cue.view);
    expect(inked.map((cue) => cue.at)).toEqual([...inked.map((cue) => cue.at)].sort((a, b) => a - b));
  });

  it('opens the Carnet of 1947 only once it has replaced the Carnet of 1940, and closes it at the end', () => {
    const spreads = cues.filter((cue): cue is SpreadCue => cue.kind === 'spread');
    const scans = carnetOf('1947').scans.length;
    expect(companion.next?.carnet).toBe('1947');
    for (const cue of spreads) {
      expect(cue.carnet).toBe('1947');
      expect(cue.at).toBeGreaterThan(companion.next!.at);
      expect(cue.spread).toBeLessThanOrEqual(scans);
    }
    expect(spreads.at(-1)!.spread).toBe(0);
  });
});
