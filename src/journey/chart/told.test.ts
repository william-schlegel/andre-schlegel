import { describe, expect, it } from 'vitest';
import { contentOf } from '../content';
import { CHAPTERS, chapterAt, reachableEnd } from '../content/chapters';
import { POSTS, SHEETS } from './places';
import { farPlaces, sentenceStart, toldPlaces } from './told';

describe('the places of the Narration', () => {
  const places = toldPlaces();
  const everyMoment = [...places, ...farPlaces()].flatMap((place) => place.moments.map((moment) => ({ place, moment })));

  it('names each place once', () => {
    const ids = [...places, ...farPlaces()].map((place) => place.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('sets every place inside its sheet', () => {
    for (const place of places) {
      const [[west, south], [east, north]] = SHEETS[place.sheet].box;
      expect(place.at[0], place.id).toBeGreaterThan(west);
      expect(place.at[0], place.id).toBeLessThan(east);
      expect(place.at[1], place.id).toBeGreaterThan(south);
      expect(place.at[1], place.id).toBeLessThan(north);
    }
  });

  it('leaves out no post of the Chart', () => {
    for (const [id, post] of Object.entries(POSTS)) {
      expect(places.some((place) => place.at[0] === post.at[0] && place.at[1] === post.at[1]), id).toBe(true);
    }
  });

  it('takes every moment to the first word of a phrase the Journey can reach', () => {
    for (const { place, moment } of everyMoment) {
      expect(moment.at, place.id).toBeGreaterThanOrEqual(0);
      expect(moment.at, place.id).toBeLessThan(reachableEnd() - 1);
      const chapter = chapterAt(moment.at);
      const starts = contentOf(chapter.id).phrases.map((phrase) => phrase.start);
      expect(starts.includes(moment.at) || moment.at === chapter.start, `${place.id}: ${moment.what}`).toBe(true);
    }
  });

  it('tells each place at least once, its moments in the order of the Narration', () => {
    for (const place of [...places, ...farPlaces()]) {
      expect(place.moments.length, place.id).toBeGreaterThan(0);
      const times = place.moments.map((moment) => moment.at);
      expect(times, place.id).toEqual([...times].sort((a, b) => a - b));
    }
  });

  it('reaches every Chapter but the Ouverture', () => {
    const told = new Set(everyMoment.map(({ moment }) => chapterAt(moment.at).id));
    for (const chapter of CHAPTERS) if (chapter.number !== null) expect(told.has(chapter.id), chapter.id).toBe(true);
  });
});

describe('the start of a sentence', () => {
  it('goes back to the first word of the sentence being said', () => {
    // « Poursuite des missions de combat sur le nord de la France : / Abbeville et Saint-Quentin. »
    const phrases = contentOf('campagne-de-france').phrases;
    const named = phrases.find((phrase) => phrase.text.includes('Abbeville et Saint-Quentin'))!;
    const before = phrases[phrases.indexOf(named) - 1];
    expect(sentenceStart('campagne-de-france', named.start + 0.5)).toBe(before.start);
  });

  it('takes an item of a list Eric reads out from its own first word', () => {
    const phrases = contentOf('missions').phrases;
    const item = phrases.find((phrase) => phrase.text.includes('Noyelles, près d’Abbeville'))!;
    expect(sentenceStart('missions', item.start + 0.5)).toBe(item.start);
  });

  it('never leaves the Chapter', () => {
    const chapter = contentOf('tours');
    expect(sentenceStart('tours', chapter.chapter.start)).toBeGreaterThanOrEqual(chapter.chapter.start);
  });
});
