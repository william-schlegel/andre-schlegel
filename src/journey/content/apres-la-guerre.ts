import { chapterById } from './chapters';
import phrases from './generated/phrases-apres-la-guerre.json';
import sizes from './generated/prints-apres-la-guerre.json';
import type { ChapterContent, Cue, Frame, Place, PrintCue } from './types';

/**
 * Chapter 9 — Après la guerre, 1945 to 1962: the memorial at Elvington; the staff of the military
 * air transport in Paris; the flight of 1946 to Buenos Aires; the liaison group of the ministers
 * and the Avro York; the last Carnet and the last flight; the airlines of Indochina;
 * Nord-Aviation and the Noratlas; his death in 1962. Cue times are those of the Film's picture.
 *
 * What is not as the Film shows it:
 *  - the flight to Buenos Aires is inked on a sheet of the Chart, from Paris by Dakar and Rio;
 *  - the letter of congratulations is a typed sheet, typed as Eric reads it. Eric says the flight
 *    was made in an Avro York; the letter says « à bord du C.54 »: the captions keep his words,
 *    the Recognition model set down beside the letter is the C-54 it names;
 *  - the Film shows a computer picture of a French York: the York's Recognition model stands for it;
 *  - the Carnet of 1940 is put away and the last one, opened at Villacoublay in April 1947, takes its place;
 *  - the Film shows a typed copy of the death record, with the family's names and addresses: it is
 *    not reproduced. The Film's own closing card is typed instead, and the Chapter ends as the
 *    Journey began: his portrait, his three decorations, the Carnet closed.
 */

const media = (name: string) => `/media/apres-la-guerre/${name}.webp`;
const size = (name: keyof typeof sizes) => sizes[name] as [number, number];
const WEB = 'Photographie réunie par Éric Lemoine (source internet)';
const PERSONAL = 'Photographie personnelle d’André Schlegel';

const START = 3004;
/** The parts of the Chapter, as the Film's title changes. */
const GMMTA = 3024.9;
const BUENOS_AIRES = 3056.0;
const LETTER = 3086.0;
const GLAM = 3136.8;
const CARNET = 3179.9;
const INDOCHINA = 3216.6;
const NORD_AVIATION = 3249.6;
const DEATH = 3280.9;

/** A print of the Chapter: its picture and its size are found by its name. */
function print(id: keyof typeof sizes, at: number, until: number | undefined, width: number, x: number, z: number, turn: number, legend: string, source: string): PrintCue {
  return { kind: 'print', id, at, until, src: media(id), size: size(id), width, place: { x, z, turn }, legend, source };
}

/** Where each aircraft's Recognition model stands, one after the other. */
const MODEL: Place = { x: 0.88, z: 0.42, turn: -30 };
/** The whole sheet of the Chart, for the camera (see scenes/index.tsx for where it lies). */
const ATLANTIC: Frame = { x: -0.78, z: -0.17, width: 0.56, depth: 0.58 };
/** The end of the Chapter: the closing card, his portrait and his decorations. */
const LAST_TABLE: Frame = { x: 0.3, z: 0.03, width: 1.32, depth: 0.5 };

