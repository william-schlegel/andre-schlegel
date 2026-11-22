import { chapterById } from './chapters';
import phrases from './generated/phrases-algerie.json';
import sizes from './generated/prints-algerie.json';
import type { ChapterContent, Cue } from './types';

/**
 * Chapter 2 — Algérie, 1939-1940: Oran-La Sénia, Biskra during the « drôle de guerre », then
 * Meknès, where the Douglas DB-7 arrive. Cue times are those of the Film's picture.
 *
 * The table is cleared at each new Posting, as the Film changes its title: what belongs to
 * Oran leaves when André leaves for Biskra, and so on.
 */

const media = (name: string) => `/media/algerie/${name}.webp`;
const size = (name: keyof typeof sizes) => sizes[name] as [number, number];
const DOSSIER_WEB = 'Photographie réunie par Éric Lemoine (source internet)';
const PERSONAL = 'Photographie personnelle d’André Schlegel';

/** The moments André changes base. */
const BISKRA = 292.3;
const MEKNES = 339.3;

const cues: Cue[] = [
  // ---------- Oran-La Sénia ----------
  { kind: 'view', id: 'table', at: 174.6 },
  // « commandant de la base 121 d’Oran-La Sénia, en Algérie »
  { kind: 'chart', id: 'carte-oran', at: 178.0, view: 'oran' },
  {
    kind: 'print',
    id: 'base-oran-la-senia',
    at: 188.3,
    until: BISKRA,
    src: media('base-oran-la-senia'),
    size: size('base-oran-la-senia'),
    width: 0.34,
    place: { x: 0.3, z: 0.0, turn: -3 },
    legend: 'La base d’Oran-La Sénia',
    source: DOSSIER_WEB,
  },
  {
    kind: 'print',
    id: 'insigne-1re-escadrille',
    at: 191.3,
    until: BISKRA,
    hold: 2,
    src: media('insigne-1re-escadrille'),
    size: size('insigne-1re-escadrille'),
    width: 0.12,
    place: { x: -0.06, z: 0.02, turn: 7 },
    paper: 'sheet',
    legend: 'Insigne de la 1re escadrille du groupe de bombardement I/19',
    source: DOSSIER_WEB,
    frame: { x: 0.2, z: 0.02, width: 0.72, depth: 0.36 },
  },
  {
    kind: 'print',
    id: 'oran-vue-aerienne',
    at: 193.4,
    until: BISKRA,
    src: media('oran-vue-aerienne'),
    size: size('oran-vue-aerienne'),
    width: 0.22,
    place: { x: 0.63, z: 0.02, turn: 4 },
    legend: 'Le terrain d’Oran-La Sénia vu d’avion',
    source: DOSSIER_WEB,
    frame: { x: 0.36, z: 0.02, width: 0.86, depth: 0.4 },
  },
  // « Il est alors qualifié comme commandant d’avion »
  {
    kind: 'print',
    id: 'poste-de-pilotage',
    at: 199.6,
    until: BISKRA,
    src: media('poste-de-pilotage'),
    size: size('poste-de-pilotage'),
    width: 0.2,
    place: { x: 0.91, z: 0.05, turn: -4 },
    paper: 'bare',
    legend: 'Au poste de pilotage d’un Bloch 210',
    source: PERSONAL,
  },
  {
    kind: 'print',
    id: 'bloch-210-cockpit',
    at: 203.5,
    until: BISKRA,
    src: media('bloch-210-cockpit'),
    size: size('bloch-210-cockpit'),
    width: 0.28,
    place: { x: 1.2, z: 0.0, turn: 3 },
    legend: 'Le poste de pilotage du Bloch 210',
    source: DOSSIER_WEB,
    frame: { x: 1.05, z: 0.04, width: 0.62, depth: 0.4 },
  },
  // « Il vole maintenant sur Bloch 210 » — the model stays as long as he flies the type
  {
    kind: 'model',
    id: 'bloch-210',
    at: 211.3,
    until: MEKNES,
    model: 'bloch-210',
    place: { x: 0.26, z: 0.44, turn: -30 },
    label: ['Bloch 210', 'bombardier moyen — cinq hommes', 'aile basse, train rentrant'],
  },
  // « On peut le voir à gauche, au pied du train d’atterrissage »
  {
    kind: 'print',
    id: 'lt-schlegel-bloch-210',
    at: 214.3,
    until: BISKRA,
    src: media('lt-schlegel-bloch-210'),
    size: size('lt-schlegel-bloch-210'),
    width: 0.42,
    place: { x: 0.72, z: 0.4, turn: -2 },
    legend: 'Le lieutenant Schlegel, à gauche, au pied du train d’atterrissage d’un Bloch 210 — Oran',
    source: PERSONAL,
  },
  {
    kind: 'print',
    id: 'bloch-210-au-sol',
    at: 224.5,
    until: BISKRA,
    src: media('bloch-210-au-sol'),
    size: size('bloch-210-au-sol'),
    width: 0.34,
    place: { x: 1.16, z: 0.34, turn: 3 },
    legend: 'Bloch 210',
    source: 'Collection Henri Guyot — traditions-air.fr',
  },
  {
    kind: 'print',
    id: 'bloch-210-alignes',
    at: 228.9,
    until: BISKRA,
    src: media('bloch-210-alignes'),
    size: size('bloch-210-alignes'),
    width: 0.34,
    place: { x: 1.18, z: 0.58, turn: -3 },
    legend: 'Bloch 210 alignés, leurs équipages devant eux',
    source: DOSSIER_WEB,
    frame: { x: 1.17, z: 0.46, width: 0.5, depth: 0.5 },
  },
  // « Vous allez voir un film anglais… » — the screen goes up as Eric finishes announcing it
  {
    kind: 'projection',
    id: 'film-bombardement',
    at: 238.4,
    starts: 240.8,
    until: 272.2,
    src: '/media/algerie/bombardement-bloch-210.mp4',
    size: [760, 570],
    place: { x: 0.72, z: -0.52 },
    width: 0.62,
    legend: '« Bombing Practice in France » : des Bloch 210 à l’exercice près de Reims',
    source: 'Actualités British Movietone — AP Archive',
  },
  // « Sur cette base, il vole également sur Potez 25 »
  {
    kind: 'print',
    id: 'potez-25-oran',
    at: 272.4,
    until: BISKRA,
    src: media('potez-25-oran'),
    size: size('potez-25-oran'),
    width: 0.22,
    place: { x: -0.04, z: 0.34, turn: -5 },
    paper: 'bare',
    legend: 'À bord d’un Potez 25 — Oran',
    source: PERSONAL,
    rings: [{ at: 275.6, box: [0.456, 0.256, 0.282, 0.244] }],
  },
  { kind: 'spread', id: 'carnet-oran', at: 280.2, carnet: '1938', spread: 24 },
  { kind: 'spread', id: 'carnet-oran-suite', at: 287.6, carnet: '1938', spread: 30 },

  // ---------- Biskra, la « drôle de guerre » ----------
  { kind: 'view', id: 'table-biskra', at: BISKRA },
  {
    kind: 'print',
    id: 'lt-schlegel-biskra',
    at: 299.1,
    until: MEKNES,
    src: media('lt-schlegel-biskra'),
    size: size('lt-schlegel-biskra'),
    width: 0.22,
    place: { x: 0.28, z: 0.02, turn: -4 },
    paper: 'bare',
    legend: 'Le lieutenant Schlegel à Biskra',
    source: PERSONAL,
  },
  {
    kind: 'print',
    id: 'biskra-vue-aerienne',
    at: 306.7,
    until: MEKNES,
    src: media('biskra-vue-aerienne'),
    size: size('biskra-vue-aerienne'),
    width: 0.4,
    place: { x: 0.68, z: 0.04, turn: 3 },
    legend: 'Biskra vue d’avion',
    source: 'Carte postale réunie par Éric Lemoine (source internet)',
  },
  // « Elle se situe dans le sud-est de l’Algérie »
  { kind: 'chart', id: 'carte-biskra', at: 312.6, view: 'biskra' },
  // « Plutôt ralenties en 1939, les missions d’entraînement s’intensifient en 1940 »
  { kind: 'spread', id: 'carnet-biskra-1939', at: 321.2, carnet: '1938', spread: 34 },
  { kind: 'spread', id: 'carnet-biskra-1940', at: 326.4, carnet: '1938', spread: 38 },

  // ---------- Meknès ----------
  { kind: 'view', id: 'table-meknes', at: MEKNES },
  // « la 19e escadre est transférée à Meknès, au Maroc »
  { kind: 'chart', id: 'carte-meknes', at: 346.2, view: 'meknes' },
  {
    kind: 'print',
    id: 'meknes-camp',
    at: 351.6,
    src: media('meknes-camp'),
    size: size('meknes-camp'),
    width: 0.36,
    place: { x: 0.3, z: 0.0, turn: -3 },
    legend: 'Meknès : vue générale du camp d’aviation',
    source: 'Carte postale réunie par Éric Lemoine (source internet)',
  },
  {
    kind: 'print',
    id: 'meknes-hangars',
    at: 354.8,
    src: media('meknes-hangars'),
    size: size('meknes-hangars'),
    width: 0.3,
    place: { x: 0.68, z: 0.02, turn: 4 },
    legend: 'Les hangars de la base de Meknès',
    source: DOSSIER_WEB,
    frame: { x: 0.47, z: 0.01, width: 0.76, depth: 0.34 },
  },
  // « Le lieutenant Schlegel et ses camarades réceptionnent de nouveaux bombardiers »
  {
    kind: 'print',
    id: 'groupe-db-7',
    at: 363.0,
    src: media('groupe-db-7'),
    size: size('groupe-db-7'),
    width: 0.42,
    place: { x: 1.08, z: 0.06, turn: 2 },
    legend: 'Le lieutenant Schlegel et ses camarades devant un Douglas DB-7 — Meknès, printemps 1940',
    source: PERSONAL,
    rings: [{ at: 365.0, box: [0.761, 0.62, 0.104, 0.2] }],
  },
  {
    kind: 'print',
    id: 'groupe-db-7-suite',
    at: 370.9,
    src: media('groupe-db-7-suite'),
    size: size('groupe-db-7-suite'),
    width: 0.46,
    place: { x: 0.78, z: 0.42, turn: -2 },
    paper: 'bare',
    legend: 'Les équipages devant un Douglas DB-7',
    source: PERSONAL,
    rings: [{ at: 374.7, box: [0.485, 0.348, 0.121, 0.592] }],
  },
  // « Il s’agit du Douglas DB-7 »
  {
    kind: 'print',
    id: 'db-7-profils',
    at: 378.8,
    hold: 2.6,
    src: media('db-7-profils'),
    size: size('db-7-profils'),
    width: 0.24,
    place: { x: -0.05, z: 0.1, turn: -5 },
    paper: 'sheet',
    legend: 'Douglas DB-7 aux couleurs françaises',
    source: 'Illustration réunie par Éric Lemoine (source internet)',
  },
  {
    kind: 'model',
    id: 'db-7',
    at: 381.4,
    model: 'db-7',
    place: { x: 0.26, z: 0.44, turn: -30 },
    label: ['Douglas DB-7', 'bombardier moyen — triplace', 'train tricycle'],
  },
  {
    kind: 'print',
    id: 'db-7-alignes',
    at: 384.7,
    src: media('db-7-alignes'),
    size: size('db-7-alignes'),
    width: 0.32,
    place: { x: 1.22, z: 0.38, turn: 3 },
    legend: 'Douglas DB-7 alignés',
    source: DOSSIER_WEB,
  },
  {
    kind: 'print',
    id: 'db-7-au-sol',
    at: 390.0,
    src: media('db-7-au-sol'),
    size: size('db-7-au-sol'),
    width: 0.32,
    place: { x: 1.24, z: 0.61, turn: -3 },
    legend: 'Douglas DB-7 au sol',
    source: DOSSIER_WEB,
    frame: { x: 1.23, z: 0.49, width: 0.46, depth: 0.5 },
  },
  // « Notez le train tricycle, inhabituel à cette époque »
  {
    kind: 'print',
    id: 'db-7-en-vol',
    at: 399.3,
    src: media('db-7-en-vol'),
    size: size('db-7-en-vol'),
    width: 0.28,
    place: { x: -0.05, z: 0.38, turn: 4 },
    legend: 'Douglas DB-7, train tricycle sorti',
    source: DOSSIER_WEB,
  },
  // « ils n’auront que dix jours et onze missions »
  {
    kind: 'spread',
    id: 'carnet-meknes',
    at: 406.4,
    carnet: '1938',
    spread: 46,
    // the lines Eric frames in red in the Film
    marks: [{ at: 409.7, box: [0.062, 0.183, 0.932, 0.343] }],
  },
];

