import { whenFontsReady } from '../stage/textures';
import { drawSheet, type Land } from './draw';
import { SHEETS, type ChartSheet, type SheetId } from './places';

const drawn = new Map<SheetId, Promise<HTMLCanvasElement>>();

/** A sheet's drawing, made once (the coastlines are fetched apart from the rest of the site). */
export function sheetDrawing(id: SheetId): Promise<HTMLCanvasElement> {
  let drawing = drawn.get(id);
  if (!drawing) {
    // a sheet that holds continents is drawn from the small-scale outlines
    const outlines = (SHEETS[id] as ChartSheet).world ? import('../content/generated/chart-monde.json') : import('../content/generated/chart-land.json');
    drawing = Promise.all([outlines, whenFontsReady()]).then(([land]) => drawSheet(id, land.default as Land[]));
    drawn.set(id, drawing);
  }
  return drawing;
}