const cues: Cue[] = [
  { kind: 'view', id: 'table', at: START },

  // ---------- Elvington, today ----------
  // « Il reste un monument mémoriel au centre du village d’Elvington »
  print('memorial-elvington', 3007.9, GMMTA, 0.42, -0.12, -0.04, -2, 'Elvington : le monument à la mémoire des « Groupes lourds » français', WEB),
  // « dont la population garde un souvenir très prégnant de la présence française »
  print('memorial-ceremonie', 3011.9, GMMTA, 0.36, 0.4, -0.02, 2, 'Une cérémonie devant le monument, au centre du village', WEB),
  // « ainsi que de quelques mariages franco-britanniques »
  print('mariage-franco-britannique', 3017.6, GMMTA, 0.44, 0.12, 0.38, -1.5, 'Un mariage franco-britannique, au temps de la base', WEB),

  // ---------- the staff of the military air transport, June 1945 ----------
  { kind: 'view', id: 'gmmta', at: GMMTA },
  // « le capitaine Schlegel est affecté au Groupe des moyens militaires de transport aérien »
  print(
    'carte-gmmta',
    3033.1,
    BUENOS_AIRES,
    0.46,
    -0.1,
    -0.02,
    -2,
    'La carte d’identité militaire du capitaine Schlegel, établie au G.M.M.T.A. à Neuilly, le 9 octobre 1945',
    'Document personnel d’André Schlegel',
  ),
  // « toute la gestion technique du futur système de transport aérien militaire français »
  print('planche-avions', 3040.3, BUENOS_AIRES, 0.27, 0.42, 0.02, 3, 'Les avions du transport militaire de l’après-guerre', 'Planche réunie par Éric Lemoine (source internet)'),
  // « matériel recyclé, en particulier chez l’ennemi »
  print('junkers-52', 3046.0, BUENOS_AIRES, 0.38, 0.1, 0.42, -2, 'Un Junkers 52, rebaptisé « Toucan »', WEB),
  // « comme ce Junkers 52, rebaptisé « Toucan » »
  {
    kind: 'model',
    id: 'ju-52',
    at: 3047.9,
    until: 3072.2,
    model: 'ju-52',
    place: MODEL,
    label: ['Junkers Ju 52 « Toucan »', 'trimoteur de transport', 'G.M.M.T.A., 1945 – 1946'],
  },

  // ---------- the flight to Buenos Aires, 30 August to 7 September 1946 ----------
  { kind: 'view', id: 'buenos-aires', at: BUENOS_AIRES },
  // « le nouvel ambassadeur de France en Argentine, le comte Wladimir d’Ormesson »
  {
    ...print(
      'ambassadeur-d-ormesson',
      3060.8,
      GLAM,
      0.46,
      -0.1,
      -0.08,
      -2,
      'Buenos Aires, 1946 : l’ambassadeur de France, le comte Wladimir d’Ormesson, avec l’équipage de l’avion français',
      'Coupure du journal La Prensa, conservée par André Schlegel',
    ),
    // « Le commandant Schlegel est sur la photo de presse »
    rings: [{ at: 3067.3, box: [0.6, 0.22, 0.17, 0.68] }],
  },
  // « Le vol vers Buenos Aires, via Dakar et Rio, le chemin de l’Aéropostale » — the Route is inked from Paris
  { kind: 'chart', id: 'carte-dakar', at: 3073.0, view: 'dakar', frame: ATLANTIC },
  { kind: 'chart', id: 'carte-rio', at: 3074.9, view: 'rio', frame: ATLANTIC },
  { kind: 'chart', id: 'carte-buenos-aires', at: 3076.3, view: 'buenos-aires', frame: ATLANTIC },
  // « va s’effectuer sur l’Avro York personnel du général de Gaulle » — the cutting the Film shows
  print(
    'coupure-buenos-aires',
    3079.4,
    GLAM,
    0.5,
    -0.08,
    0.37,
    1.5,
    '« Llegó ayer el avión particular del Gral. de Gaulle » : l’avion à son arrivée à Buenos Aires',
    'Coupure de presse argentine, conservée par André Schlegel',
  ),
  // « Ce vol, particulièrement réussi, fera l’objet d’une dernière citation »
  { kind: 'view', id: 'derniere-citation', at: LETTER + 0.9, frame: { x: 0.14, z: 0.14, width: 1.1, depth: 0.74 } },
  // « Lettre de félicitations du 16 septembre 1946 »
  {
    kind: 'typed',
    id: 'lettre-de-felicitations',
    at: 3094.4,
    until: GLAM,
    place: { x: 0.38, z: 0.12, turn: -1.5 },
    width: 0.4,
    heading: ['PRÉSIDENCE DU GOUVERNEMENT PROVISOIRE', 'DE LA RÉPUBLIQUE FRANÇAISE', 'Lettre de félicitations n° 5801 — 16 septembre 1946'],
    text: [
      'Le Président du Gouvernement provisoire de la République française adresse ses félicitations au capitaine Raymond, commandant d’avion, ainsi qu’aux membres de l’équipage qui ont effectué à bord du C.54, du 30 août au 7 septembre, la liaison Paris – Rio de Janeiro – Buenos Aires et retour, dans des conditions de régularité et de sécurité qui font honneur à l’armée de l’Air, et mettant en évidence les brillantes qualités professionnelles du personnel de l’Escadrille gouvernementale.',
      'Pour le Président du G.P.R.F. et par délégation, le général de division Humbert, chef du cabinet militaire.',
      'Composition de l’équipage : capitaine Raymond, 1er pilote, commandant d’avion ; capitaine Schlegel, navigateur.',
    ].join('\n'),
    reading: [3099.8, 3132.7],
    legend: 'Lettre de félicitations de la présidence du Gouvernement provisoire, 16 septembre 1946',
    source: 'Texte de la lettre, tel que le film le donne',
  },
  // « à bord du C-54 » — the aircraft the letter names, set down beside it
  {
    kind: 'model',
    id: 'c-54',
    at: 3108.6,
    until: GLAM,
    aside: true,
    model: 'c-54',
    place: MODEL,
    label: ['Douglas C-54 Skymaster', 'Paris – Rio – Buenos Aires', '30 août – 7 septembre 1946'],
  },

  // ---------- the liaison group of the ministers, October 1946 ----------
  { kind: 'view', id: 'glam', at: GLAM },
  // « il est affecté au Groupement de liaisons aériennes ministérielles, le GLAM »
  {
    ...print('equipage-glam', 3144.7, INDOCHINA, 0.46, -0.1, -0.02, -2, 'André Schlegel, tête nue, sous l’aile d’un avion de transport, vers 1946-1947', PERSONAL),
    // « en tant que pilote et navigateur »
    rings: [{ at: 3149.7, box: [0.295, 0.36, 0.105, 0.2] }],
  },
  // « Il vole essentiellement sur l’Avro York »
  print('york-en-vol', 3156.8, INDOCHINA, 0.34, 0.42, -0.06, 2, 'Un Avro York en vol', WEB),
  {
    kind: 'model',
    id: 'york',
    at: 3160.1,
    until: INDOCHINA,
    model: 'york',
    place: MODEL,
    label: ['Avro York', 'transport quadrimoteur', 'G.L.A.M., 1946 – 1948'],
  },
  // « une version de transport améliorée du fameux bombardier britannique Lancaster »
  print('york-au-sol', 3164.9, INDOCHINA, 0.36, 0.4, 0.34, -2, 'Un Avro York français, au sol', 'Collection Franck Roumy (traditions-air.fr), réunie par Éric Lemoine'),
  // « On le voit ici, dans le cockpit »
  print('cockpit-york', 3171.0, INDOCHINA, 0.4, -0.06, 0.4, 2, 'André Schlegel dans le poste de pilotage d’un Avro York', PERSONAL),

  // ---------- the last Carnet: Villacoublay, 17 April 1947 ----------
  { kind: 'view', id: 'dernier-carnet', at: CARNET },
  // « Sur le dernier carnet de vol, de 1947 » — its title page
  { kind: 'spread', id: 'carnet-1947', at: 3183.1, carnet: '1947', spread: 1 },
  // « quelques vols internationaux vers l’Afrique noire : Dakar, Saint-Louis, Conakry, Bamako, Niamey »
  { kind: 'spread', id: 'carnet-afrique', at: 3187.1, carnet: '1947', spread: 4, marks: [{ at: 3189.6, box: [0.715, 0.24, 0.265, 0.62] }] },
  // « et vers l’Inde : Karachi, New Delhi »
  { kind: 'spread', id: 'carnet-inde', at: 3194.3, carnet: '1947', spread: 17, marks: [{ at: 3197.0, box: [0.715, 0.4, 0.275, 0.21] }] },
  // « Puis c’est le dernier vol. Tout à fait local, celui-là. » — Orly, 10 April 1948
  {
    kind: 'spread',
    id: 'carnet-dernier-vol',
    at: 3201.8,
    carnet: '1947',
    spread: 22,
    marks: [
      { at: 3205.1, box: [0.03, 0.41, 0.93, 0.17] },
      // « Il totalise alors plus de 2 000 heures de vol »
      { at: 3209.6, box: [0.385, 0.885, 0.1, 0.075] },
    ],
  },

  // ---------- the airlines of Indochina, 1948 to 1956 ----------
  { kind: 'view', id: 'indochine', at: INDOCHINA },
  // « André Schlegel est engagé par différentes sociétés de transport aérien indochinoises »
  {
    ...print('emplois-civils', 3222.7, NORD_AVIATION, 0.46, -0.08, 0.0, -1.5, 'Ses emplois civils, de 1948 à 1956 : S.I.T.A., S.T.A., puis Air Vietnam', 'Document personnel d’André Schlegel'),
    paper: 'sheet',
  },
  // « le DC-4 d’Air Vietnam »
  print('dc-4-air-vietnam', 3232.7, NORD_AVIATION, 0.36, 0.42, -0.08, 2, 'Un DC-4 d’Air Vietnam', WEB),
  // « l’Armagnac de la SAGETA »
  print('armagnac', 3237.1, NORD_AVIATION, 0.36, 0.44, 0.28, -2, 'Un SE.2010 Armagnac de la SAGETA', WEB),
  // « et le Constellation d’Air France »
  print('constellation-air-france', 3243.0, NORD_AVIATION, 0.36, 0.02, 0.42, 3, 'Le Constellation d’Air France', 'Carte postale réunie par Éric Lemoine (source internet)'),

  // ---------- Nord-Aviation, 1957 to 1962 ----------
  { kind: 'view', id: 'nord-aviation', at: NORD_AVIATION },
  // « Il devient enfin directeur technique chez Nord-Aviation » — the portrait stays to the end
  print('portrait-1960', 3252.3, undefined, 0.2, -0.2, -0.04, -3, 'André Schlegel vers 1960', 'Photographie d’identité, dossier familial'),
  // « Il participera au développement du fameux Noratlas »
  print('noratlas', 3262.5, DEATH, 0.38, 0.19, -0.11, 2, 'Le Nord 2501 Noratlas', WEB),
  print('noratlas-au-sol', 3265.7, DEATH, 0.36, 0.65, -0.03, -2, 'Un Noratlas au sol', PERSONAL),
  // « cet avion de transport aura une longue carrière »
  print('cockpit-noratlas', 3269.6, DEATH, 0.36, 0.0, 0.4, -2, 'Le poste de pilotage du Noratlas', PERSONAL),
  // « et servira en particulier pour les unités parachutistes »
  print('noratlas-en-vol', 3273.9, DEATH, 0.4, 0.44, 0.38, 2, 'Un Noratlas en vol', PERSONAL),

  // ---------- 6 October 1962 ----------
  // the Carnet is closed
  { kind: 'spread', id: 'carnet-referme', at: DEATH, aside: true, carnet: '1947', spread: 0 },
  { kind: 'view', id: 'derniere-table', at: DEATH, frame: LAST_TABLE },
  // « Le commandant André Schlegel va décéder à l’âge de 48 ans » — the Film's closing card
  {
    kind: 'typed',
    id: 'carton-de-fin',
    at: 3281.6,
    place: { x: 0.24, z: 0.02, turn: 1 },
    width: 0.5,
    heading: ['COMMANDANT ANDRÉ SCHLEGEL', '1914 – 1962'],
    text: [
      'Décédé à l’âge de 48 ans, le 6 octobre 1962, à 14 heures.',
      'Défaillance cardiaque, coronarienne et valvulaire : séquelles du stress subi lors des opérations de combat.',
      '« Mort pour la France ».',
    ].join('\n'),
    reading: [3282.2, 3300.6],
    legend: 'Le carton de fin du film',
    source: 'Texte du film d’Éric Lemoine',
    frame: LAST_TABLE,
  },
  // « Il sera donc reconnu « mort pour la France » » — his decorations, as on the first table
  { kind: 'decoration', id: 'legion-honneur', at: 3297.9, decoration: 'legion-honneur', place: { x: 0.62, z: 0.0, turn: -4 }, frame: LAST_TABLE },
  { kind: 'decoration', id: 'croix-de-guerre', at: 3298.6, decoration: 'croix-de-guerre', place: { x: 0.75, z: 0.01, turn: 3 }, frame: LAST_TABLE },
  { kind: 'decoration', id: 'dfc', at: 3299.3, decoration: 'dfc', place: { x: 0.88, z: 0.0, turn: 6 }, frame: LAST_TABLE },
  // « héros anonymes des groupes Guyenne et Tunisie »
  print('tombe', 3305.0, undefined, 0.36, -0.14, 0.36, -2, 'Sa tombe : « André Schlegel, 1914 – 1962 »', PERSONAL),
  { kind: 'view', id: 'fin', at: 3308.4 },
];

