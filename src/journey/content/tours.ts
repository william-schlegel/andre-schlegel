import { chapterById } from './chapters';
import phrases from './generated/phrases-tours.json';
import sizes from './generated/prints-tours.json';
import type { ChapterContent, Cue } from './types';

/**
 * Chapter 1 — Tours, 1936-1939. Cue times are those of the Film's picture (the moment each
 * photograph appears in V4), read with pipeline/detect_changes.py.
 */

const media = (name: string) => `/media/tours/${name}.webp`;
const size = (name: keyof typeof sizes) => sizes[name] as [number, number];
const DOSSIER_WEB = 'Photographie réunie par Éric Lemoine (source internet)';

const cues: Cue[] = [
  { kind: 'view', id: 'table', at: 44.55 },
  {
    kind: 'print',
    id: 'premiere-affectation',
    at: 51.1,
    src: media('premiere-affectation'),
    size: size('premiere-affectation'),
    width: 0.2,
    place: { x: 0.0, z: -0.26, turn: -5 },
    paper: 'bare',
    legend: 'André Schlegel à Tours, avril 1936',
    source: 'Album de famille — légende manuscrite : « Avril 1936. Tours début, comme pilote »',
  },
  // the Film shows the first page of the Carnet here
  { kind: 'spread', id: 'page-de-titre', at: 56.6, carnet: '1938', spread: 1 },
  {
    kind: 'print',
    id: 'jeune-pilote',
    at: 63.0,
    src: media('jeune-pilote'),
    size: size('jeune-pilote'),
    width: 0.18,
    place: { x: 0.21, z: -0.2, turn: 6 },
    legend: 'Le sous-lieutenant Schlegel',
    source: 'Portrait, album de famille',
  },
  // « Celle-ci est basée à Tours, la base 131 »
  { kind: 'chart', id: 'carte-tours', at: 70.2, view: 'tours' },
  {
    kind: 'print',
    id: 'defile-base-131',
    at: 75.0,
    src: media('defile-base-131'),
    size: size('defile-base-131'),
    width: 0.44,
    place: { x: 0.6, z: -0.27, turn: -3 },
    legend: 'Défilé sur la base 131 de Tours',
    source: 'Photographie personnelle d’André Schlegel',
  },
  {
    kind: 'print',
    id: 'base-131-vue-aerienne',
    at: 83.1,
    src: media('base-131-vue-aerienne'),
    size: size('base-131-vue-aerienne'),
    width: 0.46,
    place: { x: 0.63, z: 0.0, turn: 2.5 },
    legend: 'L’aérodrome de Tours vu d’avion',
    source: 'Wikimedia Commons — « 2d Air Instructional Center, Tours Aerodrome », U.S. Air Service',
  },
  {
    kind: 'print',
    id: 'insigne-escadrille',
    at: 87.0,
    hold: 5,
    src: media('insigne-escadrille'),
    size: size('insigne-escadrille'),
    width: 0.14,
    place: { x: 0.36, z: 0.2, turn: -7 },
    paper: 'sheet',
    legend: 'Insigne de la 1re escadrille de la 31e escadre',
    source: DOSSIER_WEB,
    frame: { x: 0.58, z: 0.04, width: 0.62, depth: 0.44 },
  },
  // « Sur cette base, il est pilote et observateur sur Bloch 200 »
  {
    kind: 'model',
    id: 'bloch-200',
    at: 93.6,
    model: 'bloch-200',
    place: { x: 0.04, z: 0.3, turn: -32 },
    label: ['Bloch 200', 'bombardier moyen — quadriplace', 'dit « le cercueil volant »'],
  },
  {
    kind: 'print',
    id: 'bloch-200-au-sol',
    at: 97.3,
    src: media('bloch-200-au-sol'),
    size: size('bloch-200-au-sol'),
    width: 0.3,
    place: { x: -0.17, z: 0.03, turn: -4 },
    legend: 'Bloch 200 au sol',
    source: DOSSIER_WEB,
  },
  {
    kind: 'print',
    id: 'bloch-200-en-vol',
    at: 100.1,
    src: media('bloch-200-en-vol'),
    size: size('bloch-200-en-vol'),
    width: 0.32,
    place: { x: 0.17, z: 0.04, turn: 3 },
    legend: 'Bloch 200 en formation',
    source: 'Collection Nathalie Baudoin — traditions-air.fr',
  },
  {
    kind: 'print',
    id: 'accident-1939',
    at: 110.9,
    src: media('accident-1939'),
    size: size('accident-1939'),
    width: 0.38,
    place: { x: 0.36, z: 0.47, turn: -2 },
    legend: 'L’accident du commandant de la base, près de Tours, printemps 1939',
    source: '© Didier Lecoq',
  },
  // « On note sur son carnet de vol de nombreuses missions sur Bloch 200 »
  { kind: 'spread', id: 'carnet-bloch-200', at: 121.4, carnet: '1938', spread: 7 },
  { kind: 'spread', id: 'carnet-bloch-200-suite', at: 128.2, carnet: '1938', spread: 8 },
  // « Il est aussi observateur sur Potez 25 »
  {
    kind: 'model',
    id: 'potez-25',
    at: 135.8,
    model: 'potez-25',
    place: { x: 0.78, z: 0.4, turn: 28 },
    label: ['Potez 25', 'biplan d’observation — biplace'],
  },
  {
    kind: 'print',
    id: 'potez-25-poste-observateur',
    at: 137.5,
    src: media('potez-25-poste-observateur'),
    size: size('potez-25-poste-observateur'),
    width: 0.15,
    place: { x: 0.98, z: 0.1, turn: -5 },
    legend: 'Le poste de l’observateur d’un Potez 25',
    source: DOSSIER_WEB,
  },
  {
    kind: 'print',
    id: 'potez-25-andre',
    at: 140.6,
    src: media('potez-25-andre'),
    size: size('potez-25-andre'),
    width: 0.22,
    place: { x: 1.16, z: 0.16, turn: 4 },
    legend: 'André Schlegel au pied d’un Potez 25, devant le poste de l’observateur',
    source: 'Photographie de famille (image tirée du film)',
    frame: { x: 1.08, z: 0.14, width: 0.46, depth: 0.38 },
  },
  {
    kind: 'print',
    id: 'potez-25-aeropostale',
    at: 147.8,
    src: media('potez-25-aeropostale'),
    size: size('potez-25-aeropostale'),
    width: 0.4,
    place: { x: 1.08, z: -0.2, turn: -3 },
    legend: 'Un Potez 25 de l’Aéropostale dans les Andes : Saint-Exupéry recherchant Guillaumet',
    source: 'Illustration réunie par Éric Lemoine (source internet)',
  },
  // « Plusieurs missions sur Potez 25 sont inscrites sur son carnet de vol »
  {
    kind: 'spread',
    id: 'carnet-potez-25',
    at: 161.8,
    carnet: '1938',
    spread: 14,
    // the lines Eric frames in red in the Film
    marks: [{ at: 164.4, box: [0.034, 0.512, 0.94, 0.288] }],
  },
  // the page of the departure for Oran, stamped in red
  { kind: 'spread', id: 'carnet-depart', at: 170.7, carnet: '1938', spread: 23 },
];

export const tours: ChapterContent = {
  chapter: chapterById('tours'),
  phrases,
  cues,
  postings: [
    {
      from: 44.55,
      rank: 'Sous-lieutenant',
      base: 'Base 131 — Tours',
      unit: '31e escadre · 1re escadrille',
      dates: '20 septembre 1936 – 17 janvier 1939',
    },
  ],
  marks: [
    { at: 44.8, label: '1935 · Arts et Métiers' },
    { at: 49.6, label: '1936 · pilote et observateur' },
    { at: 59.1, label: '31e escadre' },
    { at: 93.7, label: 'Bloch 200' },
    { at: 111.3, label: 'printemps 1939' },
    { at: 134.9, label: 'Potez 25' },
  ],
  companion: { carnet: '1938', place: { x: -0.56, z: 0.38, turn: 3 }, view: 1 },
};
