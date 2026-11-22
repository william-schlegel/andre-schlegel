import { geoConicConformal, geoPath, type GeoProjection } from 'd3-geo';
import type { MultiPolygon } from 'geojson';
import { RELIEF, RIVERS, SHEETS, TOWNS, type ChartSheet, type Lettering, type SheetId } from './places';

/**
 * Draws a sheet of the Chart: a map made for the site, in the manner of the aeronautical
 * charts of the 1930s (see docs/adr/0002). Coastlines and borders come from Natural Earth
 * (pipeline/chart.mjs); rivers, relief and lettering are set by hand in places.ts.
 */

export interface Land {
  name: string;
  polygons: number[][][][];
}

/** Pixels of the drawing; the sheet's depth follows from its proportions. */
export const SHEET_PIXELS = 2048;
const MARGIN = 104; // from the sheet's edge to the neat line

const INK = '#2a2620';
const SEA_INK = '#3f647c';

export function sheetSize(id: SheetId): { width: number; depth: number; pixels: [number, number] } {
  const sheet: ChartSheet = SHEETS[id];
  return { width: sheet.width, depth: sheet.width / sheet.proportions, pixels: [SHEET_PIXELS, Math.round(SHEET_PIXELS / sheet.proportions)] };
}

export function sheetProjection(id: SheetId): GeoProjection {
  const sheet: ChartSheet = SHEETS[id];
  const [width, height] = sheetSize(id).pixels;
  const [[west, south], [east, north]] = sheet.box;
  const corners: [number, number][] = [];
  for (let i = 0; i <= 8; i++) {
    const lon = west + ((east - west) * i) / 8;
    const lat = south + ((north - south) * i) / 8;
    corners.push([lon, south], [lon, north], [west, lat], [east, lat]);
  }
  return geoConicConformal()
    .parallels(sheet.parallels)
    .rotate([-sheet.meridian, 0])
    .fitExtent(
      [
        [MARGIN, MARGIN],
        [width - MARGIN, height - MARGIN],
      ],
      { type: 'MultiPoint', coordinates: corners },
    );
}

