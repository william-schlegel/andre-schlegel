import { chapterById } from './chapters';
import phrases from './generated/phrases-campagne-de-france.json';
import sizes from './generated/prints-campagne-de-france.json';
import type { ChapterContent, Cue } from './types';

/**
 * Chapter 3 — Campagne de France, May and June 1940: the first war missions on Douglas DB-7
 * from Évreux, the citation of 24 May, then Pithiviers and the armistice. Cue times are those
 * of the Film's picture.
 *
 * The Film shows here a British newsreel of 1943 (French crews of the Lorraine group on
 * Bostons): it is projected whole, in step with its commentary. The last pages Eric shows
 * are those of a new Carnet: the one of 1938 is put away and the next one takes its place.
 */

const media = (name: string) => `/media/campagne-de-france/${name}.webp`;
const size = (name: keyof typeof sizes) => sizes[name] as [number, number];
const DOSSIER_WEB = 'Photographie réunie par Éric Lemoine (source internet)';
const PERSONAL = 'Photographie personnelle d’André Schlegel';

const START = 420;
/** The newsreel: the screen goes up as Eric finishes announcing it; its first frame; its last. */
const SCREEN_UP = 454.6;
const FILM = 456.735;
const FILM_END = 655.6;
/** The escadrille leaves Évreux for Pithiviers. */
const PITHIVIERS = 731.0;

