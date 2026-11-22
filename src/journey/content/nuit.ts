import { chapterById } from './chapters';
import phrases from './generated/phrases-nuit.json';
import sizes from './generated/prints-nuit.json';
import type { ChapterContent, Cue, Phase, PrintCue } from './types';

/**
 * Chapter 7 — Une nuit sur l’Allemagne: a night mission from Elvington, from the briefing to the
 * debriefing, as Éric Lemoine tells it in the film he put together from archive footage. The
 * film is projected whole, in step with its sound; its fourteen title cards are the phases of
 * the mission, listed beside the screen.
 *
 * Three times, while the film shows only a title card, the eye goes to the Chart, where the way
 * out, the objective and the way back are inked. The film names no date and no target: the route
 * is a sketch of a typical one towards the Ruhr, and the Chart says so.
 */

const media = (name: string) => `/media/nuit/${name}.webp`;
const size = (name: keyof typeof sizes) => sizes[name] as [number, number];

const START = 1782;
/** The screen is pulled up as Eric ends his introduction; the film's first frame, and its last. */
const SCREEN_UP = 1808.4;
const FILM = 1810.367;
const FILM_END = 2308.85;

function print(id: keyof typeof sizes, at: number, width: number, x: number, z: number, turn: number, legend: string, source: string): PrintCue {
  return { kind: 'print', id, at, src: media(id), size: size(id), width, place: { x, z, turn }, legend, source };
}

/** The film's title cards, at the moment each one appears. */
const PHASES: Phase[] = [
  { at: 1818.4, label: 'Briefing des équipages' },
  { at: 1841.4, label: 'Ravitaillement des avions' },
  { at: 1853.6, label: 'Embarquement' },
  { at: 1869.6, label: 'Démarrage des moteurs' },
  { at: 1930.0, label: 'Roulage' },
  { at: 1944.6, label: 'Check-list de l’équipage' },
  { at: 1975.4, label: 'Autorisation de décollage' },
  { at: 2020.1, label: 'Décollage' },
  { at: 2069.6, label: 'Regroupement et transit' },
  { at: 2106.5, label: '« Bombes larguées »' },
  { at: 2150.2, label: 'Chasse de nuit et Flak' },
  { at: 2219.5, label: 'Retour à la base' },
  { at: 2253.0, label: 'Atterrissage' },
  { at: 2291.3, label: 'Debriefing' },
];

const cues: Cue[] = [
  // the Halifax of the Chapter before is still on the table; it does not take the eye
  {
    kind: 'model',
    id: 'maquette-halifax',
    at: START,
    model: 'halifax',
    place: { x: 1.32, z: 0.42, turn: -30 },
    label: ['Halifax Mk III', 'bombardier lourd — sept hommes', 'Squadron 347 « Tunisie »'],
  },
  { kind: 'view', id: 'table', at: START },

  // « va vous montrer le déroulement d’une mission de nuit sur l’Allemagne »
  print(
    'halifax-de-nuit',
    1785.7,
    0.36,
    0.27,
    0.14,
    -3,
    'Deux Halifax du Squadron 347 dans les projecteurs et la Flak, de nuit (peinture)',
    'Illustration réunie par Éric Lemoine (peinture signée, auteur non identifié)',
  ),
  // « On y voit un avion que notre grand-père a piloté, comme celui sur le diorama »
  print(
    'diorama-elvington',
    1800.2,
    0.5,
    0.78,
    0.2,
    2,
    'Diorama : un Halifax du Squadron 347 préparé pour la nuit sur son aire de dispersion, à Elvington',
    'Maquette et photographie réunies par Éric Lemoine',
  ),

  // the film of the mission
  {
    kind: 'projection',
    id: 'film-mission',
    at: SCREEN_UP,
    starts: FILM,
    until: FILM_END,
    src: '/media/nuit/mission-de-nuit.mp4',
    size: [854, 480],
    place: { x: 0.56, z: -0.56 },
    width: 0.84,
    legend: '« Mission de nuit sur l’Allemagne à bord d’un bombardier Halifax », du briefing à l’atterrissage',
    source: 'Montage d’Éric Lemoine (2023), d’après des films d’archives, dont un film d’instruction du Squadron 347 « Tunisie »',
  },

  // the film shows the card « Regroupement — Transit vers l’objectif »: the way out is inked on the Chart
  { kind: 'chart', id: 'route-aller', at: 2069.8, view: 'nuit-aller', hold: 5.5 },
  // the card « Bombes larguées »: the objective
  { kind: 'chart', id: 'route-objectif', at: 2106.5, view: 'nuit-objectif', hold: 5.4 },
  // the card « Retour à la base »: the way back
  { kind: 'chart', id: 'route-retour', at: 2219.5, view: 'nuit-retour', hold: 5.1 },
];

export const nuit: ChapterContent = {
  chapter: chapterById('nuit'),
  phrases,
  cues,
  postings: [
    {
      from: START,
      rank: 'Capitaine, commandant d’avion',
      base: 'Elvington Station',
      unit: 'Squadron 347 « Tunisie »',
      dates: 'juillet 1944 – avril 1945',
    },
  ],
  marks: PHASES,
  phases: { title: 'Déroulement de la mission', from: SCREEN_UP, until: FILM_END, steps: PHASES },
  companion: { carnet: '1940', place: { x: -0.5, z: 0.4, turn: -2 }, view: 42 },
};
