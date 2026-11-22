/**
 * What the Chart knows: the places of the story, and the sheets it is cut into. A sheet is a
 * part of the Chart laid on the table during a Chapter. Longitudes and latitudes in degrees.
 */

export interface ChartPlace {
  name: string;
  at: [number, number];
  /** Where the name is written, relative to the dot. */
  label?: 'right' | 'left' | 'above' | 'below';
  /** A small town, drawn only on the sheet whose scale has room for it. */
  sheet?: string;
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
  // North Africa and the south of Spain
  { name: 'Alger', at: [3.06, 36.75], label: 'above' },
  { name: 'Tunis', at: [10.18, 36.8], label: 'left' },
  { name: 'Rabat', at: [-6.83, 34.02], label: 'left' },
  { name: 'Casablanca', at: [-7.6, 33.59], label: 'below' },
  { name: 'Marrakech', at: [-8.0, 31.63] },
  { name: 'Tanger', at: [-5.8, 35.77], label: 'left' },
  { name: 'Gibraltar', at: [-5.35, 36.14], label: 'above' },
  { name: 'Tlemcen', at: [-1.32, 34.88], label: 'below' },
  { name: 'Constantine', at: [6.61, 36.36], label: 'above' },
  { name: 'Bône', at: [7.77, 36.9], label: 'above' },
  { name: 'Sfax', at: [10.76, 34.74], label: 'left' },
  { name: 'Laghouat', at: [2.88, 33.8] },
  { name: 'Touggourt', at: [6.07, 33.1] },
  { name: 'Colomb-Béchar', at: [-2.22, 31.62] },
  { name: 'Séville', at: [-5.98, 37.39], label: 'above' },
  { name: 'Carthagène', at: [-0.99, 37.6], label: 'above' },
  // the north of France, at the scale of the campaign of 1940
  { name: 'Rouen', at: [1.1, 49.44], label: 'above', sheet: 'nord-de-la-france' },
  { name: 'Amiens', at: [2.3, 49.9], label: 'below', sheet: 'nord-de-la-france' },
  { name: 'Abbeville', at: [1.83, 50.11], label: 'left', sheet: 'nord-de-la-france' },
  { name: 'Saint-Quentin', at: [3.29, 49.85], sheet: 'nord-de-la-france' },
  { name: 'Arras', at: [2.78, 50.29], label: 'left', sheet: 'nord-de-la-france' },
  { name: 'Cambrai', at: [3.23, 50.18], sheet: 'nord-de-la-france' },
  { name: 'Calais', at: [1.86, 50.95], label: 'below', sheet: 'nord-de-la-france' },
  { name: 'Reims', at: [4.03, 49.26], sheet: 'nord-de-la-france' },
  { name: 'Troyes', at: [4.07, 48.3], sheet: 'nord-de-la-france' },
  { name: 'Chartres', at: [1.49, 48.45], label: 'left', sheet: 'nord-de-la-france' },
  { name: 'Le Mans', at: [0.2, 48.0], label: 'left', sheet: 'nord-de-la-france' },
  { name: 'Tours', at: [0.69, 47.39], label: 'below', sheet: 'nord-de-la-france' },
  { name: 'Caen', at: [-0.37, 49.18], label: 'below', sheet: 'nord-de-la-france' },
  { name: 'Cherbourg', at: [-1.62, 49.64], label: 'below', sheet: 'nord-de-la-france' },
  { name: 'Rennes', at: [-1.68, 48.11], sheet: 'nord-de-la-france' },
  { name: 'Bourges', at: [2.4, 47.08], sheet: 'nord-de-la-france' },
  { name: 'Auxerre', at: [3.57, 47.8], sheet: 'nord-de-la-france' },
  { name: 'Metz', at: [6.18, 49.12], label: 'left', sheet: 'nord-de-la-france' },
  { name: 'Nancy', at: [6.18, 48.69], label: 'left', sheet: 'nord-de-la-france' },
  // Algeria and Morocco, at the scale of the years 1940-1943
  { name: 'Málaga', at: [-4.42, 36.72], label: 'above', sheet: 'maroc-algerie' },
  { name: 'Almería', at: [-2.46, 36.84], label: 'above', sheet: 'maroc-algerie' },
  { name: 'Grenade', at: [-3.6, 37.18], sheet: 'maroc-algerie' },
  { name: 'Alicante', at: [-0.48, 38.35], label: 'left', sheet: 'maroc-algerie' },
  { name: 'Melilla', at: [-2.94, 35.29], label: 'below', sheet: 'maroc-algerie' },
  { name: 'Oujda', at: [-1.91, 34.68], label: 'left', sheet: 'maroc-algerie' },
  { name: 'Taza', at: [-4.01, 34.21], label: 'below', sheet: 'maroc-algerie' },
  { name: 'Sidi-bel-Abbès', at: [-0.63, 35.19], label: 'below', sheet: 'maroc-algerie' },
  { name: 'Tiaret', at: [1.32, 35.37], sheet: 'maroc-algerie' },
  { name: 'Orléansville', at: [1.33, 36.17], label: 'above', sheet: 'maroc-algerie' },
  { name: 'Djelfa', at: [3.25, 34.67], sheet: 'maroc-algerie' },
  { name: 'Bougie', at: [5.08, 36.75], label: 'above', sheet: 'maroc-algerie' },
  // Great Britain, at the scale of the schools of 1943-1944 (the towns the posts' names would run over are left out)
  { name: 'Édimbourg', at: [-3.19, 55.95], sheet: 'grande-bretagne' },
  { name: 'Glasgow', at: [-4.25, 55.86], label: 'left', sheet: 'grande-bretagne' },
  { name: 'Aberdeen', at: [-2.1, 57.15], sheet: 'grande-bretagne' },
  { name: 'Inverness', at: [-4.22, 57.48], label: 'left', sheet: 'grande-bretagne' },
  { name: 'Belfast', at: [-5.93, 54.6], label: 'left', sheet: 'grande-bretagne' },
  { name: 'Dublin', at: [-6.26, 53.35], label: 'left', sheet: 'grande-bretagne' },
  { name: 'Birmingham', at: [-1.9, 52.48], sheet: 'grande-bretagne' },
  { name: 'Bristol', at: [-2.59, 51.45], sheet: 'grande-bretagne' },
  { name: 'Cardiff', at: [-3.18, 51.48], label: 'left', sheet: 'grande-bretagne' },
  { name: 'Plymouth', at: [-4.14, 50.37], label: 'above', sheet: 'grande-bretagne' },
  { name: 'Southampton', at: [-1.4, 50.9], label: 'above', sheet: 'grande-bretagne' },
  { name: 'Norwich', at: [1.3, 52.63], label: 'left', sheet: 'grande-bretagne' },
  { name: 'Douvres', at: [1.31, 51.13], label: 'left', sheet: 'grande-bretagne' },
  // from Yorkshire to Saxony, at the scale of the Halifax's reach (York is left out: Elvington's ring stands on it)
  { name: 'Newcastle', at: [-1.61, 54.97], label: 'left', sheet: 'europe-du-nord-ouest' },
  { name: 'Manchester', at: [-2.24, 53.48], label: 'left', sheet: 'europe-du-nord-ouest' },
  { name: 'Birmingham', at: [-1.9, 52.48], label: 'left', sheet: 'europe-du-nord-ouest' },
  { name: 'Bristol', at: [-2.59, 51.45], label: 'left', sheet: 'europe-du-nord-ouest' },
  { name: 'Plymouth', at: [-4.14, 50.37], label: 'above', sheet: 'europe-du-nord-ouest' },
  { name: 'Southampton', at: [-1.4, 50.9], label: 'above', sheet: 'europe-du-nord-ouest' },
  { name: 'Norwich', at: [1.3, 52.63], label: 'left', sheet: 'europe-du-nord-ouest' },
  { name: 'Cherbourg', at: [-1.62, 49.64], label: 'below', sheet: 'europe-du-nord-ouest' },
  { name: 'Caen', at: [-0.37, 49.18], label: 'below', sheet: 'europe-du-nord-ouest' },
  { name: 'Calais', at: [1.86, 50.95], label: 'left', sheet: 'europe-du-nord-ouest' },
  { name: 'Reims', at: [4.03, 49.26], sheet: 'europe-du-nord-ouest' },
  { name: 'Metz', at: [6.18, 49.12], sheet: 'europe-du-nord-ouest' },
  { name: 'Amsterdam', at: [4.9, 52.37], label: 'above', sheet: 'europe-du-nord-ouest' },
  { name: 'Rotterdam', at: [4.48, 51.92], label: 'left', sheet: 'europe-du-nord-ouest' },
  { name: 'Hambourg', at: [9.99, 53.55], sheet: 'europe-du-nord-ouest' },
  { name: 'Brême', at: [8.8, 53.08], label: 'left', sheet: 'europe-du-nord-ouest' },
  { name: 'Kiel', at: [10.13, 54.32], sheet: 'europe-du-nord-ouest' },
  { name: 'Hanovre', at: [9.73, 52.37], sheet: 'europe-du-nord-ouest' },
  { name: 'Berlin', at: [13.4, 52.52], label: 'left', sheet: 'europe-du-nord-ouest' },
  { name: 'Essen', at: [7.01, 51.46], sheet: 'europe-du-nord-ouest' },
  { name: 'Cologne', at: [6.96, 50.94], sheet: 'europe-du-nord-ouest' },
  { name: 'Francfort', at: [8.68, 50.11], label: 'below', sheet: 'europe-du-nord-ouest' },
  { name: 'Leipzig', at: [12.37, 51.34], label: 'left', sheet: 'europe-du-nord-ouest' },
  { name: 'Dresde', at: [13.74, 51.05], sheet: 'europe-du-nord-ouest' },
  { name: 'Nuremberg', at: [11.08, 49.45], label: 'left', sheet: 'europe-du-nord-ouest' },
  { name: 'Stuttgart', at: [9.18, 48.78], label: 'below', sheet: 'europe-du-nord-ouest' },
  { name: 'Munich', at: [11.58, 48.14], sheet: 'europe-du-nord-ouest' },
];

