import type { ChapterId } from './types';

/**
 * Period music: a few seconds at a Chapter opening, fading as Eric speaks again.
 *
 * Only recordings whose source and licence have been approved are used (they are listed on
 * the Sources page); a Chapter without an entry opens without music. The excerpts are cut
 * by pipeline/music.sh.
 */
export interface Recording {
  src: string;
  title: string;
  performer: string;
  year: string;
  source: string;
  licence: string;
  /** Where to start in the recording, in seconds. */
  from?: number;
}

const COMMONS = 'https://commons.wikimedia.org/wiki/File:';

export const MUSIC: Partial<Record<ChapterId, Recording>> = {
  tours: {
    src: '/media/musique/tours.m4a',
    title: '« Marche lorraine », de Louis Ganne (1892)',
    performer: 'orchestre Odeon',
    year: 'vers 1910',
    source: `${COMMONS}Odeon-303277.ogg`,
    licence: 'domaine public (Public Domain Project)',
  },
  algerie: {
    src: '/media/musique/algerie.m4a',
    title: '« Le Régiment de Sambre et Meuse », de Robert Planquette',
    performer: 'orchestre Odeon',
    year: 'vers 1910',
    source: `${COMMONS}Odeon-303278.ogg`,
    licence: 'domaine public (Public Domain Project)',
  },
  'campagne-de-france': {
    src: '/media/musique/campagne-de-france.m4a',
    title: '« Le Régiment de Sambre et Meuse », de Robert Planquette et Paul Cézano',
    performer: 'chanté par Pierre d’Assy',
    year: '1905',
    source: `${COMMONS}Beaufort_regiment_de_sambre_et_1909_cd_1001.ogg`,
    licence: 'domaine public',
  },
  'ecole-anglaise': {
    src: '/media/musique/ecole-anglaise.m4a',
    title: '« Scotland the Brave », air traditionnel',
    performer: 'Pipe Band de l’United States Air Force Reserve',
    year: '1995',
    source: `${COMMONS}Scotland_the_Brave_-_United_States_Air_Force_Pipe_Band.oga`,
    licence: 'domaine public (enregistrement de l’U.S. Air Force)',
  },
  elvington: {
    src: '/media/musique/elvington.m4a',
    title: '« Pomp and Circumstance », marche n° 1, d’Edward Elgar (1901)',
    performer: 'United States Marine Band',
    year: 'date non précisée',
    source: `${COMMONS}ELGAR_Pomp_and_Circumstance_in_D,_Opus_39,_No._1_-_United_States_Marine_Band.mp3`,
    licence: 'domaine public (enregistrement de l’U.S. Marine Corps)',
  },
  'apres-la-guerre': {
    src: '/media/musique/apres-la-guerre.m4a',
    title: '« La Marseillaise », de Rouget de Lisle',
    performer: 'United States Navy Band',
    year: 'date non précisée',
    source: `${COMMONS}La_Marseillaise.ogg`,
    licence: 'domaine public (enregistrement de l’U.S. Navy)',
  },
};
