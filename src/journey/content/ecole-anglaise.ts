import { chapterById } from './chapters';
import phrases from './generated/phrases-ecole-anglaise.json';
import sizes from './generated/prints-ecole-anglaise.json';
import type { ChapterContent, Cue } from './types';

/**
 * Chapter 5 — L’école anglaise, autumn 1943 to June 1944: the crossing from Algiers to Liverpool,
 * then the three schools of the Royal Air Force — navigation at Dumfries on Avro Anson, crew
 * training at Lossiemouth on Wellington, conversion to the Halifax at Rufforth. Cue times are
 * those of the Film's picture.
 *
 * Where the Film shows a web map, the Chart is inked instead: the landfall at Liverpool, then
 * each school reached by a Route. The Film shows here a French film about a crew training at
 * Lossiemouth: it is projected whole, in step with its commentary. Each aircraft has its
 * Recognition model, on the table for as long as he flies it.
 */

const media = (name: string) => `/media/ecole-anglaise/${name}.webp`;
const size = (name: keyof typeof sizes) => sizes[name] as [number, number];
const DOSSIER_WEB = 'Photographie réunie par Éric Lemoine (source internet)';
const ERIC = 'Photographie d’Éric Lemoine, Yorkshire Air Museum, Elvington';

const START = 954.4;
/** The three schools, as the Film's title changes. */
const DUMFRIES = 1022.4;
const LOSSIEMOUTH = 1093.9;
const RUFFORTH = 1234.1;
/** The film about Lossiemouth: the screen goes up as Eric finishes announcing it; its first frame; its last. */
const SCREEN_UP = 1117.0;
const FILM = 1119.4875;
const FILM_END = 1159.2;

const MODEL_PLACE = { x: 1.3, z: 0.5, turn: -30 };