export interface Post {
  name: string;
  note: string;
  at: [number, number];
  /** The name is written to the right of the ring; `label` moves it up (negative) or down, in metres, clear of a Route. */
  label?: number;
}

/** The places of André Schlegel's career: inked on the Chart as the Narration reaches them. */
export const POSTS = {
  tours: { name: 'TOURS', note: 'Base 131', at: [0.69, 47.39] },
  oran: { name: 'ORAN', note: 'La Sénia, base 121', at: [-0.61, 35.62], label: -0.017 },
  biskra: { name: 'BISKRA', note: 'septembre 1939', at: [5.73, 34.85] },
  meknes: { name: 'MEKNÈS', note: 'avril 1940', at: [-5.55, 33.89], label: 0.02 },
  // Damville, south of Évreux: « Danville » in André's hand and on the Film's title
  evreux: { name: 'ÉVREUX', note: 'mai 1940', at: [1.07, 48.87], label: -0.017 },
  pithiviers: { name: 'PITHIVIERS', note: 'juin 1940', at: [2.25, 48.17], label: 0.012 },
  blida: { name: 'BLIDA', note: 'juin 1940', at: [2.83, 36.47], label: 0.013 },
  // the same base as in April, for the week of the raids on Gibraltar
  'meknes-1940': { name: 'MEKNÈS', note: 'septembre 1940', at: [-5.55, 33.89], label: 0.02 },
  // the schools of the Royal Air Force, one after the other
  liverpool: { name: 'LIVERPOOL', note: 'arrivée le 8 octobre 1943', at: [-2.99, 53.41] },
  dumfries: { name: 'DUMFRIES', note: '10 AFU · novembre 1943', at: [-3.61, 55.07] },
  lossiemouth: { name: 'LOSSIEMOUTH', note: '20 OTU · février 1944', at: [-3.28, 57.72], label: -0.012 },
  rufforth: { name: 'RUFFORTH', note: 'près d’York · mai 1944', at: [-1.18, 53.95] },
  // the station of the two French squadrons, south-east of York
  elvington: { name: 'ELVINGTON', note: 'juillet 1944', at: [-0.99, 53.92] },
} satisfies Record<string, Post>;

