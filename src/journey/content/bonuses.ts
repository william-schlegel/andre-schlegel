import sizes from './generated/prints-bonus.json';
import type { ChapterId } from './types';

/**
 * The Bonuses: documents and pictures of the Dossier that the Film does not show, kept in the
 * « Hors film » folder beside the Chapter they belong to. They are never laid on the table.
 *
 * Each was checked against a frame of the Film every two seconds before being listed here.
 * A legend says only what the document itself says, or what anyone can see on it. The pictures
 * are made by pipeline/prints.py from pipeline/prints/bonus.json.
 */
export interface Bonus {
  id: string;
  chapter: ChapterId;
  src: string;
  /** A smaller picture, for the folder. */
  small: string;
  /** Pixel size of the picture, for its proportions. */
  size: [number, number];
  legend: string;
  source: string;
  /** A print with its white border, or a scan that already shows its own edges. */
  paper: 'photo' | 'bare';
}

const ALBUM = 'Photographies d’André Schlegel, scannées par sa famille';
const PAPERS = 'Papiers d’André Schlegel, scannés par sa famille';
const MISSION_TYPE = 'Image réunie par Éric Lemoine pour la séquence « mission type » (source internet)';

function bonus(id: keyof typeof sizes, chapter: ChapterId, paper: Bonus['paper'], legend: string, source: string): Bonus {
  return { id, chapter, paper, legend, source, src: `/media/bonus/${id}.webp`, small: `/media/bonus/${id}.small.webp`, size: sizes[id] as [number, number] };
}

export const BONUSES: Bonus[] = [
  bonus('portrait-en-chemisette', 'ouverture', 'bare', 'Portrait en chemisette, sans légende ni date', `${ALBUM} (n° 1470)`),
  bonus('officiers-en-ligne', 'ouverture', 'bare', 'Des officiers en ligne sur un terrain, sans légende ni date', `${ALBUM} (n° 1475)`),

  bonus(
    'tableau-de-codes',
    'tours',
    'bare',
    'Tableau de codes monté sur carton : phrases et expressions, signaux par panneaux, panneaux d’identification, alphabet Morse — « rectifié le 23-4-35 »',
    `${PAPERS} (n° 1483)`,
  ),
  bonus('tableau-vocabulaire', 'tours', 'bare', 'Le « Vocabulaire » du code, collé sur carton, avec une feuille de notes au crayon', `${PAPERS} (n° 1484)`),
  bonus(
    'photos-de-reglage',
    'tours',
    'bare',
    'Deux photographies aériennes graduées, montées sur carton ; en marge : « BAT → 105 L (Rafales de 6) »',
    `${PAPERS} (« Photos navigation »)`,
  ),

  bonus('db-7-cinq-officiers', 'algerie', 'bare', 'Cinq officiers devant un Douglas DB-7', `${ALBUM} (n° 1472)`),
  bonus('db-7-groupe', 'algerie', 'bare', 'Un groupe devant un Douglas DB-7', `${ALBUM} (n° 1472)`),

  bonus('briefing-salle', 'nuit', 'photo', 'Le briefing : les équipages dans la salle', MISSION_TYPE),
  bonus(
    'apres-le-briefing',
    'nuit',
    'photo',
    'Des équipages après le briefing — Squadron 83 de la Royal Air Force, Scampton, 1942',
    `${MISSION_TYPE} ; lieu et date d’après le nom du fichier`,
  ),
  bonus('autour-de-la-table', 'nuit', 'photo', 'Des équipages autour d’une table, sous les cartes', `${MISSION_TYPE} ; cachet des Imperial War Museums`),

  bonus(
    'citation-legion-d-honneur',
    'missions',
    'bare',
    'Une feuille dactylographiée de la dernière citation que lit Éric Lemoine, à l’ordre de l’armée aérienne ; au crayon rouge : « L’homologation n’est pas portée sur le dossier »',
    `${PAPERS} (n° 1485)`,
  ),
];

export function bonusById(id: string): Bonus | null {
  return BONUSES.find((candidate) => candidate.id === id) ?? null;
}
