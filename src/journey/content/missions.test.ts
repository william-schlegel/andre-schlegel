import { describe, expect, it } from 'vitest';
import reconstructed from './generated/carnet-1940-reconstructed.json';
import { missions } from './missions';
import { MISSIONS, missionsOf, typedDate, writtenDate } from './missionsList';
import { carnetOf, reconstructedMonth } from './carnets';
import type { MissionsCue, SpreadCue } from './types';

describe('the Missions list', () => {
  it('gives the sorties of each period in the order they were flown', () => {
    expect(missionsOf(1)).toHaveLength(16);
    expect(missionsOf(2)).toHaveLength(26);
    const dates = MISSIONS.map((mission) => mission.date);
    expect(dates).toEqual([...dates].sort());
    expect(new Set(dates).size).toBe(dates.length);
  });

  it('writes a date as a typist and as a reader would', () => {
    expect(typedDate('1944-07-25')).toBe('25.07.44');
    expect(writtenDate('1944-08-01')).toBe('1er août 1944');
    expect(writtenDate('1945-02-14')).toBe('14 février 1945');
  });

  it('underlines only sorties that are on the sheet of their period', () => {
    const sheets = missions.cues.filter((cue): cue is MissionsCue => cue.kind === 'missions');
    expect(sheets).toHaveLength(2);
    for (const sheet of sheets) {
      const dates = missionsOf(sheet.period).map((mission) => mission.date);
      for (const told of sheet.told) expect(dates).toContain(told.date);
    }
  });
});

describe('the Reconstructed Spreads', () => {
  it('follow the last scan of the Carnet of 1940, one a month from October 1944 to March 1945', () => {
    const scans = carnetOf('1940').scans;
    expect(reconstructed.map((spread) => spread.reconstructed)).toEqual(['octobre 1944', 'novembre 1944', 'décembre 1944', 'janvier 1945', 'février 1945', 'mars 1945']);
    expect(reconstructed[0].index).toBe(scans.length - reconstructed.length + 1);
    expect(reconstructedMonth('1940', reconstructed[0].index - 1)).toBeNull();
    expect(reconstructedMonth('1940', reconstructed[0].index)).toBe('octobre 1944');
  });

  it('carry every sortie of the second period, and nothing else', () => {
    expect(reconstructed.flatMap((spread) => spread.missions)).toEqual(missionsOf(2).map((mission) => mission.date));
  });

  it('are the pages the Companion opens at for the sorties flown after September 1944', () => {
    const spreads = missions.cues.filter((cue): cue is SpreadCue => cue.kind === 'spread');
    const months = spreads.map((cue) => reconstructedMonth(cue.carnet, cue.spread));
    expect(months).toEqual([null, null, 'octobre 1944', 'décembre 1944', 'décembre 1944', 'février 1945']);
  });
});