const cues: Cue[] = [
  // the aircraft of the campaign is on the table from the start
  {
    kind: 'model',
    id: 'db-7',
    at: START,
    model: 'db-7',
    place: { x: 1.3, z: 0.5, turn: -30 },
    label: ['Douglas DB-7', 'bombardier moyen — triplace', 'train tricycle'],
  },
  { kind: 'view', id: 'table', at: START },
  // « D’abord, sur la base d’Évreux-Danville »
  { kind: 'chart', id: 'carte-evreux', at: 429.4, view: 'evreux' },
  // « pour attaquer les colonnes allemandes qui déferlent sur le nord de la France »
  {
    kind: 'print',
    id: 'chars-allemands',
    at: 434.7,
    until: FILM_END,
    src: media('chars-allemands'),
    size: size('chars-allemands'),
    width: 0.42,
    place: { x: 0.3, z: -0.04, turn: -3 },
    legend: 'Une colonne allemande, mai 1940',
    source: DOSSIER_WEB,
  },
  {
    kind: 'print',
    id: 'artillerie-allemande',
    at: 438.2,
    until: FILM_END,
    src: media('artillerie-allemande'),
    size: size('artillerie-allemande'),
    width: 0.36,
    place: { x: 0.76, z: -0.02, turn: 3 },
    legend: 'Artillerie allemande en batterie, 1940',
    source: DOSSIER_WEB,
    frame: { x: 0.52, z: -0.03, width: 0.92, depth: 0.34 },
  },
  // « Vous allez voir un film de propagande anglais… avec des équipages français sur DB-7 »
  {
    kind: 'print',
    id: 'db-7-illustration',
    at: 442.0,
    until: FILM_END,
    src: media('db-7-illustration'),
    size: size('db-7-illustration'),
    width: 0.32,
    place: { x: 0.32, z: 0.33, turn: 2 },
    paper: 'sheet',
    legend: 'Douglas DB-7 aux cocardes françaises',
    source: 'Illustration réunie par Éric Lemoine (source internet)',
  },
  {
    kind: 'print',
    id: 'db-7-en-vol',
    at: 446.7,
    until: FILM_END,
    src: media('db-7-en-vol'),
    size: size('db-7-en-vol'),
    width: 0.36,
    place: { x: 0.74, z: 0.32, turn: -3 },
    legend: 'Douglas DB-7 en vol',
    source: DOSSIER_WEB,
    frame: { x: 0.52, z: 0.32, width: 0.86, depth: 0.3 },
  },
  {
    kind: 'projection',
    id: 'film-boston',
    at: SCREEN_UP,
    starts: FILM,
    until: FILM_END,
    src: '/media/campagne-de-france/raid-des-boston.mp4',
    size: [654, 480],
    place: { x: 0.72, z: -0.52 },
    width: 0.62,
    legend: 'Les Boston du groupe Lorraine attaquent en rase-mottes une centrale électrique près de Paris, 1943',
    source: 'Actualités British Pathé — Reuters',
  },

  // ---------- la citation ----------
  // « Le lieutenant Schlegel sera cité et décoré de la croix de guerre »
  {
    kind: 'print',
    id: 'ceremonie-croix-de-guerre',
    at: 656.0,
    src: media('ceremonie-croix-de-guerre'),
    size: size('ceremonie-croix-de-guerre'),
    width: 0.2,
    place: { x: 0.2, z: 0.12, turn: -3 },
    paper: 'bare',
    legend: 'La remise de la croix de guerre, 1940',
    source: `${PERSONAL} (image du film)`,
  },
  {
    kind: 'print',
    id: 'remise-croix-de-guerre',
    at: 663.2,
    src: media('remise-croix-de-guerre'),
    size: size('remise-croix-de-guerre'),
    width: 0.27,
    place: { x: 0.5, z: 0.08, turn: 3 },
    paper: 'bare',
    legend: 'La remise de la croix de guerre, 1940',
    source: PERSONAL,
  },
  {
    kind: 'print',
    id: 'lt-schlegel-croix-de-guerre',
    at: 666.5,
    src: media('lt-schlegel-croix-de-guerre'),
    size: size('lt-schlegel-croix-de-guerre'),
    width: 0.25,
    place: { x: 0.82, z: 0.1, turn: -2 },
    paper: 'bare',
    legend: 'Le lieutenant Schlegel, la croix de guerre sur la poitrine',
    source: PERSONAL,
  },
  // « à l’occasion de la mission du 24 mai 1940 » — the line Eric underlines in red
  {
    kind: 'spread',
    id: 'carnet-24-mai',
    at: 675.7,
    carnet: '1938',
    spread: 46,
    marks: [{ at: 678.2, box: [0.064, 0.782, 0.932, 0.061] }],
  },
  // the citation, read out
  {
    kind: 'typed',
    id: 'citation-armee-aerienne',
    at: 682.0,
    place: { x: 1.17, z: 0.0, turn: 2 },
    width: 0.31,
    heading: ['ARMÉE AÉRIENNE', 'Ordre n° 67 du Général commandant en chef', 'en date du 23 juin 1940'],
    text:
      '« Officier observateur qui s’est distingué dès son entrée en campagne par son entrain et son courage. ' +
      'Le 24 mai 1940, au cours d’une mission, a été attaqué par plusieurs patrouilles de chasse ennemies, ' +
      's’est porté immédiatement au secours de son coéquipier en danger, après s’être dégagé a poursuivi ' +
      'et a mené à bien sa mission malgré une nouvelle attaque ennemie. ' +
      'Au cours de son bombardement a eu son appareil gravement atteint. »',
    reading: [683.6, 708.4],
    legend: 'Citation à l’ordre de l’armée aérienne : la première palme de la croix de guerre',
    source: 'Texte de la citation, tel que le film le donne',
  },
  // « Poursuite des missions de combat sur le nord de la France : Abbeville et Saint-Quentin »
  { kind: 'spread', id: 'carnet-fin-mai', at: 719.7, carnet: '1938', spread: 47 },

  // ---------- Pithiviers ----------
  // « Mais l’avance allemande contraint l’escadrille à changer de base pour Pithiviers »
  { kind: 'chart', id: 'carte-pithiviers', at: PITHIVIERS, view: 'pithiviers' },
  // the Carnet of 1938 is full: it is put away, and the next one is laid in its place
  { kind: 'view', id: 'nouveau-carnet', at: 735.0, frame: { x: -0.46, z: 0.44, width: 0.8, depth: 0.62 } },
  // « Et ce sont les dernières missions avant la défaite et l’armistice »
  { kind: 'spread', id: 'carnet-juin-1940', at: 736.6, carnet: '1940', spread: 3 },
];

const UNIT = '19e escadre · 1re escadrille';

export const campagneDeFrance: ChapterContent = {
  chapter: chapterById('campagne-de-france'),
  phrases,
  cues,
  postings: [
    { from: START, rank: 'Lieutenant', base: 'Base d’Évreux-Danville', unit: UNIT, dates: '22 mai 1940 – 14 juin 1940' },
    { from: PITHIVIERS, rank: 'Lieutenant', base: 'Base de Pithiviers', unit: UNIT, dates: '22 mai 1940 – 14 juin 1940' },
  ],
  marks: [
    { at: 422.3, label: 'mai 1940 · Évreux' },
    { at: FILM, label: 'film d’archives' },
    { at: 659.5, label: 'croix de guerre' },
    { at: 683.6, label: 'citation du 24 mai 1940' },
    { at: 718.0, label: 'Abbeville, Saint-Quentin' },
    { at: 730.1, label: 'juin 1940 · Pithiviers' },
  ],
  companion: { carnet: '1938', place: { x: -0.5, z: 0.4, turn: -2 }, view: 46, next: { at: 733.0, carnet: '1940' } },
};
