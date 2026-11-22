import { chapterById } from './chapters';
import phrases from './generated/phrases-algerie-sous-vichy.json';
import sizes from './generated/prints-algerie-sous-vichy.json';
import type { ChapterContent, Cue } from './types';

/**
 * Chapter 4 — Algérie sous Vichy, June 1940 to the summer of 1943: Blida after the armistice,
 * Mers el-Kébir and the raids of reprisal on Gibraltar flown from Meknès, the second citation,
 * two idle years, then the Allied landings and the escadres turned into groupes. Cue times are
 * those of the Film's picture.
 *
 * Where the Film shows a web map, the Chart is inked instead: the fleet struck at Mers el-Kébir,
 * the two raids, the three landings of « Torch ».
 */

const media = (name: string) => `/media/algerie-sous-vichy/${name}.webp`;
const size = (name: keyof typeof sizes) => sizes[name] as [number, number];
const DOSSIER_WEB = 'Photographie réunie par Éric Lemoine (source internet)';
const PERSONAL = 'Photographie personnelle d’André Schlegel';

const START = 752;
/** The week of the raids on Gibraltar, flown from Meknès; then Blida again. */
const MEKNES = 831.4;
const BLIDA = 895.8;
/** After the landings, the escadre becomes a groupe. */
const GROUPE = 926.5;

const cues: Cue[] = [
  // he still flies the Douglas DB-7
  {
    kind: 'model',
    id: 'db-7',
    at: START,
    model: 'db-7',
    place: { x: 1.3, z: 0.5, turn: -30 },
    label: ['Douglas DB-7', 'bombardier moyen — triplace', 'train tricycle'],
  },
  { kind: 'view', id: 'table', at: START },

  // ---------- Blida ----------
  // « Sur la base de Blida, un endroit particulièrement ensoleillé »
  {
    kind: 'print',
    id: 'lt-schlegel-blida',
    at: 759.6,
    until: MEKNES,
    src: media('lt-schlegel-blida'),
    size: size('lt-schlegel-blida'),
    width: 0.44,
    place: { x: 0.34, z: -0.02, turn: -3 },
    paper: 'bare',
    legend: 'Le lieutenant Schlegel, à droite, sur la base de Blida',
    source: PERSONAL,
    rings: [{ at: 765.8, box: [0.607, 0.367, 0.15, 0.522] }],
  },
  // « une base située à quelques kilomètres au sud-ouest d’Alger »
  { kind: 'chart', id: 'carte-blida', at: 771.7, view: 'blida' },
  // « le lieutenant Schlegel et quelques camarades près du hangar de la base »
  {
    kind: 'print',
    id: 'groupe-hangar-blida',
    at: 781.4,
    until: MEKNES,
    src: media('groupe-hangar-blida'),
    size: size('groupe-hangar-blida'),
    width: 0.46,
    place: { x: 0.86, z: 0.0, turn: 2 },
    paper: 'bare',
    legend: 'Le lieutenant Schlegel et quelques camarades près du hangar de la base de Blida',
    source: PERSONAL,
    rings: [{ at: 783.7, box: [0.605, 0.376, 0.141, 0.624] }],
  },
  {
    kind: 'print',
    id: 'base-de-blida',
    at: 787.7,
    until: MEKNES,
    src: media('base-de-blida'),
    size: size('base-de-blida'),
    width: 0.4,
    place: { x: 0.8, z: 0.32, turn: -3 },
    legend: 'La base de Blida vue d’avion',
    source: DOSSIER_WEB,
    rings: [{ at: 788.6, box: [0.127, 0.519, 0.085, 0.157] }],
    frame: { x: 0.83, z: 0.15, width: 0.56, depth: 0.62 },
  },

  // ---------- Mers el-Kébir ----------
  // « Les 3 et 4 juillet 1940 a lieu l’opération Catapult »
  { kind: 'chart', id: 'carte-mers-el-kebir', at: 799.4, view: 'mers-el-kebir' },
  {
    kind: 'print',
    id: 'mers-el-kebir-rade',
    at: 806.7,
    until: MEKNES,
    src: media('mers-el-kebir-rade'),
    size: size('mers-el-kebir-rade'),
    width: 0.36,
    place: { x: 0.28, z: 0.33, turn: 3 },
    legend: 'La flotte française en rade de Mers el-Kébir',
    source: DOSSIER_WEB,
  },
  // « conduisent à la catastrophe »
  {
    kind: 'print',
    id: 'mers-el-kebir-bombardement',
    at: 815.4,
    until: MEKNES,
    src: media('mers-el-kebir-bombardement'),
    size: size('mers-el-kebir-bombardement'),
    width: 0.38,
    place: { x: 0.42, z: 0.63, turn: -2 },
    legend: 'Mers el-Kébir, 3 juillet 1940 : les gerbes des obus britanniques',
    source: DOSSIER_WEB,
  },
  // « Plusieurs unités coulées et 1 295 marins tués »
  {
    kind: 'print',
    id: 'mers-el-kebir-incendie',
    at: 824.6,
    until: MEKNES,
    src: media('mers-el-kebir-incendie'),
    size: size('mers-el-kebir-incendie'),
    width: 0.38,
    place: { x: 0.86, z: 0.64, turn: 3 },
    legend: 'Mers el-Kébir, 3 juillet 1940 : les cuirassés touchés',
    source: DOSSIER_WEB,
    frame: { x: 0.64, z: 0.63, width: 0.9, depth: 0.34 },
  },

  // ---------- Meknès : les raids sur Gibraltar ----------
  { kind: 'view', id: 'table-meknes', at: MEKNES },
  // « En représailles, l’aviation française effectue sur ordre deux raids sur Gibraltar »
  { kind: 'chart', id: 'carte-meknes', at: 833.4, view: 'meknes-1940' },
  { kind: 'chart', id: 'carte-gibraltar', at: 836.9, view: 'gibraltar' },
  // the pages of September 1940: « Bombardement de Gibraltar », twice
  { kind: 'spread', id: 'carnet-gibraltar', at: 861.2, carnet: '1940', spread: 7 },
  // « division aérienne, du 17 décembre 1940 »
  {
    kind: 'typed',
    id: 'citation-division-aerienne',
    at: 865.2,
    until: BLIDA,
    place: { x: 0.5, z: 0.02, turn: -2 },
    width: 0.31,
    heading: ['DIVISION AÉRIENNE', 'Ordre n° 17 du Général de corps aérien,', 'commandant supérieur de l’Air en A.F.N.', 'en date du 17 décembre 1940'],
    text: '« Officier d’un cran et d’un dynamisme à toute épreuve. A obtenu de suite en France une réputation de courage et d’ardeur indomptables, poussant ses attaques à fond et prenant à partie les convois ennemis à la mitrailleuse après les avoir bombardés. A participé depuis, avec le même entrain, à deux bombardements sur un point particulièrement bien défendu par une D.C.A. très active. »',
    reading: [870.1, 892.5],
    legend: 'Deuxième citation, à l’ordre de la division aérienne, 17 décembre 1940',
    source: 'Texte de la citation, tel que le film le donne',
  },

  // ---------- Blida, deux années d’attente ----------
  { kind: 'view', id: 'table-blida', at: BLIDA },
  // « quelques missions d’entraînement, deux, trois par mois »
  { kind: 'spread', id: 'carnet-1942', at: 908.9, carnet: '1940', spread: 14 },
  // « de rares missions de reconnaissance en mer »
  { kind: 'spread', id: 'carnet-reconnaissance', at: 917.1, carnet: '1940', spread: 20 },

  // ---------- « Torch » ----------
  { kind: 'view', id: 'table-groupe', at: GROUPE },
  // « Après le débarquement allié, opération Torch »
  {
    kind: 'print',
    id: 'torch-debarquement',
    at: 933.3,
    src: media('torch-debarquement'),
    size: size('torch-debarquement'),
    width: 0.46,
    place: { x: 0.36, z: 0.0, turn: -2 },
    legend: 'Opération « Torch » : le débarquement allié en Afrique du Nord, novembre 1942',
    source: DOSSIER_WEB,
  },
  // « l’AFN est reconquise »
  { kind: 'chart', id: 'carte-torch', at: 937.0, view: 'torch' },
  // « les escadrilles de bombardement passent sous commandement allié »
  {
    kind: 'print',
    id: 'officiers-terrain',
    at: 942.0,
    src: media('officiers-terrain'),
    size: size('officiers-terrain'),
    width: 0.36,
    place: { x: 0.88, z: 0.02, turn: 3 },
    legend: 'Sur un terrain d’Afrique du Nord, les bombardiers alignés',
    source: DOSSIER_WEB,
  },
  // « et les missions s’intensifient »
  { kind: 'spread', id: 'carnet-1943', at: 947.3, carnet: '1940', spread: 25 },
];