const cues: Cue[] = [
  { kind: 'view', id: 'table', at: START },

  // ---------- the crossing ----------
  // « partent d’Alger le 29 septembre à bord du S/S Marnix van St. Aldegonde »
  {
    kind: 'print',
    id: 'paquebot-marnix',
    at: 978.5,
    until: DUMFRIES,
    src: media('paquebot-marnix'),
    size: size('paquebot-marnix'),
    width: 0.4,
    place: { x: 0.3, z: -0.02, turn: -2 },
    legend: 'Le Marnix van St. Aldegonde, paquebot hollandais de 20 000 tonnes',
    source: 'Carte postale réunie par Éric Lemoine (source internet)',
  },
  // « transformé en transport de troupes »
  {
    kind: 'print',
    id: 'embarquement',
    at: 985.8,
    until: DUMFRIES,
    src: media('embarquement'),
    size: size('embarquement'),
    width: 0.42,
    place: { x: 0.78, z: 0.0, turn: 3 },
    legend: 'Un transport de troupes à quai',
    source: 'Photographie réunie par Éric Lemoine (source internet, delcampe.net)',
  },
  {
    kind: 'print',
    id: 'troupes-sur-le-pont',
    at: 989.1,
    until: DUMFRIES,
    src: media('troupes-sur-le-pont'),
    size: size('troupes-sur-le-pont'),
    width: 0.2,
    place: { x: 0.26, z: 0.37, turn: 2 },
    legend: 'Sur le pont d’un transport de troupes',
    source: DOSSIER_WEB,
    frame: { x: 0.54, z: 0.14, width: 0.98, depth: 0.74 },
  },
  // the ship comes in from the Irish Sea — « Arrivés le 8 octobre à Liverpool »
  { kind: 'chart', id: 'carte-traversee', at: 991.6, view: 'traversee' },
  // « Ici, le port militaire de Liverpool en 1944 »
  {
    kind: 'print',
    id: 'docks-de-liverpool',
    at: 1011.5,
    until: DUMFRIES,
    src: media('docks-de-liverpool'),
    size: size('docks-de-liverpool'),
    width: 0.4,
    place: { x: 0.64, z: 0.37, turn: -3 },
    legend: 'Le port militaire de Liverpool, 1944',
    source: DOSSIER_WEB,
  },
  // « et l’arrivée d’un transport de troupes, canadien sur cette photo »
  {
    kind: 'print',
    id: 'arrivee-liverpool',
    at: 1017.3,
    until: DUMFRIES,
    src: media('arrivee-liverpool'),
    size: size('arrivee-liverpool'),
    width: 0.36,
    place: { x: 1.05, z: 0.35, turn: 2 },
    legend: 'L’arrivée d’un transport de troupes canadien à Liverpool',
    source: DOSSIER_WEB,
  },

  // ---------- Dumfries ----------
  { kind: 'view', id: 'dumfries', at: DUMFRIES },
  // « Il est affecté à la base de Dumfries, dans le sud de l’Écosse »
  { kind: 'chart', id: 'carte-dumfries', at: 1028.9, view: 'dumfries' },
  {
    kind: 'print',
    id: 'base-de-dumfries',
    at: 1035.0,
    until: LOSSIEMOUTH,
    src: media('base-de-dumfries'),
    size: size('base-de-dumfries'),
    width: 0.26,
    place: { x: 0.2, z: 0.05, turn: -2 },
    legend: 'La base de Dumfries, vue du ciel',
    source: 'Photographie aérienne réunie par Éric Lemoine (source internet)',
  },
  // the first flights at Dumfries, in the Carnet
  { kind: 'spread', id: 'carnet-dumfries', at: 1045.4, carnet: '1940', spread: 30 },
  // « Les vols s’effectuent sur Avro Anson »
  {
    kind: 'model',
    id: 'anson',
    at: 1067.3,
    until: LOSSIEMOUTH,
    model: 'anson',
    place: MODEL_PLACE,
    label: ['Avro Anson', 'bimoteur d’entraînement', 'toile et bois'],
  },
  {
    kind: 'print',
    id: 'anson-en-vol',
    at: 1071.2,
    until: LOSSIEMOUTH,
    src: media('anson-en-vol'),
    size: size('anson-en-vol'),
    width: 0.4,
    place: { x: 0.64, z: -0.06, turn: 2 },
    legend: 'Avro Anson en vol',
    source: DOSSIER_WEB,
  },
  // « Un pilote, quatre élèves et instructeurs »
  {
    kind: 'print',
    id: 'ansons-au-sol',
    at: 1076.3,
    until: LOSSIEMOUTH,
    src: media('ansons-au-sol'),
    size: size('ansons-au-sol'),
    width: 0.4,
    place: { x: 0.76, z: 0.25, turn: -3 },
    legend: 'Des Avro Anson alignés sur un terrain d’école',
    source: DOSSIER_WEB,
  },
  // « Il subsiste un exemplaire en assez bon état au Yorkshire Air Museum, à Elvington »
  {
    kind: 'print',
    id: 'anson-musee-moteur',
    at: 1084.1,
    until: LOSSIEMOUTH,
    src: media('anson-musee-moteur'),
    size: size('anson-musee-moteur'),
    width: 0.36,
    place: { x: 1.1, z: -0.05, turn: -2 },
    legend: 'L’Avro Anson du Yorkshire Air Museum : un moteur',
    source: ERIC,
  },
  {
    kind: 'print',
    id: 'anson-musee-cabine',
    at: 1089.7,
    until: LOSSIEMOUTH,
    src: media('anson-musee-cabine'),
    size: size('anson-musee-cabine'),
    width: 0.36,
    place: { x: 0.33, z: 0.47, turn: 2 },
    legend: 'L’Avro Anson du Yorkshire Air Museum : la cabine vitrée',
    source: ERIC,
  },

  // ---------- Lossiemouth ----------
  { kind: 'view', id: 'lossiemouth', at: LOSSIEMOUTH },
  // « sur leur nouvelle base du nord de l’Écosse, à Lossiemouth »
  { kind: 'chart', id: 'carte-lossiemouth', at: 1105.4, view: 'lossiemouth' },
  {
    kind: 'print',
    id: 'base-de-lossiemouth',
    at: 1111.3,
    until: RUFFORTH,
    src: media('base-de-lossiemouth'),
    size: size('base-de-lossiemouth'),
    width: 0.25,
    place: { x: 0.12, z: 0.02, turn: -2 },
    legend: 'La base de Lossiemouth, au bord du Moray Firth (vue récente)',
    source: 'Photographie aérienne réunie par Éric Lemoine (source internet)',
  },
  {
    kind: 'print',
    id: 'plan-de-lossiemouth',
    at: 1115.8,
    until: RUFFORTH,
    src: media('plan-de-lossiemouth'),
    size: size('plan-de-lossiemouth'),
    width: 0.25,
    place: { x: 0.14, z: 0.37, turn: 2 },
    paper: 'sheet',
    legend: 'Plan de la base de Lossiemouth',
    source: 'Plan réuni par Éric Lemoine (source internet, Royal Navy Research Archive)',
  },
  // « Le film qui suit va montrer le quotidien des équipages français à l’entraînement »
  {
    kind: 'projection',
    id: 'film-lossiemouth',
    at: SCREEN_UP,
    starts: FILM,
    until: FILM_END,
    src: '/media/ecole-anglaise/lossiemouth-otu-20.mp4',
    size: [632, 476],
    place: { x: 0.74, z: -0.52 },
    width: 0.62,
    legend: 'Un équipage français à l’entraînement sur Wellington, 20e OTU, Lossiemouth, 1944',
    source: 'Institut national de l’audiovisuel (ina.fr)',
  },
  // « Le climat quasi polaire de cette région en plein hiver »
  {
    kind: 'print',
    id: 'wellington-neige',
    at: 1163.2,
    until: RUFFORTH,
    src: media('wellington-neige'),
    size: size('wellington-neige'),
    width: 0.44,
    place: { x: 0.62, z: 0.0, turn: 2 },
    legend: 'Un Wellington de la 20e OTU dans la neige, Lossiemouth, 1944',
    source: DOSSIER_WEB,
  },
  // « au sein de formations de bombardiers lourds de la Royal Air Force »
  {
    kind: 'print',
    id: 'bombardiers-tableau',
    at: 1172.0,
    until: RUFFORTH,
    src: media('bombardiers-tableau'),
    size: size('bombardiers-tableau'),
    width: 0.4,
    place: { x: 1.07, z: 0.0, turn: -3 },
    legend: 'Des bombardiers lourds au-dessus des côtes : un tableau',
    source: 'Tableau photographié par Éric Lemoine',
  },
  // « Le Wellington est un bombardier bimoteur »
  {
    kind: 'model',
    id: 'wellington',
    at: 1187.8,
    until: RUFFORTH,
    model: 'wellington',
    place: MODEL_PLACE,
    label: ['Vickers Wellington', 'bombardier moyen — six hommes', 'avion d’entraînement'],
  },
  {
    kind: 'print',
    id: 'wellington-en-vol',
    at: 1190.9,
    until: RUFFORTH,
    src: media('wellington-en-vol'),
    size: size('wellington-en-vol'),
    width: 0.46,
    place: { x: 0.66, z: 0.37, turn: -2 },
    legend: 'Vickers Wellington en vol',
    source: DOSSIER_WEB,
  },
  // « Les vols comprennent différents exercices : du vol en solo simple… »
  {
    kind: 'spread',
    id: 'carnet-lossiemouth',
    at: 1211.6,
    carnet: '1940',
    spread: 35,
    marks: [{ at: 1215.0, box: [0.057, 0.402, 0.789, 0.115] }],
  },
  // « …jusqu’aux fameux cross-country »
  {
    kind: 'spread',
    id: 'carnet-cross-country',
    at: 1220.3,
    carnet: '1940',
    spread: 37,
    marks: [{ at: 1224.8, box: [0.06, 0.343, 0.792, 0.111] }],
  },

  // ---------- Rufforth ----------
  { kind: 'view', id: 'rufforth', at: RUFFORTH },
  // « La base de Rufforth… se situe un peu à l’ouest de la ville d’York »
  { kind: 'chart', id: 'carte-rufforth', at: 1243.3, view: 'rufforth' },
  // « Les vols s’effectuent sur Halifax V »
  {
    kind: 'print',
    id: 'halifax-v',
    at: 1254.5,
    src: media('halifax-v'),
    size: size('halifax-v'),
    width: 0.46,
    place: { x: 0.34, z: -0.02, turn: -2 },
    legend: 'Un Halifax V de la Heavy Conversion Unit 1663, 1944',
    source: DOSSIER_WEB,
  },
  // « mais les équipements et le comportement global de l’avion restent les mêmes »
  {
    kind: 'model',
    id: 'halifax',
    at: 1261.6,
    model: 'halifax',
    place: { x: 1.36, z: 0.45, turn: -30 },
    label: ['Halifax', 'bombardier lourd — sept hommes', 'quadrimoteur'],
  },
  // « Notez l’immatriculation « H » sur le deuxième »
  {
    kind: 'print',
    id: 'halifax-h-controleur',
    at: 1272.4,
    src: media('halifax-h-controleur'),
    size: size('halifax-h-controleur'),
    width: 0.46,
    place: { x: 0.84, z: 0.02, turn: 2 },
    legend: 'Le Halifax « H » de la Heavy Conversion Unit 1663 à l’atterrissage, 1944',
    source: 'Photographie réunie par Éric Lemoine (source internet, Imperial War Museums)',
  },
  // « le lieutenant Schlegel a volé sur cet avion »
  {
    kind: 'print',
    id: 'schlegel-en-angleterre',
    at: 1277.4,
    src: media('schlegel-en-angleterre'),
    size: size('schlegel-en-angleterre'),
    width: 0.16,
    place: { x: 0.5, z: 0.32, turn: -4 },
    paper: 'bare',
    legend: 'André Schlegel, sous l’uniforme porté en Angleterre',
    source: 'Photographie personnelle d’André Schlegel (image du film)',
    frame: { x: 0.74, z: 0.1, width: 0.76, depth: 0.62 },
  },
  // « Sur ces vols, les équipages sont quasi définitifs »
  { kind: 'spread', id: 'carnet-rufforth', at: 1288.3, carnet: '1940', spread: 40 },
  // « Et ici, un vol sur l’Halifax immatriculé « H » »
  {
    kind: 'spread',
    id: 'carnet-halifax-h',
    at: 1296.4,
    carnet: '1940',
    spread: 42,
    marks: [
      { at: 1299.0, box: [0.416, 0.32, 0.101, 0.1] },
      { at: 1302.8, box: [0.214, 0.209, 0.135, 0.056] },
    ],
  },
];