export type PostId = keyof typeof POSTS;

/** Something that happened at a place, inked on the Chart as the Narration tells it: a fleet struck, raids, a landing. */
export interface ChartEvent {
  /** Red capitals, when the place's name is not already printed on the sheet. */
  name?: string;
  note: string;
  /** Where the lettering starts: its left edge. */
  label: [number, number];
  /** The place struck: a cross is inked on it. */
  strike?: [number, number];
  /**
   * Arrows, inked one after the other. `bow` bends one to the left of its course (positive) or to
   * the right, as a fraction of its length; `leave` is how far from its start it begins, in metres.
   */
  arrows?: { from: [number, number]; to: [number, number]; bow?: number; leave?: number }[];
  /**
   * How far aircraft can go from a base: an arc of a circle around it, `km` away, swept clockwise
   * between two bearings (degrees from north).
   */
  reach?: { from: [number, number]; km: number; bearings: [number, number] };
  /** What the camera takes in: [west, south] and [east, north]. */
  box: [[number, number], [number, number]];
}

export const EVENTS = {
  // the French fleet at anchor in the roads west of Oran, fired on by the Royal Navy
  'mers-el-kebir': {
    name: 'MERS EL-KÉBIR',
    note: 'près d’Oran · 3 juillet 1940',
    label: [-3.6, 36.28],
    strike: [-0.71, 35.74],
    box: [
      [-6.2, 34.2],
      [2.8, 37.5],
    ],
  },
  // the 19e escadre flies both raids from Meknès
  gibraltar: {
    note: '24 et 25 septembre 1940',
    label: [-5.0, 35.72],
    arrows: [
      { from: [-5.55, 33.89], to: [-5.35, 36.14], bow: 0.11, leave: 0.019 },
      { from: [-5.55, 33.89], to: [-5.35, 36.14], bow: -0.11, leave: 0.019 },
    ],
    box: [
      [-7.9, 33.35],
      [-2.2, 36.7],
    ],
  },
  // the Allied landings at Casablanca, Oran and Algiers
  torch: {
    name: 'TORCH',
    note: '8 novembre 1942',
    label: [0.75, 37.2],
    arrows: [
      { from: [-10.0, 33.3], to: [-7.8, 33.66], bow: -0.08 },
      { from: [-0.05, 37.45], to: [-0.45, 35.98], bow: -0.07 },
      { from: [3.74, 37.95], to: [3.6, 36.92], bow: 0.05 },
    ],
    box: [
      [-10.2, 32.9],
      [5.6, 38.6],
    ],
  },
  // the troopship comes in from the Irish Sea: only the landfall is drawn, the convoy's course is not known
  traversee: {
    note: 'd’Alger, par mer',
    label: [-5.97, 53.64],
    arrows: [{ from: [-5.25, 54.0], to: [-3.22, 53.5], bow: -0.06 }],
    box: [
      [-7.2, 52.3],
      [0.4, 55.1],
    ],
  },
  // what the Halifax can reach from Elvington: the arc the Film draws over Europe, a little over 1 000 km out
  portee: {
    note: 'rayon d’action des Halifax',
    label: [8.35, 50.62],
    reach: { from: [-0.99, 53.92], km: 1020, bearings: [75, 139] },
    box: [
      [-3.2, 46.7],
      [15.2, 55.5],
    ],
  },
} satisfies Record<string, ChartEvent>;

