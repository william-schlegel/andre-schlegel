import list from './missions.json';
import type { Mission } from './types';

/**
 * The Missions list: André Schlegel's sorties from Elvington, July 1944 – March 1945, as the Film
 * gives them in two tables (one for each period). Place names are written as French writes them
 * today; nothing else is added to what the tables say.
 */
export const MISSIONS = list as Mission[];

export function missionsOf(period: 1 | 2): Mission[] {
  return MISSIONS.filter((mission) => mission.period === period);
}

/** 1944-07-25 → 25.07.44, as a typist of the time would write it. */
export function typedDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${day}.${month}.${year.slice(2)}`;
}

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** 1944-07-25 → 25 juillet 1944. */
export function writtenDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${Number(day) === 1 ? '1er' : Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}
