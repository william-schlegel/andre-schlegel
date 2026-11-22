import { contentOf } from '../content';
import type { ChapterId } from '../content/types';
import { POSTS } from './places';

/**
 * The places of the Narration, for the whole Chart: every place Eric names or the Chart inks,
 * with the moments at which it is told. A moment is given by the words Eric says (or, where he
 * names nothing, by the cue that inks the Chart), never by a number of seconds: it follows the
 * Narration if its timing is corrected.
 */

/** A moment of the Narration at which a place is told. */
export interface Moment {
  /** Where the Narration is taken: the start of the sentence that tells it. */
  at: number;
  /** What is told there, in a few words. */
  what: string;
}

/** The two sheets the whole Chart is made of. */
export type WholeSheet = 'ensemble' | 'atlantique-sud';

export interface ToldPlace {
  id: string;
  name: string;
  /** Longitude and latitude, in degrees. */
  at: [number, number];
  sheet: WholeSheet;
  /** The country several places share: it names them when they stand too close to be told apart. */
  region?: string;
  moments: Moment[];
}

/** A place too far for either sheet: listed beside the Chart. */
export interface FarPlace {
  id: string;
  name: string;
  moments: Moment[];
}

type Source = { chapter: ChapterId; said: string } | { chapter: ChapterId; cue: string } | { chapter: ChapterId; opens: true };

/** The moment Eric says these words in a Chapter. */
const said = (chapter: ChapterId, words: string): Source => ({ chapter, said: words });
/** The moment a cue of a Chapter comes (the Chart is inked while Eric speaks of something else). */
const cue = (chapter: ChapterId, id: string): Source => ({ chapter, cue: id });

/** A sentence ends on a full stop; so does an item of a list Eric reads out. */
const ENDS_A_SENTENCE = /[.!?…»;]\s*$/;
/** A sentence is taken up from its first word, unless it began longer ago than this. */
const AS_FAR_BACK = 14;

/** The start of the sentence being said at a moment of a Chapter. */
export function sentenceStart(chapter: ChapterId, time: number): number {
  const { phrases } = contentOf(chapter);
  let index = -1;
  for (let i = 0; i < phrases.length; i++) if (phrases[i].start <= time) index = i;
  if (index < 0) return contentOf(chapter).chapter.start;
  // the cue of a place may come in the silence before the sentence that names it
  if (time >= phrases[index].end && index + 1 < phrases.length && phrases[index + 1].start - time < 3) index += 1;
  while (index > 0 && !ENDS_A_SENTENCE.test(phrases[index - 1].text) && phrases[index].start - phrases[index - 1].start < AS_FAR_BACK && time - phrases[index - 1].start < AS_FAR_BACK) {
    index -= 1;
  }
  return phrases[index].start;
}

function resolve(source: Source): number {
  const content = contentOf(source.chapter);
  if ('opens' in source) return content.chapter.start;
  if ('cue' in source) {
    const found = content.cues.find((candidate) => candidate.id === source.cue);
    if (!found) throw new Error(`No cue « ${source.cue} » in ${source.chapter}`);
    return sentenceStart(source.chapter, found.at);
  }
  const phrase = content.phrases.find((candidate) => candidate.text.includes(source.said));
  if (!phrase) throw new Error(`Eric does not say « ${source.said} » in ${source.chapter}`);
  return sentenceStart(source.chapter, phrase.start);
}

type Draft = Omit<ToldPlace, 'moments' | 'sheet'> & { sheet?: WholeSheet; moments: [Source, string][] };

const TORCH: [Source, string] = [said('algerie-sous-vichy', 'opération « Torch »'), 'Le débarquement allié, opération « Torch », novembre 1942'];
const SUMMER_1944 = 'Les objectifs de l’été 1944';
const FLIGHT_1946: [Source, string] = [said('apres-la-guerre', 'Le vol vers Buenos Aires'), 'Le vol Paris – Rio de Janeiro – Buenos Aires, 1946'];
const TO_AFRICA: [Source, string] = [said('apres-la-guerre', 'Dakar, Saint-Louis'), 'Carnet de 1947 : les vols vers l’Afrique'];