const UNIT = '19e escadre · 1re escadrille';

export const algerie: ChapterContent = {
  chapter: chapterById('algerie'),
  phrases,
  cues,
  postings: [
    { from: 174.6, rank: 'Lieutenant', base: 'Base 121 — Oran-La Sénia', unit: UNIT, dates: '17 janvier 1939 – 3 septembre 1939' },
    { from: BISKRA, rank: 'Lieutenant', base: 'Base de Biskra', unit: UNIT, dates: '4 septembre 1939 – 12 avril 1940' },
    { from: MEKNES, rank: 'Lieutenant', base: 'Base de Meknès', unit: UNIT, dates: '13 avril 1940 – 17 mai 1940' },
  ],
  marks: [
    { at: 175.9, label: 'début 1939 · lieutenant' },
    { at: 212.1, label: 'Bloch 210' },
    { at: 240.8, label: 'film d’archives' },
    { at: 294.6, label: 'septembre 1939 · la guerre' },
    { at: 312.6, label: 'Biskra' },
    { at: 341.8, label: 'mai 1940 · Blitzkrieg' },
    { at: 351.7, label: 'Meknès' },
    { at: 381.3, label: 'Douglas DB-7' },
  ],
  companion: { carnet: '1938', place: { x: -0.5, z: 0.4, turn: -2 }, view: 23 },
};