const ESCADRE = '19e escadre · 1re escadrille';
const AT_BLIDA = { rank: 'Lieutenant', base: 'Base de Blida', unit: ESCADRE, dates: '15 juin 1940 – novembre 1942' };

export const algerieSousVichy: ChapterContent = {
  chapter: chapterById('algerie-sous-vichy'),
  phrases,
  cues,
  postings: [
    { from: START, ...AT_BLIDA },
    { from: MEKNES, rank: 'Lieutenant', base: 'Base de Meknès', unit: ESCADRE, dates: '22 – 29 septembre 1940' },
    { from: BLIDA, ...AT_BLIDA },
    { from: GROUPE, rank: 'Lieutenant', base: 'Base de Blida', unit: 'Groupe I/19', dates: 'novembre 1942 – 13 août 1943' },
  ],
  marks: [
    { at: 753.2, label: 'juin 1940 · Blida' },
    { at: 797.5, label: '3 juillet 1940 · Mers el-Kébir' },
    { at: 832.2, label: 'septembre 1940 · Gibraltar' },
    { at: 862.0, label: 'deuxième citation' },
    { at: 897.7, label: '1941 – 1942' },
    { at: 929.6, label: 'novembre 1942 · « Torch »' },
  ],
  companion: { carnet: '1940', place: { x: -0.5, z: 0.4, turn: -2 }, view: 3 },
};