export type EventId = keyof typeof EVENTS;

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
  // Somme
  [[3.3, 49.85], [2.9, 49.93], [2.3, 49.9], [1.83, 50.1], [1.6, 50.2]],
  // Marne
  [[5.1, 48.1], [4.9, 48.6], [4.36, 48.96], [3.95, 49.05], [3.4, 49.04], [2.9, 48.95], [2.45, 48.82]],
  // Oise
  [[4.1, 49.95], [3.6, 49.75], [3.0, 49.42], [2.6, 49.25], [2.2, 49.07], [2.06, 48.94]],
  // Chélif
  [[2.9, 35.2], [2.3, 35.95], [1.33, 36.16], [0.6, 36.0], [0.13, 36.04]],
  // Moulouya
  [[-4.9, 32.7], [-4.0, 33.6], [-3.3, 34.3], [-2.9, 34.6], [-2.35, 35.12]],
  // Medjerda
  [[7.9, 36.25], [8.8, 36.5], [9.6, 36.7], [10.1, 37.0]],
  // Sebou
  [[-4.6, 33.7], [-5.0, 34.05], [-5.6, 34.3], [-6.3, 34.3], [-6.65, 34.26]],
  // Guadalquivir
  [[-3.0, 37.9], [-4.0, 38.0], [-4.8, 37.88], [-5.98, 37.39], [-6.35, 36.8]],
  // Tamise
  [[-1.95, 51.67], [-1.26, 51.75], [-0.98, 51.46], [-0.3, 51.42], [0.1, 51.5], [0.65, 51.48]],
  // Severn
  [[-3.4, 52.47], [-2.75, 52.71], [-2.22, 52.19], [-2.27, 51.86], [-2.62, 51.62]],
  // Trent
  [[-2.15, 53.05], [-1.55, 52.79], [-0.94, 52.95], [-0.76, 53.4], [-0.7, 53.68]],
  // Shannon
  [[-8.0, 54.1], [-7.95, 53.45], [-8.3, 52.9], [-8.62, 52.66]],
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
  // Ardennes, Morvan
  [4.9, 49.95, 0.9, 0.28, 0.4],
  [4.0, 47.15, 0.35, 0.4, 0.4],
  // Atlas, Rif, Aurès, Sierra Nevada
  [-7.2, 31.2, 2.0, 0.5, 1],
  [-4.9, 33.0, 0.9, 0.55, 0.8],
  [-4.4, 35.0, 1.2, 0.3, 0.7],
  [2.2, 36.3, 3.4, 0.25, 0.6],
  [0.8, 33.6, 3.0, 0.35, 0.6],
  [6.6, 35.35, 0.8, 0.35, 0.8],
  [-3.2, 37.05, 1.0, 0.25, 0.8],
  // Highlands, Grampians, Southern Uplands, Pennines, Lake District, Wales
  [-5.0, 57.2, 0.75, 0.75, 0.8],
  [-3.9, 56.9, 0.75, 0.28, 0.7],
  [-3.6, 55.45, 1.0, 0.18, 0.4],
  [-2.25, 54.45, 0.28, 0.75, 0.5],
  [-3.1, 54.5, 0.22, 0.17, 0.5],
  [-3.75, 52.6, 0.4, 0.6, 0.6],
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
  /** The countries the sheet is about, by their Natural Earth names. */
  subject: string[];
  /** The town written as the chief town. */
  capital: string;
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
    subject: ['France'],
    capital: 'Paris',
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
  /** From the Loire to the Belgian border: the campaign of May and June 1940. */
  'nord-de-la-france': {
    box: [
      [-2.3, 46.85],
      [6.5, 51.35],
    ],
    parallels: [48, 50],
    meridian: 2.1,
    title: 'NORD DE LA FRANCE',
    width: 0.74,
    proportions: 1.28,
    subject: ['France'],
    capital: 'Paris',
    countries: [
      { text: 'BELGIQUE', at: [4.75, 50.55], turn: -8, size: 26 },
      { text: 'ANGLETERRE', at: [0.1, 51.14], size: 22 },
      { text: 'ALLEMAGNE', at: [6.32, 50.25], turn: -78, size: 20 },
    ],
    seas: [{ text: 'Manche', at: [-0.95, 49.98], size: 32 }],
    cartouche: [-1.02, 50.66],
    rose: [0.72, 50.36],
  },
  /** Morocco and Algeria as far as Bougie, with the Strait: Blida, Mers el-Kébir, Gibraltar, and the landings of 1942. */
  'maroc-algerie': {
    box: [
      [-10.2, 32.7],
      [5.6, 38.7],
    ],
    parallels: [34, 37],
    meridian: -2.3,
    title: 'ALGÉRIE ET MAROC',
    width: 0.92,
    proportions: 1.909,
    subject: ['Morocco', 'Algeria'],
    capital: 'Alger',
    countries: [
      { text: 'MAROC', at: [-6.2, 33.02], size: 30 },
      { text: 'ALGÉRIE', at: [1.6, 34.5], size: 34 },
      { text: 'ESPAGNE', at: [-3.6, 37.8], size: 28 },
    ],
    seas: [
      { text: 'Mer Méditerranée', at: [1.3, 38.02], size: 30 },
      { text: 'Océan Atlantique', at: [-8.7, 35.1], size: 24 },
    ],
    cartouche: [-8.3, 36.85],
    rose: [4.5, 37.75],
  },
  /** Great Britain, from the Channel to the Moray Firth: Liverpool, then the schools of Dumfries, Lossiemouth and Rufforth. */
  'grande-bretagne': {
    box: [
      [-8.6, 49.8],
      [2.2, 59.0],
    ],
    parallels: [52, 57],
    meridian: -3.2,
    title: 'GRANDE-BRETAGNE',
    width: 0.52,
    proportions: 0.7695,
    subject: ['United Kingdom'],
    capital: 'Londres',
    countries: [
      { text: 'ÉCOSSE', at: [-4.35, 56.6], size: 26 },
      { text: 'ANGLETERRE', at: [-1.15, 52.15], size: 28 },
      { text: 'GALLES', at: [-3.75, 52.25], size: 18 },
      { text: 'IRLANDE', at: [-7.55, 53.3], size: 24 },
      { text: 'FRANCE', at: [1.72, 50.22], size: 17 },
    ],
    seas: [
      { text: 'Mer du Nord', at: [0.45, 57.15], size: 30 },
      { text: 'Océan Atlantique', at: [-7.45, 56.0], size: 22 },
      { text: 'Manche', at: [-1.6, 50.2], size: 26 },
    ],
    cartouche: [0.35, 55.95],
    rose: [1.05, 54.75],
  },
  /** From Yorkshire to Saxony and the Loire: Elvington, and all that a Halifax can reach from it. */
  'europe-du-nord-ouest': {
    box: [
      [-5.6, 46.4],
      [15.4, 55.7],
    ],
    parallels: [49, 54],
    meridian: 4.9,
    title: 'EUROPE DU NORD-OUEST',
    width: 0.78,
    proportions: 1.4179,
    subject: ['United Kingdom'],
    capital: 'Londres',
    countries: [
      { text: 'ANGLETERRE', at: [-1.45, 52.05], size: 26 },
      { text: 'FRANCE', at: [3.9, 47.9], size: 34 },
      { text: 'BELGIQUE', at: [4.85, 50.4], size: 17 },
      { text: 'PAYS-BAS', at: [5.75, 52.2], size: 17 },
      { text: 'ALLEMAGNE', at: [10.1, 51.75], size: 32 },
    ],
    seas: [
      { text: 'Mer du Nord', at: [3.1, 53.0], size: 30 },
      { text: 'Manche', at: [-1.5, 50.05], size: 26 },
      { text: 'Mer Baltique', at: [12.9, 54.88], size: 18 },
    ],
    cartouche: [5.3, 54.75],
    rose: [-4.35, 47.15],
  },
  /** French North Africa, from the Atlantic to Tunis, with the south of Spain and Gibraltar. */
  'afrique-du-nord': {
    box: [
      [-10.6, 29.6],
      [11.9, 39.0],
    ],
    parallels: [32, 37],
    meridian: 0.65,
    title: 'AFRIQUE DU NORD',
    width: 0.86,
    proportions: 1.95,
    subject: ['Morocco', 'Algeria', 'Tunisia'],
    capital: 'Alger',
    countries: [
      { text: 'MAROC', at: [-6.3, 32.35], size: 30 },
      { text: 'ALGÉRIE', at: [2.4, 34.75], size: 34 },
      { text: 'TUNISIE', at: [9.45, 35.6], turn: 78, size: 24 },
      { text: 'ESPAGNE', at: [-3.3, 38.35], size: 28 },
      { text: 'SAHARA', at: [1.2, 31.0], size: 36 },
    ],
    seas: [
      { text: 'Mer Méditerranée', at: [2.3, 37.85], size: 32 },
      { text: 'Océan Atlantique', at: [-8.75, 35.6], size: 22 },
    ],
    cartouche: [8.7, 31.2],
    rose: [6.2, 38.1],
  },
} satisfies Record<string, ChartSheet>;

export type SheetId = keyof typeof SHEETS;