const UNIT = 'Groupe 1/25 « Tunisie »';

export const ecoleAnglaise: ChapterContent = {
  chapter: chapterById('ecole-anglaise'),
  phrases,
  cues,
  postings: [
    { from: START, rank: 'Lieutenant', base: 'Transfert vers l’Angleterre', unit: UNIT, dates: 'août – octobre 1943' },
    { from: DUMFRIES, rank: 'Lieutenant', base: '10 AFU Dumfries', unit: UNIT, dates: 'novembre 1943 – janvier 1944' },
    { from: LOSSIEMOUTH, rank: 'Lieutenant', base: 'OTU 20 Lossiemouth (Milltown)', unit: UNIT, dates: 'février – avril 1944' },
    { from: RUFFORTH, rank: 'Lieutenant', base: 'HCU 1663 Rufforth', unit: UNIT, dates: 'mai – juin 1944' },
  ],
  marks: [
    { at: 955.2, label: 'automne 1943 · départ d’Alger' },
    { at: 997.5, label: '8 octobre 1943 · Liverpool' },
    { at: 1022.3, label: 'Dumfries · navigation' },
    { at: 1095.9, label: 'Lossiemouth · les équipages' },
    { at: FILM, label: 'film d’archives' },
    { at: 1187.4, label: 'Wellington' },
    { at: 1235.8, label: 'Rufforth · Halifax' },
  ],
  companion: { carnet: '1940', place: { x: -0.5, z: 0.4, turn: -2 }, view: 25 },
};
