import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../content/chapters';
import type { Chapter } from '../content/types';
import { CURRENT_SHARE, layoutTimeline, positionOf, timeAt } from './timeline';

const chapter = (id: string, start: number, end: number): Chapter =>
  ({ id, number: 1, title: id, dates: '', start, end, ready: true }) as unknown as Chapter;

describe('layoutTimeline', () => {
  const chapters = [chapter('a', 0, 10), chapter('b', 10, 30), chapter('c', 30, 100)];

  it('fills the Timeline exactly, in order', () => {
    const segments = layoutTimeline(chapters, 'a' as never);
    expect(segments[0].left).toBe(0);
    expect(segments[1].left).toBeCloseTo(segments[0].width);
    expect(segments.reduce((sum, s) => sum + s.width, 0)).toBeCloseTo(1);
  });

  it('gives a short current Chapter its minimum share', () => {
    const segments = layoutTimeline(chapters, 'a' as never);
    expect(segments[0].width).toBeCloseTo(CURRENT_SHARE);
    // the others keep their proportions: c is 3.5 times b
    expect(segments[2].width / segments[1].width).toBeCloseTo(3.5);
  });

  it('leaves a long current Chapter its natural share', () => {
    const segments = layoutTimeline(chapters, 'c' as never);
    expect(segments[2].width).toBeCloseTo(0.7);
    expect(segments[0].width).toBeCloseTo(0.1);
  });

  it('works on the real Chapters, whichever is current', () => {
    for (const current of CHAPTERS) {
      const segments = layoutTimeline(CHAPTERS, current.id);
      expect(segments.reduce((sum, s) => sum + s.width, 0)).toBeCloseTo(1);
      expect(segments.every((s) => s.width > 0)).toBe(true);
    }
  });
});

describe('positionOf and timeAt', () => {
  const chapters = [chapter('a', 0, 10), chapter('b', 10, 30), chapter('c', 30, 100)];
  const segments = layoutTimeline(chapters, 'b' as never);

  it('puts Chapter boundaries on segment edges', () => {
    expect(positionOf(segments, 0)).toBe(0);
    expect(positionOf(segments, 10)).toBeCloseTo(segments[1].left);
    expect(positionOf(segments, 30)).toBeCloseTo(segments[2].left);
    expect(positionOf(segments, 100)).toBe(1);
  });

  it('is linear inside a Chapter', () => {
    const middle = positionOf(segments, 20);
    expect(middle).toBeCloseTo(segments[1].left + segments[1].width / 2);
  });

  it('are inverse of each other', () => {
    for (const time of [0, 3, 9.99, 10, 17.5, 29, 30, 64, 99]) {
      expect(timeAt(segments, positionOf(segments, time))).toBeCloseTo(time, 6);
    }
  });

  it('clamps a point outside the Timeline', () => {
    expect(timeAt(segments, -0.2)).toBe(0);
    expect(timeAt(segments, 1.4)).toBeCloseTo(100, 6);
  });
});