/** Where a place falls on the sheet lying on the table: metres from the sheet's centre. */
export function onSheet(id: SheetId, at: [number, number]): { x: number; z: number } {
  const { width, depth, pixels } = sheetSize(id);
  const [px, py] = sheetProjection(id)(at)!;
  return { x: (px / pixels[0] - 0.5) * width, z: (py / pixels[1] - 0.5) * depth };
}

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number): void {
  // letters set apart, as a draughtsman letters a country's name
  const widths = text.split('').map((letter) => ctx.measureText(letter).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + spacing * (text.length - 1);
  let cursor = x - total / 2;
  const align = ctx.textAlign;
  ctx.textAlign = 'left';
  text.split('').forEach((letter, index) => {
    ctx.fillText(letter, cursor, y);
    cursor += widths[index] + spacing;
  });
  ctx.textAlign = align;
}

function lettering(ctx: CanvasRenderingContext2D, projection: GeoProjection, item: Lettering, font: (size: number) => string, colour: string, spacing: number): void {
  const [x, y] = projection(item.at)!;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((-(item.turn ?? 0) * Math.PI) / 180);
  ctx.font = font(item.size ?? 26);
  ctx.fillStyle = colour;
  ctx.textBaseline = 'middle';
  spaced(ctx, item.text, 0, 0, spacing * (item.size ?? 26));
  ctx.restore();
}

export function drawSheet(id: SheetId, lands: Land[]): HTMLCanvasElement {
  const sheet: ChartSheet = SHEETS[id];
  const [width, height] = sheetSize(id).pixels;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const projection = sheetProjection(id);
  const path = geoPath(projection, ctx);
  const random = seeded(1936);
  const [[west, south], [east, north]] = sheet.box;

  const shape = (land: Land): MultiPolygon => ({ type: 'MultiPolygon', coordinates: land.polygons });
  const trace = (selection: Land[]) => {
    ctx.beginPath();
    for (const land of selection) path(shape(land));
  };
  const subject = lands.filter((land) => sheet.subject.includes(land.name));

  // ----- the paper -----
  ctx.fillStyle = '#e8dcbc';
  ctx.fillRect(0, 0, width, height);

  const inner = { x: MARGIN, y: MARGIN, w: width - 2 * MARGIN, h: height - 2 * MARGIN };
  ctx.save();
  ctx.beginPath();
  ctx.rect(inner.x, inner.y, inner.w, inner.h);
  ctx.clip();

  // ----- the sea, with its lines following the coast -----
  ctx.fillStyle = '#cdd9d3';
  ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
  trace(lands);
  ctx.lineJoin = 'round';
  for (const [lineWidth, alpha] of [
    [78, 0.05],
    [58, 0.06],
    [40, 0.07],
    [25, 0.09],
    [12, 0.13],
  ] as const) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = `rgba(78, 122, 142, ${alpha})`;
    ctx.stroke();
  }

  // ----- the land -----
  trace(lands);
  ctx.fillStyle = '#e3d8b8';
  ctx.fill();
  trace(subject);
  ctx.fillStyle = '#efe5c6';
  ctx.fill();

  // high ground: short hachures, thicker where it is higher
  ctx.save();
  trace(lands);
  ctx.clip();
  // a sheet of a smaller scale shows the same heights with fewer, shorter strokes
  const fine = sheet.whole ? 0.55 : 1;
  for (const [lon, lat, rx, ry, strength] of sheet.world ? [] : RELIEF) {
    const strokes = Math.round((620 * rx * ry * strength + 70) * fine);
    for (let i = 0; i < strokes; i++) {
      // denser towards the middle of the massif
      const angle = random() * Math.PI * 2;
      const radius = Math.pow(random(), 0.75);
      const point = projection([lon + Math.cos(angle) * radius * rx, lat + Math.sin(angle) * radius * ry]);
      if (!point) continue;
      // hachures run down the slope, away from the heights
      const length = (3 + random() * 6 + 4 * radius) * (sheet.whole ? 0.7 : 1);
      const lean = Math.atan2(Math.sin(angle) * ry, Math.cos(angle) * rx) + (random() - 0.5) * 0.7;
      ctx.strokeStyle = `rgba(122, 92, 56, ${(0.2 + 0.3 * (1 - radius)) * strength})`;
      ctx.lineWidth = 1 + (1 - radius) * 1.2;
      ctx.beginPath();
      ctx.moveTo(point[0], point[1]);
      ctx.lineTo(point[0] + Math.cos(lean) * length, point[1] - Math.sin(lean) * length);
      ctx.stroke();
    }
  }
  ctx.restore();

  // ----- meridians and parallels: every degree; every five on the whole Chart, every ten on a sheet that holds continents -----
  const step = sheet.world ? 10 : sheet.whole ? 5 : 1;
  const firstOnOrAfter = (value: number) => Math.ceil(value / step) * step;
  ctx.strokeStyle = 'rgba(42, 38, 32, 0.2)';
  ctx.lineWidth = 1;
  for (let lon = firstOnOrAfter(west) - 2 * step; lon <= east + 2 * step; lon += step) {
    ctx.beginPath();
    path({ type: 'LineString', coordinates: Array.from({ length: 30 }, (_, i) => [lon, south - 2 + ((north - south + 4) * i) / 29]) });
    ctx.stroke();
  }
  for (let lat = firstOnOrAfter(south) - step; lat <= north + step; lat += step) {
    // the equator is drawn firmer, in dashes
    const equator = sheet.world && lat === 0;
    ctx.strokeStyle = equator ? 'rgba(63, 100, 124, 0.7)' : 'rgba(42, 38, 32, 0.2)';
    ctx.lineWidth = equator ? 1.6 : 1;
    ctx.setLineDash(equator ? [14, 9] : []);
    ctx.beginPath();
    path({ type: 'LineString', coordinates: Array.from({ length: 40 }, (_, i) => [west - 3 + ((east - west + 6) * i) / 39, lat]) });
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // ----- rivers -----
  ctx.strokeStyle = 'rgba(63, 100, 124, 0.85)';
  ctx.lineCap = 'round';
  for (const river of sheet.world ? [] : RIVERS) {
    const points = river.map((at) => projection(at)!);
    // the stream widens towards its mouth
    for (let i = 1; i < points.length; i++) {
      ctx.lineWidth = (1.2 + (2.4 * i) / points.length) * (sheet.whole ? 0.7 : 1);
      ctx.beginPath();
      const previous = points[i - 1];
      const before = points[Math.max(0, i - 2)];
      const here = points[i];
      const after = points[Math.min(points.length - 1, i + 1)];
      // a Catmull-Rom span, so the river bends rather than breaks
      ctx.moveTo(previous[0], previous[1]);
      ctx.bezierCurveTo(
        previous[0] + (here[0] - before[0]) / 6,
        previous[1] + (here[1] - before[1]) / 6,
        here[0] - (after[0] - previous[0]) / 6,
        here[1] - (after[1] - previous[1]) / 6,
        here[0],
        here[1],
      );
      ctx.stroke();
    }
  }

  // ----- coasts and borders -----
  trace(lands);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // the sheet's subject is edged in red, inside its border, as on the maps of the time
  ctx.save();
  trace(subject);
  ctx.clip();
  trace(subject);
  ctx.strokeStyle = 'rgba(168, 40, 30, 0.2)';
  ctx.lineWidth = 22;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(168, 40, 30, 0.3)';
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.restore();

  // ----- lettering -----
  ctx.textAlign = 'center';
  for (const item of sheet.countries) lettering(ctx, projection, item, (size) => `400 ${size}px "Old Standard TT", serif`, 'rgba(42, 38, 32, 0.62)', 0.42);
  for (const item of sheet.seas) lettering(ctx, projection, item, (size) => `italic 400 ${size}px "Old Standard TT", serif`, SEA_INK, 0.12);

  // ----- towns -----
  for (const town of TOWNS) {
    if (sheet.world || sheet.whole ? town.sheet !== id : town.sheet && town.sheet !== id) continue;
    const point = projection(town.at);
    if (!point) continue;
    const [x, y] = point;
    if (x < inner.x + 20 || x > inner.x + inner.w - 20 || y < inner.y + 20 || y > inner.y + inner.h - 20) continue;
    const capital = town.name === sheet.capital;
    ctx.beginPath();
    ctx.arc(x, y, capital ? 7 : 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f3ead0';
    ctx.fill();
    ctx.lineWidth = capital ? 2.4 : 1.8;
    ctx.strokeStyle = INK;
    ctx.stroke();
    if (capital) {
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = INK;
      ctx.fill();
    }
    ctx.font = capital ? '700 30px "Old Standard TT", serif' : '400 23px "Old Standard TT", serif';
    ctx.fillStyle = INK;
    const side = town.label ?? 'right';
    ctx.textAlign = side === 'right' ? 'left' : side === 'left' ? 'right' : 'center';
    ctx.textBaseline = side === 'above' ? 'bottom' : side === 'below' ? 'top' : 'middle';
    const gap = capital ? 13 : 9;
    const name = capital ? town.name.toUpperCase() : town.name;
    // a little paper cleared under the name, so the lines do not run through it
    const dx = side === 'right' ? gap : side === 'left' ? -gap : 0;
    const dy = side === 'above' ? -gap : side === 'below' ? gap : 0;
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(239, 229, 198, 0.75)';
    ctx.strokeText(name, x + dx, y + dy);
    ctx.fillText(name, x + dx, y + dy);
  }

  // ----- the compass rose -----
  const rose = projection(sheet.rose)!;
  drawRose(ctx, rose[0], rose[1], 74);

  // ----- the title block -----
  const block = projection(sheet.cartouche)!;
  drawCartouche(ctx, block[0], block[1], sheet, projection);

  ctx.restore();

  // ----- the neat line and the degrees in the margin -----
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.strokeRect(inner.x - 16, inner.y - 16, inner.w + 32, inner.h + 32);
  ctx.lineWidth = 1.4;
  ctx.strokeRect(inner.x, inner.y, inner.w, inner.h);
  ctx.fillStyle = INK;
  ctx.font = '400 20px "Special Elite", monospace';
  ctx.textBaseline = 'middle';
  for (let lon = firstOnOrAfter(west); lon <= Math.floor(east); lon += step) {
    for (const [lat, y] of [
      [north, inner.y - 40],
      [south, inner.y + inner.h + 42],
    ] as const) {
      const edge = crossing(projection, [lon, lat - 3], [lon, lat + 3], 'y', lat === north ? inner.y : inner.y + inner.h);
      if (edge === null || edge < inner.x + 10 || edge > inner.x + inner.w - 10) continue;
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.abs(lon)}°${lon === 0 ? '' : lon < 0 ? ' O' : ' E'}`, edge, y);
    }
  }
  for (let lat = firstOnOrAfter(south); lat <= Math.floor(north); lat += step) {
    for (const [lon, x, align] of [
      [west, inner.x - 26, 'right'],
      [east, inner.x + inner.w + 26, 'left'],
    ] as const) {
      const edge = crossing(projection, [lon - 3, lat], [lon + 3, lat], 'x', lon === west ? inner.x : inner.x + inner.w);
      if (edge === null || edge < inner.y + 10 || edge > inner.y + inner.h - 10) continue;
      ctx.textAlign = align;
      // a sheet that crosses the equator says which side of it a parallel is on
      ctx.fillText(sheet.world ? `${Math.abs(lat)}°${lat === 0 ? '' : lat < 0 ? ' S' : ' N'}` : `${lat}°`, x, edge);
    }
  }
  ctx.textAlign = 'center';
  ctx.font = '400 17px "Special Elite", monospace';
  ctx.fillStyle = 'rgba(42, 38, 32, 0.7)';
  ctx.fillText('Carte dessinée pour ce récit, à la manière des cartes aéronautiques des années 1930', width / 2, height - 30);

  // ----- age: stains, the folds of a chart carried in a map case, grain -----
  for (let i = 0; i < 26; i++) {
    const x = random() * width;
    const y = random() * height;
    const radius = 60 + random() * 260;
    const stain = ctx.createRadialGradient(x, y, 0, x, y, radius);
    stain.addColorStop(0, `rgba(150, 110, 60, ${0.03 + random() * 0.05})`);
    stain.addColorStop(1, 'rgba(150, 110, 60, 0)');
    ctx.fillStyle = stain;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  const fold = (x0: number, y0: number, x1: number, y1: number) => {
    const across = x0 === x1 ? [1, 0] : [0, 1];
    for (const [offset, colour] of [
      [-2, 'rgba(255, 250, 235, 0.35)'],
      [0, 'rgba(70, 50, 30, 0.22)'],
      [2.5, 'rgba(70, 50, 30, 0.08)'],
    ] as const) {
      ctx.strokeStyle = colour;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0 + across[0] * offset, y0 + across[1] * offset);
      ctx.lineTo(x1 + across[0] * offset, y1 + across[1] * offset);
      ctx.stroke();
    }
  };
  fold(width / 3, 0, width / 3, height);
  fold((2 * width) / 3, 0, (2 * width) / 3, height);
  fold(0, height / 2, width, height / 2);
  const edge = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.35, width / 2, height / 2, Math.max(width, height) * 0.75);
  edge.addColorStop(0, 'rgba(120, 85, 40, 0)');
  edge.addColorStop(1, 'rgba(120, 85, 40, 0.2)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

/** Where the line between two places crosses a vertical ('x') or horizontal ('y') line of the drawing. */
function crossing(projection: GeoProjection, from: [number, number], to: [number, number], axis: 'x' | 'y', value: number): number | null {
  const a = projection(from);
  const b = projection(to);
  if (!a || !b) return null;
  const [along, other] = axis === 'y' ? [1, 0] : [0, 1];
  if (a[along] === b[along]) return null;
  const t = (value - a[along]) / (b[along] - a[along]);
  if (t < 0 || t > 1) return null;
  return a[other] + (b[other] - a[other]) * t;
}

function drawRose(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = SEA_INK;
  ctx.fillStyle = SEA_INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.82, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 72; i++) {
    const angle = (i * Math.PI) / 36;
    const long = i % 9 === 0;
    ctx.beginPath();
    ctx.moveTo(Math.sin(angle) * radius, -Math.cos(angle) * radius);
    ctx.lineTo(Math.sin(angle) * radius * (long ? 0.82 : 0.91), -Math.cos(angle) * radius * (long ? 0.82 : 0.91));
    ctx.stroke();
  }
  // the points: north the longest
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const reach = radius * (i === 0 ? 1.34 : i % 2 === 0 ? 0.78 : 0.48);
    const waist = radius * 0.11;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -reach);
    ctx.lineTo(waist, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -reach);
    ctx.lineTo(-waist, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
  ctx.font = '700 28px "Old Standard TT", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('N', 0, -radius * 1.38);
  ctx.restore();
}

function drawCartouche(ctx: CanvasRenderingContext2D, x: number, y: number, sheet: ChartSheet, projection: GeoProjection): void {
  const w = 440;
  const h = 236;
  ctx.save();
  ctx.translate(x - w / 2, y - h / 2);
  ctx.fillStyle = 'rgba(236, 226, 198, 0.94)';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, w, h);
  ctx.lineWidth = 1;
  ctx.strokeRect(7, 7, w - 14, h - 14);
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  // a long title is set smaller, to stay inside the block
  const long = sheet.title.length > 8;
  let size = long ? 32 : 58;
  const spacing = long ? 5 : 14;
  const fits = () => {
    ctx.font = `700 ${size}px "Old Standard TT", serif`;
    return ctx.measureText(sheet.title).width + spacing * (sheet.title.length - 1) <= w - 56;
  };
  while (!fits() && size > 18) size -= 1;
  spaced(ctx, sheet.title, w / 2, long ? 68 : 76, spacing);
  ctx.font = 'italic 400 25px "Old Standard TT", serif';
  ctx.fillText('Carte aéronautique', w / 2, 112);
  ctx.fillRect(w / 2 - 70, 126, 140, 1.5);

  // the scale: a hundred kilometres (a thousand on a sheet that holds continents) measured along the sheet's middle parallel
  const [[west], [east]] = sheet.box;
  const latitude = (sheet.parallels[0] + sheet.parallels[1]) / 2;
  const middle = (west + east) / 2;
  const kilometres = sheet.world ? 1000 : 100;
  const degreesForUnit = kilometres / (111.32 * Math.cos((latitude * Math.PI) / 180));
  const a = projection([middle, latitude])!;
  const b = projection([middle + degreesForUnit, latitude])!;
  const unit = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const start = w / 2 - unit;
  for (let i = 0; i < 2; i++) {
    ctx.fillStyle = i % 2 === 0 ? INK : 'rgba(236, 226, 198, 1)';
    ctx.fillRect(start + unit * i, 160, unit, 9);
    ctx.strokeRect(start + unit * i, 160, unit, 9);
  }
  ctx.fillStyle = INK;
  ctx.font = '400 17px "Special Elite", monospace';
  for (let i = 0; i <= 2; i++) ctx.fillText(String(i * kilometres), start + unit * i, 194);
  ctx.fillText('kilomètres', w / 2, 216);
  ctx.restore();
}
