import { describe, expect, it } from 'vitest';
import { chapterById } from './chapters';
import { AIRCRAFT } from './models';
import { alongShelf, modelAt, shelved } from './shelf';

describe('the Shelf', () => {
  it('holds every aircraft of the story once, in the order the Narration brings them', () => {
    const models = shelved().map((one) => one.model);
    expect(new Set(models).size).toBe(models.length);
    expect(models).toEqual(Object.keys(AIRCRAFT));
    const times = shelved().map((one) => one.at);
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it('gives each model the label it had on the table', () => {
    for (const one of shelved()) expect(one.label.length).toBeGreaterThan(0);
    expect(shelved()[0].label[0]).toBe('Bloch 200');
  });

  it('opens on the model the Narration set down last', () => {
    expect(modelAt(0)).toBe('bloch-200');
    expect(modelAt(chapterById('tours').end - 1)).toBe('potez-25');
    expect(modelAt(chapterById('campagne-de-france').start + 60)).toBe('db-7');
    // a Chapter that shows the same aircraft again
    expect(modelAt(chapterById('missions').start + 300)).toBe('halifax');
    expect(modelAt(chapterById('apres-la-guerre').end - 1)).toBe('york');
  });

  it('is gone round from either end', () => {
    expect(alongShelf('bloch-200', 1)).toBe('potez-25');
    expect(alongShelf('bloch-200', -1)).toBe('york');
    expect(alongShelf('york', 1)).toBe('bloch-200');
  });
});
