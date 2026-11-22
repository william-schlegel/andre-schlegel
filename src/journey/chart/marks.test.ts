import { describe, expect, it } from 'vitest';
import { gather, letter, type Lettered, type Spot } from './marks';

const spot = (item: string, x: number, y: number, sheet = 'ensemble'): Spot<string> => ({ item, x, y, sheet });

describe('the marks of the whole Chart', () => {
  it('leaves alone the places that stand clear of one another', () => {
    const marks = gather([spot('Tours', 0, 0), spot('Biskra', 100, 0)], 1, 20);
    expect(marks.map((mark) => mark.items)).toEqual([['Tours'], ['Biskra']]);
  });

  it('gathers the places that would stand on one another, at the middle of them', () => {
    const marks = gather([spot('Oran', 0, 0), spot('Mers el-Kébir', 10, 0), spot('Biskra', 100, 0)], 1, 20);
    expect(marks.map((mark) => mark.items)).toEqual([['Oran', 'Mers el-Kébir'], ['Biskra']]);
    expect(marks[0]).toMatchObject({ x: 5, y: 0 });
  });

  it('parts them again when the Chart is seen from nearer', () => {
    const spots = [spot('Oran', 0, 0), spot('Mers el-Kébir', 10, 0)];
    expect(gather(spots, 1, 20)).toHaveLength(1);
    expect(gather(spots, 3, 20)).toHaveLength(2);
  });

  it('goes on gathering until every mark stands clear', () => {
    // a chain: each place is near the next one only
    const marks = gather([spot('a', 0, 0), spot('b', 15, 0), spot('c', 30, 0), spot('d', 45, 0)], 1, 20);
    for (const one of marks) for (const other of marks) if (one !== other) expect(Math.hypot(one.x - other.x, one.y - other.y)).toBeGreaterThanOrEqual(20);
    expect(marks.flatMap((mark) => mark.items).sort()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('never gathers the places of two sheets', () => {
    const marks = gather([spot('Paris', 0, 0, 'ensemble'), spot('Paris', 2, 0, 'atlantique-sud')], 1, 20);
    expect(marks).toHaveLength(2);
  });
});

describe('the names of the marks', () => {
  const mark = (x: number, y: number, width = 60): Lettered => ({ x, y, radius: 8, width, height: 14 });

  it('writes a name to the right of its mark when nothing is in the way', () => {
    expect(letter([mark(0, 0), mark(0, 200)])).toEqual(['right', 'right']);
  });

  it('writes it on another side when a mark stands to the right', () => {
    expect(letter([mark(0, 0), mark(40, 0)])[0]).toBe('left');
  });

  it('does not write over a name already written', () => {
    // the second mark has a mark to its right, and to its left the name of the first
    const sides = letter([mark(0, 0, 120), mark(150, 6, 120), mark(180, 6, 120)]);
    expect(sides[0]).toBe('right');
    expect(sides[1]).toBe('below');
  });

  it('keeps a name on its sheet', () => {
    const room = { left: -200, top: -50, right: 40, bottom: 50 };
    expect(letter([{ ...mark(0, 0), room }])).toEqual(['left']);
    expect(letter([{ ...mark(0, 0), room: { left: -10, top: -10, right: 10, bottom: 10 } }])).toEqual([null]);
  });

  it('writes nothing for a mark that has no name', () => {
    expect(letter([mark(0, 0, 0)])).toEqual([null]);
  });

  it('leaves a mark without its name when there is no room on any side', () => {
    const crowd = [mark(0, 0), mark(30, 0), mark(-30, 0), mark(0, 24), mark(0, -24)];
    expect(letter(crowd)[0]).toBeNull();
  });
});
