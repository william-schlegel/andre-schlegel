import { chapterById } from './chapters';
import phrases from './generated/phrases-elvington.json';
import sizes from './generated/prints-elvington.json';
import type { ChapterContent, Cue, PrintCue } from './types';

/**
 * Chapter 6 — Elvington, July 1944 to April 1945: the station of the two French heavy squadrons
 * near York, the Halifax Mk III, the crew of Captain Schlegel, and each man's post in the aircraft.
 * Cue times are those of the Film's picture.
 *
 * Where the Film shows a web map, the Chart is inked instead: Elvington, then the arc of what a
 * Halifax can reach from it. The Film's two lists — the aircraft's characteristics and the crew —
 * are typed sheets here, typed as Eric reads them. The crew's sheet stays on the table while he
 * goes from post to post, and so does the cut-away model on which he names them.
 */

const media = (name: string) => `/media/elvington/${name}.webp`;
const size = (name: keyof typeof sizes) => sizes[name] as [number, number];
const WEB = 'Photographie réunie par Éric Lemoine (source internet)';
const ERIC = 'Photographie d’Éric Lemoine, Yorkshire Air Museum, Elvington';
const BOOK = 'Reproduction réunie par Éric Lemoine, d’après un ouvrage';

const START = 1308;
/** The parts of the Chapter: the buildings of the station, the aircraft, the crew, then each post. */
const BUILDINGS = 1366.5;
const HALIFAX = 1428.0;
const CREW = 1486.5;
const POSTS = 1541.0;
const NAVIGATOR = 1583.0;
const BOMB_AIMER = 1669.5;
const WIRELESS = 1691.5;
const ENGINEER = 1711.5;
const MID_UPPER = 1743.5;
const REAR = 1760.5;

/** A print of the Chapter: its picture and its size are found by its name. */
function print(id: keyof typeof sizes, at: number, until: number | undefined, width: number, x: number, z: number, turn: number, legend: string, source: string): PrintCue {
  return { kind: 'print', id, at, until, src: media(id), size: size(id), width, place: { x, z, turn }, legend, source };
}

