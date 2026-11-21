/**
 * What the Chart knows: the places of the story, and the sheets it is cut into. A sheet is a
 * part of the Chart laid on the table during a Chapter. Longitudes and latitudes in degrees.
 */

export interface ChartPlace {
  name: string;
  at: [number, number];
  /** Where the name is written, relative to the dot. */
  label?: 'right' | 'left' | 'above' | 'below';
}

/** Towns drawn on the Chart for orientation. */
export const TOWNS: ChartPlace[] = [
  { name: 'Paris', at: [2.35, 48.86] },
  { name: 'Brest', at: [-4.49, 48.39], label: 'above' },
  { name: 'Nantes', at: [-1.55, 47.22], label: 'below' },
  { name: 'Bordeaux', at: [-0.58, 44.84] },
  { name: 'Toulouse', at: [1.44, 43.6], label: 'below' },
  { name: 'Marseille', at: [5.37, 43.3], label: 'left' },
  { name: 'Lyon', at: [4.83, 45.76] },
  { name: 'Strasbourg', at: [7.75, 48.57], label: 'left' },
  { name: 'Lille', at: [3.06, 50.63] },
  { name: 'Le Havre', at: [0.11, 49.49], label: 'above' },
  { name: 'Orléans', at: [1.91, 47.9], label: 'above' },
  { name: 'Limoges', at: [1.26, 45.83] },
  { name: 'Dijon', at: [5.04, 47.32] },
  { name: 'Londres', at: [-0.12, 51.5] },
  { name: 'Bruxelles', at: [4.35, 50.85] },
  { name: 'Genève', at: [6.14, 46.2] },
];

/** The places of André Schlegel's career: inked on the Chart as the Narration reaches them. */
export const POSTS = {
  tours: { name: 'TOURS', note: 'Base 131', at: [0.69, 47.39] as [number, number] },
} as const;

export type PostId = keyof typeof POSTS;

export interface Lettering {
  text: string;
  at: [number, number];
  /** Degrees, counter-clockwise. */
  turn?: number;
  size?: number;
}

/** Rivers, as a draughtsman would trace them at this scale. */
export const RIVERS: [number, number][][] = [
  // Loire
  [[4.22, 44.83], [3.95, 45.05], [4.2, 45.5], [4.07, 46.04], [3.98, 46.48], [3.5, 46.82], [3.16, 46.99], [2.93, 47.41], [2.63, 47.69], [1.91, 47.9], [1.33, 47.59], [0.69, 47.39], [0.07, 47.24], [-0.52, 47.42], [-1.18, 47.37], [-1.55, 47.21], [-2.18, 47.28]],
  // Seine
  [[4.72, 47.49], [4.45, 47.95], [4.07, 48.3], [3.5, 48.5], [2.95, 48.38], [2.66, 48.54], [2.35, 48.86], [2.05, 48.92], [1.72, 48.99], [1.48, 49.09], [1.2, 49.3], [1.09, 49.44], [0.6, 49.48], [0.2, 49.47]],
  // Garonne and Gironde
  [[0.72, 42.72], [0.72, 43.11], [1.05, 43.3], [1.44, 43.6], [1.1, 44.0], [0.62, 44.2], [0.16, 44.5], [-0.25, 44.6], [-0.57, 44.84], [-0.72, 45.2], [-1.05, 45.55]],
  // Rhône
  [[6.15, 46.21], [5.82, 46.1], [5.72, 45.75], [5.3, 45.75], [4.83, 45.76], [4.87, 45.52], [4.82, 45.2], [4.89, 44.93], [4.75, 44.56], [4.72, 44.2], [4.8, 43.95], [4.63, 43.68], [4.85, 43.35]],
  // Saône
  [[5.95, 47.75], [5.59, 47.45], [5.3, 47.15], [4.85, 46.78], [4.83, 46.31], [4.83, 45.76]],
  // Rhin
  [[9.5, 47.55], [8.6, 47.6], [7.59, 47.56], [7.6, 48.0], [7.8, 48.57], [8.25, 49.0], [8.45, 49.5], [8.27, 50.0], [7.75, 50.2], [7.6, 50.36], [7.2, 50.7], [6.96, 50.94], [6.77, 51.23], [6.6, 51.6]],
  // Dordogne
  [[2.75, 45.55], [2.2, 45.2], [1.6, 44.9], [0.5, 44.85], [-0.25, 44.92], [-0.55, 45.03]],
  // Meuse
  [[5.6, 48.0], [5.4, 48.75], [5.38, 49.16], [4.95, 49.7], [4.75, 50.1], [4.87, 50.47], [5.57, 50.64], [5.7, 51.0]],
];

/** High ground, hinted by hachures: [longitude, latitude, radius along x in degrees, radius along y, strength]. */
export const RELIEF: [number, number, number, number, number][] = [
  [6.6, 45.4, 1.1, 1.6, 1],
  [7.3, 44.3, 0.7, 0.9, 0.9],
  [8.3, 46.4, 2.0, 0.7, 1],
  [0.4, 42.7, 2.6, 0.45, 1],
  [2.9, 45.1, 1.0, 1.1, 0.7],
  [3.6, 44.4, 0.6, 0.6, 0.6],
  [7.0, 48.1, 0.3, 0.75, 0.55],
  [6.0, 46.6, 0.45, 0.8, 0.5],
  [8.1, 48.1, 0.3, 0.8, 0.45],
  [-5.0, 43.0, 2.4, 0.4, 0.6],
  [9.1, 42.2, 0.3, 0.7, 0.6],
];

export interface ChartSheet {
  /** The part of the world on the sheet: [west, south] and [east, north]. */
  box: [[number, number], [number, number]];
  /** Standard parallels and central meridian of its conic projection. */
  parallels: [number, number];
  meridian: number;
  title: string;
  /** Width of the sheet on the table, in metres; its depth follows from the projection. */
  width: number;
  /** Width over depth. */
  proportions: number;
  countries: Lettering[];
  seas: Lettering[];
  /** Where the title block and the compass rose stand (in open sea). */
  cartouche: [number, number];
  rose: [number, number];
  /** The country the sheet is about, by its Natural Earth name. */
  subject: string;
}

export const SHEETS = {
  france: {
    box: [
      [-5.9, 41.2],
      [9.9, 51.45],
    ],
    parallels: [44, 49],
    meridian: 2.4,
    title: 'FRANCE',
    width: 0.64,
    proportions: 1.08,
    subject: 'France',
    countries: [
      { text: 'ESPAGNE', at: [-2.6, 42.25], size: 30 },
      { text: 'ITALIE', at: [8.4, 44.75], size: 28 },
      { text: 'SUISSE', at: [8.1, 46.85], size: 24 },
      { text: 'ALLEMAGNE', at: [8.55, 49.6], turn: -64, size: 28 },
      { text: 'BELGIQUE', at: [4.6, 50.55], turn: -14, size: 22 },
      { text: 'ANGLETERRE', at: [-1.9, 51.05], size: 26 },
    ],
    seas: [
      { text: 'Océan Atlantique', at: [-4.6, 46.95], size: 27 },
      { text: 'Manche', at: [-1.9, 50.0], turn: 14, size: 34 },
      { text: 'Golfe de Gascogne', at: [-3.4, 44.2], size: 24 },
      { text: 'Mer Méditerranée', at: [5.6, 42.3], turn: 0, size: 32 },
    ],
    cartouche: [-4.05, 45.5],
    rose: [7.0, 42.35],
  },
} satisfies Record<string, ChartSheet>;

export type SheetId = keyof typeof SHEETS;
