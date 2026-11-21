import { describe, expect, it } from 'vitest';
import type { Cue, Phrase, Posting } from '../content/types';
import { CAPTION_LINGER, cueInFocus, cuesOnTable, formatTime, lastAtOrBefore, phraseIndexAt, postingAt, progress } from './cues';

const print = (id: string, at: number, extra: Partial<Cue> = {}): Cue =>
  ({
    kind: 'print',
    id,
    at,
    src: `${id}.webp`,
    size: [100, 100],
    width: 0.2,
    place: { x: 0, z: 0 },
    legend: id,
    source: 'test',
    ...extra,
  }) as Cue;

describe('lastAtOrBefore', () => {
  const items = [10, 20, 30];
  const key = (n: number) => n;
  it('finds nothing before the first item', () => expect(lastAtOrBefore(items, 9.9, key)).toBe(-1));
  it('includes the exact moment', () => expect(lastAtOrBefore(items, 20, key)).toBe(1));
  it('finds the last item far after it', () => expect(lastAtOrBefore(items, 999, key)).toBe(2));
  it('handles an empty list', () => expect(lastAtOrBefore([], 1, key)).toBe(-1));
});

describe('phraseIndexAt', () => {
  const phrases: Phrase[] = [
    { start: 1, end: 3, text: 'a' },
    { start: 3.2, end: 5, text: 'b' },
    { start: 9, end: 11, text: 'c' },
  ];
  it('shows nothing before Eric speaks', () => expect(phraseIndexAt(phrases, 0.5)).toBe(-1));
  it('shows the phrase being said', () => expect(phraseIndexAt(phrases, 2)).toBe(0));
  it('keeps a phrase up through a short breath', () => expect(phraseIndexAt(phrases, 3.1)).toBe(0));
  it('moves on as soon as the next phrase starts', () => expect(phraseIndexAt(phrases, 3.2)).toBe(1));
  it('clears the caption in a long pause', () => {
    expect(phraseIndexAt(phrases, 5 + CAPTION_LINGER - 0.01)).toBe(1);
    expect(phraseIndexAt(phrases, 5 + CAPTION_LINGER + 0.01)).toBe(-1);
  });
});

describe('cuesOnTable', () => {
  const cues = [print('a', 10), print('b', 20, { until: 30 }), print('c', 40)];
  it('is empty before the first cue', () => expect(cuesOnTable(cues, 5)).toEqual([]));
  it('keeps a print until the end of the Chapter by default', () =>
    expect(cuesOnTable(cues, 1000).map((c) => c.id)).toEqual(['a', 'c']));
  it('takes a print away at its `until`', () => {
    expect(cuesOnTable(cues, 29.9).map((c) => c.id)).toEqual(['a', 'b']);
    expect(cuesOnTable(cues, 30).map((c) => c.id)).toEqual(['a']);
  });
  it('gives the same table whether one listens or jumps', () => {
    const listened = [5, 12, 22, 35, 45].map((t) => cuesOnTable(cues, t).map((c) => c.id));
    const jumped = [45, 5, 35, 12, 22].map((t) => cuesOnTable(cues, t).map((c) => c.id));
    expect(jumped).toEqual([listened[4], listened[0], listened[3], listened[1], listened[2]]);
  });
});

describe('cueInFocus', () => {
  const cues = [print('a', 10), print('b', 20, { hold: 5 }), print('c', 40, { until: 50 })];
  it('has nothing in focus before the first cue', () => expect(cueInFocus(cues, 0)).toBeNull());
  it('stays on a cue until the next one', () => expect(cueInFocus(cues, 19.9)?.id).toBe('a'));
  it('moves to the latest cue', () => expect(cueInFocus(cues, 21)?.id).toBe('b'));
  it('returns to the whole table when the hold is over', () => expect(cueInFocus(cues, 26)).toBeNull());
  it('does not go back to an older cue after a hold', () => expect(cueInFocus(cues, 39)).toBeNull());
  it('lets go of a cue that has left the table', () => expect(cueInFocus(cues, 55)).toBeNull());
});

describe('postingAt', () => {
  const postings: Posting[] = [
    { from: 44, rank: 'Sous-lieutenant', base: 'Base 131 Tours', unit: '31e Escadre', dates: '1936 – 1939' },
    { from: 175, rank: 'Lieutenant', base: 'Base 121 Oran', unit: '19e Escadre', dates: '1939' },
  ];
  it('has no Posting during the Ouverture', () => expect(postingAt(postings, 10)).toBeNull());
  it('gives the Posting in force', () => {
    expect(postingAt(postings, 100)?.rank).toBe('Sous-lieutenant');
    expect(postingAt(postings, 175)?.rank).toBe('Lieutenant');
  });
});

describe('progress', () => {
  it('runs from 0 to 1 over the duration', () => {
    expect(progress(9, 10, 2)).toBe(0);
    expect(progress(11, 10, 2)).toBe(0.5);
    expect(progress(13, 10, 2)).toBe(1);
  });
  it('is a step when there is no duration', () => {
    expect(progress(9.99, 10, 0)).toBe(0);
    expect(progress(10, 10, 0)).toBe(1);
  });
});

describe('formatTime', () => {
  it('writes minutes and seconds', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(174.6)).toBe('2:54');
    expect(formatTime(3312)).toBe('55:12');
  });
});