const cues: Cue[] = [
  { kind: 'view', id: 'table', at: START },

  // ---------- the station ----------
  // « Elle est située à une dizaine de kilomètres au sud-est de la ville d’York »
  { kind: 'chart', id: 'carte-elvington', at: 1322.6, view: 'elvington' },
  // « Occupée par les squadrons 346 « Guyenne » et 347 « Tunisie » »
  {
    ...print('plan-de-la-base', 1328.4, BUILDINGS, 0.36, 0.24, 0.1, -2, 'Plan de la station d’Elvington : une piste principale de 1 800 m et deux pistes secondaires', BOOK),
    paper: 'sheet',
  },
  // « signe de l’amitié franco-anglaise existant sur place »
  print('insigne-tunisie', 1340.2, BUILDINGS, 0.17, 0.66, 0.0, 3, 'L’insigne du groupe de bombardement 1/25 « Tunisie »', 'Image réunie par Éric Lemoine (source internet)'),
  {
    ...print('insigne-groupes-lourds', 1344.1, BUILDINGS, 0.15, 0.9, 0.06, -3, 'L’insigne des Groupes lourds', 'Image réunie par Éric Lemoine (source internet, SHD Air)'),
    frame: { x: 0.5, z: 0.08, width: 1.0, depth: 0.46 },
  },
  // « Cette situation géographique permet aux bombardiers Halifax III… » — the whole sheet, then the arc
  { kind: 'view', id: 'carte-europe', at: 1351.3, frame: { x: -0.5, z: -0.22, width: 0.84, depth: 0.6 } },
  // « …d’atteindre une grande partie de la France, de la Belgique, des Pays-Bas et, bien sûr, de l’Allemagne »
  { kind: 'chart', id: 'carte-portee', at: 1355.4, view: 'portee' },

  // ---------- the buildings ----------
  { kind: 'view', id: 'batiments', at: BUILDINGS },
  // « avec la place d’armes, lieu de défilé »
  print(
    'prise-d-armes',
    1367.2,
    HALIFAX,
    0.38,
    0.2,
    -0.12,
    -2,
    'Le général Valin et l’Air Commodore Walker saluent les équipages, Elvington, 27 mai 1944 (panneau du musée)',
    ERIC,
  ),
  // « et de lever des couleurs, ici à l’époque »
  print('lever-des-couleurs', 1378.3, HALIFAX, 0.36, 0.63, -0.1, 2, 'Le lever des couleurs sur la place d’armes, à l’époque', WEB),
  // « et de nos jours »
  print('place-d-armes', 1383.0, HALIFAX, 0.36, 1.05, -0.12, -2, 'La place d’armes aujourd’hui', ERIC),
  // « On remarquera la chapelle, vue de l’extérieur, avec l’architecture typique des abris Nissen »
  print('chapelle', 1387.9, HALIFAX, 0.36, 0.22, 0.17, 2, 'La chapelle, dans un abri Nissen en demi-cylindre', ERIC),
  // « et maintenant de l’intérieur. Il s’agit d’un lieu de mémoire. »
  print('chapelle-interieur', 1395.6, HALIFAX, 0.36, 0.63, 0.19, -3, 'L’intérieur de la chapelle, lieu de mémoire', ERIC),
  // « À noter, après les bâtiments techniques »
  print('batiments-techniques', 1400.3, HALIFAX, 0.36, 1.05, 0.17, 2, 'Les bâtiments techniques', ERIC),
  // « la tour de contrôle, ici couverte d’officiers français et anglais, le jour du départ des Français »
  print(
    'tour-octobre-1945',
    1409.2,
    HALIFAX,
    0.42,
    0.26,
    0.46,
    -2,
    'La tour de contrôle couverte d’officiers français et anglais, au départ des Français, octobre 1945',
    'Image du documentaire « RAF Bases Declassified : RAF Elvington », réunie par Éric Lemoine',
  ),
  // « et telle qu’elle est maintenant »
  print('tour-de-controle', 1419.7, HALIFAX, 0.38, 0.72, 0.46, 3, 'La tour de contrôle aujourd’hui', WEB),
  // « avec une très fidèle reconstitution d’époque à l’intérieur »
  print(
    'tour-interieur',
    1424.2,
    HALIFAX,
    0.32,
    1.12,
    0.46,
    -2,
    'L’intérieur de la tour, reconstitué comme à l’époque',
    'Photographie réunie par Éric Lemoine (source internet, Island Images, © Jon Wortham)',
  ),

  // ---------- the Halifax Mk III ----------
  { kind: 'view', id: 'halifax-iii', at: HALIFAX },
  // « Il vole maintenant sur Handley Page Halifax Mark III »
  {
    kind: 'model',
    id: 'halifax',
    at: 1428.5,
    model: 'halifax',
    place: { x: 1.32, z: 0.42, turn: -30 },
    label: ['Halifax Mk III', 'bombardier lourd — sept hommes', 'Squadron 347 « Tunisie »'],
  },
  print('halifax-iii-en-vol', 1430.1, CREW, 0.46, 0.3, -0.06, -2, 'Un Halifax Mk III en vol', WEB),
  // « Voici quelques caractéristiques techniques » — the Film's list
  {
    kind: 'typed',
    id: 'fiche-halifax',
    at: 1449.1,
    until: CREW,
    place: { x: 0.82, z: -0.02, turn: 2 },
    width: 0.34,
    heading: ['HANDLEY PAGE HALIFAX Mk III', 'Bombardier lourd quadrimoteur', '7 hommes d’équipage'],
    text: [
      'Envergure : 31,59 m — longueur : 21,44 m',
      'Hauteur : 6,33 m',
      'Poids à vide : 17 345 kg — en charge : 29 500 kg',
      'Charge de bombes : 5,9 t — carburant : 5 220 litres',
      'Moteurs : 4 Bristol Hercules XVI en étoile, 1 615 ch',
      'Vitesse maximale : 454 km/h — de croisière : 345 km/h',
      'Rayon d’action maximal : 3 200 km',
      'Plafond : 9 000 m à vide, 6 100 m à pleine charge',
    ].join('\n'),
    reading: [1450.2, 1466.0],
    legend: 'Les caractéristiques du Halifax Mk III',
    source: 'Fiche technique du film d’Éric Lemoine',
  },
  // « Un exemplaire non fonctionnel, mais très fidèle, a été reconstitué au Yorkshire Air Museum »
  print('halifax-du-musee', 1475.8, CREW, 0.4, 0.3, 0.36, 2, 'Le Halifax reconstitué du Yorkshire Air Museum', ERIC),
  // « Il est assez imposant, comme vous pouvez le voir »
  print('halifax-du-musee-echelle', 1482.5, CREW, 0.4, 0.74, 0.38, -2, 'Le Halifax du Yorkshire Air Museum : un visiteur donne l’échelle', ERIC),

  // ---------- the crew ----------
  { kind: 'view', id: 'equipage', at: CREW },
  // « sept hommes d’équipage sont requis, ainsi qu’un bon nombre de personnels au sol »
  print('equipes-au-sol', 1489.8, POSTS, 0.5, 0.3, -0.06, -2, 'Ce qu’il faut pour faire voler un Halifax : l’équipage et les équipes au sol', WEB),
  // the crew, typed as Eric names each man; the sheet stays on the table to the end of the Chapter
  {
    kind: 'typed',
    id: 'equipage-liste',
    at: 1497.4,
    place: { x: 1.4, z: -0.08, turn: 2 },
    width: 0.34,
    heading: ['ÉQUIPAGE', 'Groupe 1/25 « Tunisie » — Squadron 347', 'Elvington, 1944-1945'],
    text: [
      'Navigateur, commandant d’avion : capitaine SCHLEGEL',
      'Pilote : lieutenant LAU',
      'Bombardier : sergent-chef DABITON',
      'Radio : adjudant LECLAIRE',
      'Mécanicien : sergent BÉGUET',
      'Mitrailleur supérieur : sergent-chef DILELIO',
      'Mitrailleur arrière : adjudant GIRAUDIN',
    ].join('\n'),
    reading: [1498.8, 1517.0],
    legend: 'L’équipage du capitaine Schlegel',
    source: 'Liste dressée pour ce récit, d’après la narration d’Éric Lemoine',
  },
  // « Sur cette photo, le capitaine Schlegel, navigateur et commandant d’avion, au centre »
  {
    ...print(
      'equipage-schlegel',
      1499.0,
      POSTS,
      0.46,
      0.84,
      0.02,
      2,
      'Le capitaine Schlegel, au centre, et son équipage devant leur Halifax',
      'Photographie personnelle d’André Schlegel',
    ),
    rings: [{ at: 1502.4, box: [0.44, 0.477, 0.119, 0.472] }],
    frame: { x: 1.1, z: -0.02, width: 1.0, depth: 0.46 },
  },
  // « Voici une reconstitution moderne d’un équipage avec l’équipement d’époque »
  print(
    'reconstitution-equipage',
    1529.7,
    POSTS,
    0.46,
    0.42,
    0.4,
    -2,
    'D’anciens pilotes de la Royal Air Force en équipement d’époque, lors d’un meeting à Elvington',
    'Photographie réunie par Éric Lemoine (source internet, Yorkshire Air Museum)',
  ),

  // ---------- each man's post ----------
  { kind: 'view', id: 'postes', at: POSTS },
  // « Sur ce modèle réduit, vous pouvez voir la disposition du cockpit avec ses différents postes »
  {
    ...print('maquette-cockpit', 1542.6, undefined, 0.5, 0.3, -0.03, -2, 'La disposition des postes dans le nez du Halifax, sur une maquette', 'Photographie du dossier d’Éric Lemoine'),
    labels: [
      { at: 1546.8, text: 'Pilote', from: [0.5, 0.146], to: [0.332, 0.332] },
      { at: 1550.2, text: 'Navigateur', from: [0.737, 0.304], to: [0.5, 0.542] },
      { at: 1554.3, text: 'Bombardier', from: [0.865, 0.492], to: [0.589, 0.687] },
      { at: 1557.5, text: 'Radio', from: [0.154, 0.725], to: [0.382, 0.565] },
      { at: 1560.0, text: 'Mécanicien', from: [0.135, 0.451], to: [0.188, 0.32] },
    ],
  },

  // « Le poste du pilote, lieutenant Lau, tel qu’il était à l’époque »
  print('poste-pilote-epoque', 1567.7, NAVIGATOR, 0.38, 0.8, -0.06, 2, 'Le poste du pilote, à l’époque', BOOK),
  // « et tel qu’il est maintenant, dans la reconstitution d’Elvington »
  print('poste-pilote', 1572.0, NAVIGATOR, 0.38, 0.26, 0.31, -2, 'Le poste du pilote dans le Halifax d’Elvington', ERIC),
  // « et le pilote en situation »
  print('pilote-aux-commandes', 1578.0, NAVIGATOR, 0.38, 0.7, 0.31, 3, 'Un pilote de Halifax aux commandes', 'Photographie réunie par Éric Lemoine (source internet, Imperial War Museums)'),

  // « Le poste de navigation du capitaine Schlegel, avec ici la table des cartes »
  print('table-navigateur', 1588.1, BOMB_AIMER, 0.36, 0.78, -0.08, 2, 'Le poste du navigateur et sa table des cartes', WEB),
  // « Ici, une photo d’époque »
  print('navigateur-epoque', 1593.5, BOMB_AIMER, 0.2, 1.09, -0.07, -3, 'Un navigateur à sa table, à l’époque', BOOK),
  // « et une photo de votre serviteur, en lieu et place de son grand-père. Un moment très émouvant. »
  print('eric-navigateur', 1599.4, BOMB_AIMER, 0.34, 0.2, 0.26, -2, 'Éric Lemoine à la place de son grand-père, dans le Halifax d’Elvington', 'Photographie du dossier d’Éric Lemoine, Yorkshire Air Museum, Elvington'),
  print('table-des-cartes', 1606.0, BOMB_AIMER, 0.34, 0.57, 0.25, 3, 'La table des cartes du navigateur', ERIC),
  // « Vous pouvez voir ici tous les instruments de radioguidage »
  print('instruments-navigation', 1612.0, BOMB_AIMER, 0.34, 0.94, 0.26, -2, 'Les instruments de radioguidage du navigateur : Gee-box, H2S, OBOE', ERIC),
  // « le H2S en bas, et le système OBOE »
  { ...print('radar-h2s', 1623.0, BOMB_AIMER, 0.22, 0.2, 0.49, 2, 'Le radar H2S : le sol vu de l’avion, de nuit et à travers les nuages', BOOK), paper: 'sheet' },
  { ...print('systeme-oboe', 1629.2, BOMB_AIMER, 0.27, 0.5, 0.49, -2, 'Le système OBOE : deux stations au sol guident l’avion jusqu’au point de largage', BOOK), paper: 'sheet' },
  // « au point d’avoir été désigné « Windfinder » » — then « On peut voir le navigateur en bas, au fond, avec le bombardier »
  print('cockpit-vu-du-fond', 1642.3, BOMB_AIMER, 0.2, 0.8, 0.49, 3, 'Dans le nez du Halifax : le navigateur en bas, au fond, avec le bombardier', WEB),

  // « Le poste du bombardier, sergent-chef Dabiton »
  print('bombardier-epoque', 1670.6, WIRELESS, 0.24, 0.74, -0.05, 2, 'Le bombardier à son poste, dans le nez vitré', WEB),
  // « alias « bombes larguées » »
  print('poste-bombardier', 1683.1, WIRELESS, 0.38, 0.28, 0.31, -2, 'Le poste du bombardier dans le Halifax d’Elvington', ERIC),

  // « L’opérateur radio, adjudant Leclaire »
  print('radio-epoque', 1694.2, ENGINEER, 0.38, 0.8, -0.06, -2, 'Un opérateur radio à son poste', WEB),
  // « afin de rendre compte des résultats du raid »
  print('poste-radio', 1703.4, ENGINEER, 0.36, 0.28, 0.31, 2, 'Le poste de radio', WEB),

  // « Le mécanicien de vol, sergent Béguet »
  print('mecanicien-epoque', 1714.6, MID_UPPER, 0.22, 0.72, -0.05, -2, 'Un mécanicien de vol devant son tableau, à l’époque', BOOK),
  // « afin de permettre au pilote de disposer de toute la puissance nécessaire à la mission »
  print('tableau-mecanicien', 1720.0, MID_UPPER, 0.38, 0.28, 0.31, 2, 'Le tableau du mécanicien de vol', WEB),
  // « Ici, vous pouvez voir un « Flight Engineer », à l’époque et de nos jours, à bord de l’Halifax d’Elvington »
  print('veteran-mecanicien', 1729.5, MID_UPPER, 0.38, 0.72, 0.32, -3, 'Un ancien « Flight Engineer » retrouve le Halifax d’Elvington ; en médaillon, le même à l’époque', WEB),

  // « Le mitrailleur supérieur, sergent-chef Dilelio, est engoncé dans sa petite tourelle »
  print('tourelle-dorsale-epoque', 1746.6, REAR, 0.42, 0.82, -0.07, 2, 'La tourelle supérieure et ses quatre mitrailleuses', BOOK),
  // « Il est un élément essentiel de la défense contre la chasse allemande »
  print('vue-tourelle-dorsale', 1752.9, REAR, 0.38, 0.28, 0.31, -2, 'La tourelle supérieure, sur le dos du Halifax d’Elvington', ERIC),

  // « De la même façon, le mitrailleur de queue, adjudant Giraudin, défend tout le secteur arrière »
  print('tourelle-arriere-epoque', 1763.9, undefined, 0.4, 0.81, -0.06, -2, 'Le mitrailleur arrière dans sa tourelle', BOOK),
  // « Il avait parfois bien du mal à s’extraire de ce petit espace »
  print('tourelle-arriere', 1771.1, undefined, 0.38, 0.28, 0.31, 2, 'La tourelle arrière du Halifax d’Elvington', ERIC),
  print('tourelle-arriere-interieur', 1774.8, undefined, 0.36, 0.72, 0.32, -3, 'L’intérieur de la tourelle arrière', ERIC),
];

export const elvington: ChapterContent = {
  chapter: chapterById('elvington'),
  phrases,
  cues,
  postings: [
    {
      from: START,
      rank: 'Capitaine (officier d’état-major)',
      base: 'Elvington Station',
      unit: 'Squadron 347 « Tunisie »',
      dates: 'juillet 1944 – avril 1945',
    },
  ],
  marks: [
    { at: 1313.4, label: 'juillet 1944 · Elvington' },
    { at: 1352.1, label: 'à portée des Halifax' },
    { at: 1367.9, label: 'la « Petite France »' },
    { at: 1428.5, label: 'Halifax Mk III' },
    { at: 1498.8, label: 'l’équipage' },
    { at: 1583.4, label: 'le poste du navigateur' },
    { at: 1640.3, label: '« Windfinder »' },
    { at: 1746.0, label: 'les mitrailleurs' },
  ],
  companion: { carnet: '1940', place: { x: -0.5, z: 0.4, turn: -2 }, view: 42 },
};
