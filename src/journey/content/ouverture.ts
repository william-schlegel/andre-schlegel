import { chapterById } from './chapters';
import phrases from './generated/phrases-ouverture.json';
import sizes from './generated/prints-ouverture.json';
import type { ChapterContent, Cue, DecorationId, Frame, Place } from './types';

/**
 * The Ouverture is played on the Introduction's table: what lies there before Eric speaks
 * (the closed Carnet of 1938, the portrait, the three decorations) has `at: -1`.
 */

const media = (name: string) => `/media/ouverture/${name}.webp`;
const size = (name: keyof typeof sizes) => sizes[name] as [number, number];

/** The three decorations, in the order Eric names them. Sizes in metres on the table. */
export const DECORATIONS: { id: DecorationId; name: string; src: string; width: number; depth: number; place: Place }[] = [
  { id: 'legion-honneur', name: 'Officier de la Légion d’honneur', src: media('legion-honneur'), width: 0.079, depth: 0.19, place: { x: 0.37, z: -0.07, turn: -5 } },
  { id: 'croix-de-guerre', name: 'Croix de guerre avec palmes', src: media('croix-de-guerre'), width: 0.075, depth: 0.19, place: { x: 0.52, z: -0.05, turn: 2 } },
  { id: 'dfc', name: 'Distinguished Flying Cross', src: media('dfc'), width: 0.114, depth: 0.19, place: { x: 0.69, z: -0.06, turn: 6 } },
];

const decorationsFrame: Frame = { x: 0.53, z: -0.04, width: 0.56, depth: 0.3 };
const documentsFrame: Frame = { x: 0.5, z: 0.36, width: 0.66, depth: 0.5 };
const photographsFrame: Frame = { x: -0.42, z: 0.42, width: 0.86, depth: 0.42 };

const cues: Cue[] = [
  {
    kind: 'print',
    id: 'portrait-commandant',
    at: -1,
    src: media('portrait-commandant'),
    size: size('portrait-commandant'),
    width: 0.27,
    place: { x: -0.5, z: -0.03, turn: -5 },
    legend: 'Le commandant André Schlegel',
    source: 'Portrait de studio, album de famille',
  },
  // the visitor has just opened the cover: the title page shows while Eric introduces himself
  { kind: 'spread', id: 'couverture', at: 0, hold: 0, carnet: '1938', spread: 1 },
  { kind: 'view', id: 'table', at: 0 },
  // « … du commandant André Schlegel »
  { kind: 'view', id: 'regard-portrait', at: 3.9, frame: { x: -0.5, z: -0.03, width: 0.32, depth: 0.42 } },
  // « officier de la Légion d’honneur, croix de guerre avec palmes, Distinguished Flying Cross »
  { kind: 'decoration', id: 'legion-honneur', at: 6.5, decoration: 'legion-honneur', frame: decorationsFrame },
  { kind: 'decoration', id: 'croix-de-guerre', at: 8.65, decoration: 'croix-de-guerre', frame: decorationsFrame },
  { kind: 'decoration', id: 'dfc', at: 10.73, decoration: 'dfc', frame: decorationsFrame },
  // « Je vais maintenant vous raconter l’histoire de sa carrière… »
  { kind: 'view', id: 'table-entiere', at: 13.2 },
  // « … tirés des carnets de vol »
  { kind: 'spread', id: 'premiers-vols', at: 24.6, carnet: '1938', spread: 2 },
  // « des documents du Service historique des armées et de la Royal Air Force »
  {
    kind: 'print',
    id: 'emplois-occupes',
    at: 28.5,
    src: media('emplois-occupes'),
    size: size('emplois-occupes'),
    width: 0.3,
    place: { x: 0.36, z: 0.38, turn: -6 },
    paper: 'sheet',
    legend: 'États de service : « Emplois occupés »',
    source: 'Dossier militaire d’André Schlegel',
    frame: documentsFrame,
  },
  {
    kind: 'print',
    id: 'decorations-et-citations',
    at: 30.1,
    src: media('decorations-et-citations'),
    size: size('decorations-et-citations'),
    width: 0.3,
    place: { x: 0.64, z: 0.35, turn: 5 },
    paper: 'sheet',
    legend: 'États de service : « Décorations, citations et lettres de félicitations »',
    source: 'Dossier militaire d’André Schlegel',
    frame: documentsFrame,
  },
  // « Les photos et vidéos originales mettent en scène… des lieux et des personnes… »
  {
    kind: 'print',
    id: 'equipage-devant-le-nez',
    at: 32.7,
    src: media('equipage-devant-le-nez'),
    size: size('equipage-devant-le-nez'),
    width: 0.34,
    place: { x: -0.6, z: 0.42, turn: -7 },
    paper: 'bare',
    legend: '« L’équipage devant le nez de l’avion »',
    source: 'Album de famille, légende manuscrite',
    frame: photographsFrame,
  },
  {
    kind: 'print',
    id: 'album-noratlas',
    at: 35.2,
    src: media('album-noratlas'),
    size: size('album-noratlas'),
    width: 0.34,
    place: { x: -0.25, z: 0.45, turn: 4 },
    paper: 'bare',
    legend: 'Photographie de l’album de famille',
    source: 'Album de famille',
    frame: photographsFrame,
  },
  { kind: 'view', id: 'table-avant-depart', at: 39.2 },
];

export const ouverture: ChapterContent = {
  chapter: chapterById('ouverture'),
  phrases,
  cues,
  postings: [],
  marks: [],
  // closed, the book covers 21 cm to the right of its spine: this centres it on the table
  companion: { carnet: '1938', place: { x: -0.105, z: 0.06, turn: -3 }, view: 0 },
};
