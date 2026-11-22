import { describe, expect, it } from 'vitest';
import { BONUSES, bonusById } from './bonuses';
import { CHAPTERS } from './chapters';
import sizes from './generated/prints-bonus.json';

describe('the Bonuses', () => {
  it('each belong to a Chapter and are told apart', () => {
    const chapters = new Set(CHAPTERS.map((chapter) => chapter.id));
    for (const bonus of BONUSES) expect(chapters.has(bonus.chapter), bonus.id).toBe(true);
    expect(new Set(BONUSES.map((bonus) => bonus.id)).size).toBe(BONUSES.length);
  });

  it('each have their picture, its smaller copy, a legend and a source', () => {
    for (const bonus of BONUSES) {
      // the pipeline writes the picture, its smaller copy and its size together
      expect(Object.keys(sizes), bonus.id).toContain(bonus.id);
      expect(bonus.src).toBe(`/media/bonus/${bonus.id}.webp`);
      expect(bonus.small).toBe(`/media/bonus/${bonus.id}.small.webp`);
      expect(bonus.size[0] > 0 && bonus.size[1] > 0, bonus.id).toBe(true);
      expect(bonus.legend.length, bonus.id).toBeGreaterThan(0);
      expect(bonus.source.length, bonus.id).toBeGreaterThan(0);
    }
  });

  it('are found by their id', () => {
    expect(bonusById(BONUSES[0].id)).toBe(BONUSES[0]);
    expect(bonusById('absent')).toBeNull();
  });
});