const DRAFTS: Draft[] = [
  // ----- Chapter 1 -----
  { id: 'tours', name: 'Tours', at: POSTS.tours.at, moments: [[said('tours', 'basée à Tours'), 'La base 131 et la 31e escadre']] },

  // ----- Chapters 2 and 4: Algeria and Morocco -----
  {
    id: 'oran',
    name: 'Oran-La Sénia',
    at: POSTS.oran.at,
    region: 'Oranie',
    moments: [[said('algerie', 'Oran-La Sénia'), 'La base 121, janvier 1939'], TORCH],
  },
  {
    id: 'mers-el-kebir',
    name: 'Mers el-Kébir',
    at: [-0.71, 35.74],
    region: 'Oranie',
    moments: [[said('algerie-sous-vichy', 'opération « Catapult »'), 'L’opération « Catapult », 3 et 4 juillet 1940']],
  },
  { id: 'biskra', name: 'Biskra', at: POSTS.biskra.at, moments: [[said('algerie', 'la base de Biskra'), 'La base de Biskra, septembre 1939']] },
  {
    id: 'meknes',
    name: 'Meknès',
    at: POSTS.meknes.at,
    moments: [
      [said('algerie', 'transférée à Meknès'), 'La 19e escadre à Meknès, avril 1940'],
      [said('algerie-sous-vichy', 'à partir de la base de Meknès'), 'Les raids sur Gibraltar, septembre 1940'],
    ],
  },
  { id: 'gibraltar', name: 'Gibraltar', at: [-5.35, 36.14], moments: [[said('algerie-sous-vichy', 'deux raids sur Gibraltar'), 'Les raids des 24 et 25 septembre 1940']] },
  { id: 'casablanca', name: 'Casablanca', at: [-7.6, 33.59], moments: [TORCH] },
  { id: 'blida', name: 'Blida', at: POSTS.blida.at, region: 'Algérois', moments: [[said('algerie-sous-vichy', 'Sur la base de Blida'), 'La base de Blida, 1940 – 1943']] },
  {
    id: 'alger',
    name: 'Alger',
    at: [3.06, 36.75],
    region: 'Algérois',
    moments: [TORCH, [said('ecole-anglaise', 'partent d’Alger'), 'Le départ pour l’Angleterre, 29 septembre 1943']],
  },

  // ----- Chapter 3: the campaign of 1940 -----
  { id: 'evreux', name: 'Évreux-Danville', at: POSTS.evreux.at, moments: [[said('campagne-de-france', 'Évreux-Danville'), 'La base d’Évreux-Danville, mai 1940']] },
  {
    id: 'abbeville',
    name: 'Abbeville',
    at: [1.83, 50.11],
    region: 'Nord de la France',
    moments: [[said('campagne-de-france', 'Abbeville et Saint-Quentin'), 'Les missions de combat de 1940']],
  },
  {
    id: 'saint-quentin',
    name: 'Saint-Quentin',
    at: [3.29, 49.85],
    region: 'Nord de la France',
    moments: [[said('campagne-de-france', 'Abbeville et Saint-Quentin'), 'Les missions de combat de 1940']],
  },
  { id: 'pithiviers', name: 'Pithiviers', at: POSTS.pithiviers.at, moments: [[said('campagne-de-france', 'changer de base pour Pithiviers'), 'Le repli sur Pithiviers, juin 1940']] },

  // ----- Chapter 5: the schools of the Royal Air Force -----
  { id: 'liverpool', name: 'Liverpool', at: POSTS.liverpool.at, moments: [[said('ecole-anglaise', 'Arrivés le 8 octobre à Liverpool'), 'L’arrivée en Angleterre, 8 octobre 1943']] },
  { id: 'dumfries', name: 'Dumfries', at: POSTS.dumfries.at, moments: [[said('ecole-anglaise', 'la base de Dumfries'), '10e Advanced Flying Unit, novembre 1943']] },
  { id: 'lossiemouth', name: 'Lossiemouth', at: POSTS.lossiemouth.at, moments: [[said('ecole-anglaise', 'à Lossiemouth'), '20e Operational Training Unit, février 1944']] },
  { id: 'rufforth', name: 'Rufforth', at: POSTS.rufforth.at, region: 'Yorkshire', moments: [[said('ecole-anglaise', 'La base de Rufforth'), 'Heavy Conversion Unit 1663, mai 1944']] },

  // ----- Chapters 6 to 8: Elvington and its objectives -----
  {
    id: 'elvington',
    name: 'Elvington',
    at: POSTS.elvington.at,
    region: 'Yorkshire',
    moments: [
      [said('elvington', 'la station d’Elvington'), 'La station des groupes lourds, juillet 1944'],
      [cue('elvington', 'carte-portee'), 'Le rayon d’action des Halifax'],
      [{ chapter: 'nuit', opens: true }, 'Une nuit sur l’Allemagne : la mission, du briefing au retour'],
      [said('missions', 'il quitte Elvington'), 'Le départ d’Elvington, 18 avril 1945'],
      [said('apres-la-guerre', 'village d’Elvington'), 'Le monument du village'],
    ],
  },
  {
    id: 'nieppe',
    name: 'Forêt de Nieppe',
    at: [2.53, 50.72],
    region: 'Nord de la France',
    moments: [
      [said('missions', 'la forêt de Nieppe'), `${SUMMER_1944} : une base de V1`],
      [said('missions', 'La mission sur la forêt de Nieppe'), 'La mission sur trois jours'],
    ],
  },
  { id: 'noyelles', name: 'Noyelles', at: [1.71, 50.18], region: 'Nord de la France', moments: [[said('missions', 'Noyelles, près d’Abbeville'), `${SUMMER_1944} : une base de V1`]] },
  { id: 'cassan', name: 'Bois de Cassan', at: [2.22, 49.11], moments: [[said('missions', 'le bois de Cassan'), `${SUMMER_1944} : une base de V1`]] },
  {
    id: 'somain',
    name: 'Somain',
    at: [3.28, 50.36],
    region: 'Nord de la France',
    moments: [
      [said('missions', 'la gare de triage de Somain'), `${SUMMER_1944} : la gare de triage`],
      [said('missions', 'de la gare de Somain'), 'La mission du 11 août 1944'],
    ],
  },
  { id: 'octeville', name: 'Octeville', at: [0.11, 49.57], moments: [[said('missions', 'Octeville, près du Havre'), `${SUMMER_1944} : un point d’appui de la Wehrmacht`]] },
  { id: 'boulogne', name: 'Boulogne', at: [1.61, 50.73], region: 'Nord de la France', moments: [[said('missions', 'de même que Boulogne'), SUMMER_1944]] },
  { id: 'manston', name: 'Manston', at: [1.35, 51.35], moments: [[said('missions', 'atterrissage à Manston'), 'Les atterrissages à court de carburant']] },
  {
    id: 'ruhr',
    name: 'La Ruhr',
    at: [7.3, 51.42],
    region: 'La Ruhr',
    moments: [
      [cue('nuit', 'route-objectif'), 'Une nuit sur l’Allemagne : au-dessus de l’objectif'],
      [said('missions', 'Ils sont situés sur la Ruhr'), 'Les objectifs d’octobre 1944 à mars 1945'],
    ],
  },
  { id: 'wanne-eickel', name: 'Wanne-Eickel', at: [7.15, 51.53], region: 'La Ruhr', moments: [[said('missions', 'Wanne-Eickel'), 'La mission du 25 juillet 1944']] },
  { id: 'bochum', name: 'Bochum', at: [7.22, 51.48], region: 'La Ruhr', moments: [[said('missions', 'usines de Bochum'), 'Le Halifax touché, 9 octobre 1944']] },
  { id: 'duisbourg', name: 'Duisbourg', at: [6.76, 51.43], region: 'La Ruhr', moments: [[said('missions', 'mission du 18 décembre sur Duisbourg'), 'La mission du 18 décembre 1944']] },
  { id: 'mulheim', name: 'Mülheim-Essen', at: [6.94, 51.4], region: 'La Ruhr', moments: [[said('missions', 'Mülheim-Essen'), 'La mission sur l’aérodrome, 24 décembre 1944']] },
  { id: 'wilhelmshaven', name: 'Wilhelmshaven', at: [8.11, 53.52], region: 'Les ports du Nord', moments: [[said('missions', 'les ports du Nord'), 'Les ports du Nord']] },
  { id: 'hambourg', name: 'Hambourg', at: [9.99, 53.55], region: 'Les ports du Nord', moments: [[said('missions', 'les ports du Nord'), 'Les ports du Nord']] },
  // Eric says « la Bavière »: the southernmost towns of the Missions list are Worms and Stuttgart
  { id: 'worms', name: 'Worms', at: [8.36, 49.63], moments: [[said('missions', 'ainsi que la Bavière'), 'Les objectifs du sud de l’Allemagne']] },
  { id: 'stuttgart', name: 'Stuttgart', at: [9.18, 48.78], moments: [[said('missions', 'ainsi que la Bavière'), 'Les objectifs du sud de l’Allemagne']] },
  { id: 'chemnitz', name: 'Chemnitz', at: [12.92, 50.83], region: 'Saxe', moments: [[said('missions', 'Dresde, le 13, et Chemnitz'), 'La mission du 14 février 1945']] },
  { id: 'dresde', name: 'Dresde', at: [13.74, 51.05], region: 'Saxe', moments: [[said('missions', 'Dresde, le 13, et Chemnitz'), 'Le bombardement du 13 février 1945']] },

  // ----- Chapter 9: after the war -----
  { id: 'paris', name: 'Paris', at: POSTS.paris.at, moments: [[said('apres-la-guerre', 'Groupe des moyens militaires de transport aérien'), 'Le G.M.M.T.A., juin 1945'], FLIGHT_1946] },
  { id: 'paris-1946', name: 'Paris', at: POSTS.paris.at, sheet: 'atlantique-sud', moments: [FLIGHT_1946] },
  { id: 'dakar', name: 'Dakar', at: POSTS.dakar.at, sheet: 'atlantique-sud', moments: [FLIGHT_1946, TO_AFRICA] },
  { id: 'rio', name: 'Rio de Janeiro', at: POSTS.rio.at, sheet: 'atlantique-sud', moments: [FLIGHT_1946] },
  { id: 'buenos-aires', name: 'Buenos Aires', at: POSTS['buenos-aires'].at, sheet: 'atlantique-sud', moments: [FLIGHT_1946] },
  { id: 'saint-louis', name: 'Saint-Louis', at: [-16.49, 16.02], sheet: 'atlantique-sud', moments: [TO_AFRICA] },
  { id: 'conakry', name: 'Conakry', at: [-13.7, 9.5], sheet: 'atlantique-sud', moments: [TO_AFRICA] },
  { id: 'bamako', name: 'Bamako', at: [-8.0, 12.65], sheet: 'atlantique-sud', moments: [TO_AFRICA] },
  { id: 'niamey', name: 'Niamey', at: [2.11, 13.51], sheet: 'atlantique-sud', moments: [TO_AFRICA] },
];

const TO_INDIA: [Source, string] = [said('apres-la-guerre', 'Karachi, New Delhi'), 'Carnet de 1947 : les vols vers l’Inde'];
const FAR_DRAFTS: { id: string; name: string; moments: [Source, string][] }[] = [
  { id: 'karachi', name: 'Karachi', moments: [TO_INDIA] },
  { id: 'new-delhi', name: 'New Delhi', moments: [TO_INDIA] },
];

const moments = (drafts: [Source, string][]): Moment[] => drafts.map(([source, what]) => ({ at: resolve(source), what })).sort((a, b) => a.at - b.at);

let places: ToldPlace[] | null = null;
let far: FarPlace[] | null = null;

/** The places of the Narration that stand on the whole Chart. */
export function toldPlaces(): ToldPlace[] {
  places ??= DRAFTS.map((draft) => ({ ...draft, sheet: draft.sheet ?? 'ensemble', moments: moments(draft.moments) }));
  return places;
}

/** The places of the Narration that neither sheet reaches. */
export function farPlaces(): FarPlace[] {
  far ??= FAR_DRAFTS.map((draft) => ({ ...draft, moments: moments(draft.moments) }));
  return far;
}
