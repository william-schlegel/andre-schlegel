import carnet1938 from './generated/carnet-1938.json';
import carnet1940 from './generated/carnet-1940.json';
import type { CarnetId } from './types';

/**
 * The Carnets de vol, as books. A "view" is what the open book shows: 0 is the closed book,
 * and view n shows the nth scan. A scan taller than wide is a single right-hand page (the
 * title page); the others are Spreads, left and right page together.
 */

interface Scan {
  index: number;
  scan: string;
  folder: string;
  width: number;
  height: number;
}

export interface Carnet {
  id: CarnetId;
  /** As written on its title page. */
  title: string;
  holder: string;
  opened: string;
  scans: Scan[];
}

export const CARNETS: Partial<Record<CarnetId, Carnet>> = {
  '1938': {
    id: '1938',
    title: 'Carnet individuel des services aériens',
    holder: 'Sous-lieutenant Schlegel, observateur',
    opened: 'Tours, le 2 juin 1938',
    scans: carnet1938,
  },
  '1940': {
    id: '1940',
    title: 'Carnet individuel des services aériens',
    holder: 'Lieutenant Schlegel, observateur',
    opened: 'Souk-el-Arba, le 9 juillet 1940',
    scans: carnet1940,
  },
};

export function carnetOf(id: CarnetId): Carnet {
  const carnet = CARNETS[id];
  if (!carnet) throw new Error(`The Carnet of ${id} is not built yet`);
  return carnet;
}

/** The last view of the book. */
export function lastView(id: CarnetId): number {
  return carnetOf(id).scans.length;
}

export function isSinglePage(id: CarnetId, view: number): boolean {
  const scan = carnetOf(id).scans[view - 1];
  return !!scan && scan.width < scan.height;
}

export function scanUrl(id: CarnetId, view: number, sharp: boolean): string {
  return `/media/carnets/${id}/${String(view).padStart(2, '0')}${sharp ? '' : '_s'}.webp`;
}