export const apresLaGuerre: ChapterContent = {
  chapter: chapterById('apres-la-guerre'),
  phrases,
  cues: cues.slice().sort((a, b) => a.at - b.at),
  postings: [
    {
      from: START,
      rank: 'Capitaine (officier d’état-major)',
      base: 'État-major de l’armée de l’Air',
      unit: 'G.M.M.T.A., 5e Bureau',
      dates: '5 juin 1945 – 2 octobre 1946',
    },
    {
      from: GLAM,
      rank: 'Capitaine, puis commandant',
      base: 'Villacoublay',
      unit: 'G.L.A.M. 1/40',
      dates: '3 octobre 1946 – avril 1948',
    },
    {
      from: INDOCHINA,
      rank: 'Chef des opérations, directeur technique',
      base: 'Indochine — Hanoï',
      unit: 'S.I.T.A., puis S.T.A., puis Air Vietnam',
      dates: '1948 – 1956',
    },
    {
      from: NORD_AVIATION,
      rank: 'Directeur technique',
      base: 'Nord-Aviation',
      unit: 'Développement du Noratlas',
      dates: '1957 – 1962',
    },
  ],
  marks: [
    { at: 3005.7, label: 'le monument d’Elvington' },
    { at: GMMTA, label: 'juin 1945 · G.M.M.T.A.' },
    { at: BUENOS_AIRES, label: '1946 · Buenos Aires' },
    { at: 3095.6, label: 'lettre de félicitations' },
    { at: GLAM, label: 'octobre 1946 · G.L.A.M.' },
    { at: 3182.6, label: 'le dernier carnet' },
    { at: 3203.9, label: '10 avril 1948 · dernier vol' },
    { at: INDOCHINA, label: '1948 – 1956 · Indochine' },
    { at: NORD_AVIATION, label: '1957 · Nord-Aviation' },
    { at: DEATH, label: '6 octobre 1962' },
  ],
  // the war is over: the Carnet of 1940 lies closed, until the last one takes its place
  companion: { carnet: '1940', place: { x: -0.66, z: 0.42, turn: -2 }, view: 0, next: { at: 3176.6, carnet: '1947' } },
};
