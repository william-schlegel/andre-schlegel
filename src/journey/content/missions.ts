import { chapterById } from './chapters';
import phrases from './generated/phrases-missions.json';
import sizes from './generated/prints-missions.json';
import type { ChapterContent, Cue, Frame, MissionsCue, Place, PrintCue, TypedCue } from './types';

/**
 * Chapter 8 — Les missions, July 1944 to April 1945: the sorties flown from Elvington, in two
 * periods (the V1 sites and the yards of occupied France, then the factories of Germany), the
 * citations they earned and the decorations that followed. Cue times are those of the Film's picture.
 *
 * Four things here are not as the Film shows them:
 *  - the Film's two tables are the Missions list, typed line by line on a sheet of each period;
 *    the line of each sortie Eric tells is underlined in red as he comes to it;
 *  - where the Film shows two hand-drawn maps of the objectives, the Chart is inked instead;
 *  - the Carnet's scans stop at the end of September 1944: for Bochum, Duisbourg, Mülheim and
 *    Chemnitz the Companion opens at a Reconstructed Spread, drawn from the Missions list and stamped as such;
 *  - the citations are typed sheets, typed as Eric reads them, and the three decorations are set
 *    down on the table when they are awarded.
 */

const media = (name: string) => `/media/missions/${name}.webp`;
const size = (name: keyof typeof sizes) => sizes[name] as [number, number];
const WEB = 'Photographie réunie par Éric Lemoine (source internet)';
const BOOK = 'Reproduction réunie par Éric Lemoine, d’après un ouvrage';
const PAINTING = 'Peinture signée, auteur non identifié ; image réunie par Éric Lemoine';
const CITATION = 'Texte de la citation, tel que le film le donne';

const START = 2310;
/** The parts of the Chapter: the two periods, and in each the sorties Eric tells. */
const NIEPPE = 2368.0;
const WANNE_EICKEL = 2410.1;
const SOMAIN = 2470.6;
const SECOND = 2540.8;
const BOCHUM = 2572.6;
const DUISBOURG = 2618.0;
const MULHEIM = 2647.5;
const LEGION = 2663.8;
const CHEMNITZ = 2730.2;
const ARMY_1945 = 2776.2;
const TOUR = 2838.0;
const DFC = 2852.2;
const CROIX = 2931.4;

/** A print of the Chapter: its picture and its size are found by its name. */
function print(id: keyof typeof sizes, at: number, until: number | undefined, width: number, x: number, z: number, turn: number, legend: string, source: string): PrintCue {
  return { kind: 'print', id, at, until, src: media(id), size: size(id), width, place: { x, z, turn }, legend, source };
}

// ---------- the Missions list: a sheet for each period, at the right of the table ----------

const LIST: Place = { x: 1.34, z: -0.2, turn: 1.5 };
const LIST_SOURCE = 'Liste dressée d’après les deux tableaux du film d’Éric Lemoine';
/** What the camera takes in when it goes back to the list. */
const FIRST_LIST: Frame = { x: 1.34, z: -0.2, width: 0.52, depth: 0.3 };
const SECOND_LIST: Frame = { x: 1.34, z: -0.2, width: 0.52, depth: 0.4 };

const firstPeriod: MissionsCue = {
  kind: 'missions',
  id: 'liste-premiere-periode',
  at: 2311.0,
  until: SECOND,
  period: 1,
  place: LIST,
  width: 0.5,
  heading: ['MISSIONS DU CAPITAINE SCHLEGEL', 'Squadron 347 « Tunisie » — Elvington', 'Première période : juillet – septembre 1944'],
  typing: [2312.2, 2334.4],
  told: [
    // « La mission sur la forêt de Nieppe, près d’Hazebrouck, sur trois jours »
    { at: 2370.9, date: '1944-07-28', from: NIEPPE },
    { at: 2371.6, date: '1944-08-05', from: NIEPPE },
    { at: 2372.3, date: '1944-08-06', from: NIEPPE },
    // « La mission du 25 juillet sur l’usine de Wanne-Eickel »
    { at: 2410.7, date: '1944-07-25', from: WANNE_EICKEL },
    // « la mission de destruction de la gare de Somain, près de Douai, le 11 août »
    { at: 2471.3, date: '1944-08-11', from: SOMAIN },
  ],
  legend: 'Les missions de juillet à septembre 1944 : les bases de V1 en France, quelques usines en Allemagne',
  source: LIST_SOURCE,
};

const secondPeriod: MissionsCue = {
  kind: 'missions',
  id: 'liste-deuxieme-periode',
  at: 2541.6,
  period: 2,
  place: LIST,
  width: 0.5,
  heading: ['MISSIONS DU CAPITAINE SCHLEGEL', 'Squadron 347 « Tunisie » — Elvington', 'Deuxième période : octobre 1944 – mars 1945'],
  typing: [2542.6, 2552.6],
  told: [
    // « Le 9 octobre 1944, le Halifax LL590, immatriculé D, du capitaine Schlegel, est attaqué »
    { at: 2573.2, date: '1944-10-09', from: BOCHUM },
    // « Pour la mission du 18 décembre sur Duisbourg »
    { at: 2618.6, date: '1944-12-18', from: DUISBOURG },
    // « La difficile mission sur l’aérodrome de Mülheim-Essen »
    { at: 2648.2, date: '1944-12-24', from: MULHEIM },
    // « Dresde, le 13, et Chemnitz, le 14 février 1945 »
    { at: 2743.8, date: '1945-02-14', from: CHEMNITZ },
  ],
  legend: 'Les missions d’octobre 1944 à mars 1945 : les usines et les villes industrielles d’Allemagne',
  source: LIST_SOURCE,
};

// ---------- the citations: typed while Eric reads them ----------

const SHEET: Place = { x: 0.5, z: 0.14, turn: -1.5 };

function citation(id: string, at: number, until: number | undefined, place: Place, heading: string[], text: string[], reading: [number, number], legend: string): TypedCue {
  return { kind: 'typed', id, at, until, place, width: 0.4, heading, text: text.join('\n'), reading, legend, source: CITATION };
}

// ---------- the Reconstructed Spreads of the Carnet of 1940 (views 49 to 54: October 1944 to March 1945) ----------

const OCTOBER = 49;
const DECEMBER = 51;
const FEBRUARY = 53;
/** The two lines of a sortie on a Reconstructed Spread, by the line it starts on (see pipeline/reconstructed.py). */
const entry = (line: number): [number, number, number, number] => [0.06, 0.15 + line * 0.0492, 0.9, 0.104];

/** The decorations, in a row at the back of the table, each set down when it is awarded. */
const MEDALS: Frame = { x: 0.36, z: -0.44, width: 0.56, depth: 0.26 };

const cues: Cue[] = [
  // the Halifax of the two Chapters before stays on the table
  {
    kind: 'model',
    id: 'halifax',
    at: START,
    model: 'halifax',
    place: { x: 1.36, z: 0.45, turn: -30 },
    label: ['Halifax Mk III', 'bombardier lourd — sept hommes', 'Squadron 347 « Tunisie »'],
  },
  { kind: 'view', id: 'table', at: START },

  // ---------- the first period: July to September 1944 ----------
  // « La première période, de juillet à septembre, comprend pour l’essentiel des missions de destruction des bases de V1 en France »
  firstPeriod,

  // « Les missions en France sont : » — each objective is crossed on the Chart as Eric names it
  { kind: 'chart', id: 'carte-nieppe', at: 2338.0, view: 'cible-nieppe' },
  { kind: 'chart', id: 'carte-noyelles', at: 2344.7, view: 'cible-noyelles' },
  { kind: 'chart', id: 'carte-cassan', at: 2349.0, view: 'cible-cassan' },
  { kind: 'chart', id: 'carte-somain', at: 2353.9, view: 'cible-somain' },
  { kind: 'chart', id: 'carte-octeville', at: 2358.6, view: 'cible-octeville' },
  { kind: 'chart', id: 'carte-boulogne', at: 2363.4, view: 'cible-boulogne' },

  // ---------- the forest of Nieppe: three days, 28 July, 5 and 6 August ----------
  { kind: 'view', id: 'liste-nieppe', at: NIEPPE, frame: FIRST_LIST },
  // « Les voici avant le raid »
  print('v1-sur-sa-rampe', 2374.2, WANNE_EICKEL, 0.36, 0.2, -0.12, -2, 'Une bombe volante V1 sur sa rampe de lancement', WEB),
  print('site-de-v1', 2385.3, WANNE_EICKEL, 0.36, 0.6, -0.11, 2, 'Un V1 sur sa rampe, reconstitué de nos jours', WEB),
  // « pendant le raid : photos de reconnaissance et photos pendant le bombardement »
  print('reconnaissance-nieppe', 2389.4, WANNE_EICKEL, 0.26, 0.16, 0.3, -3, 'Une rampe de lancement de V1, vue par un avion de reconnaissance', WEB),
  print('foret-de-nieppe', 2395.0, WANNE_EICKEL, 0.27, 0.47, 0.3, 2, 'La forêt de Nieppe pendant le raid du 6 août 1944 : un Halifax passe au-dessus de l’objectif', WEB),
  print('halifax-sur-nieppe', 2399.5, WANNE_EICKEL, 0.26, 0.78, 0.31, -2, 'Un Halifax au-dessus de la forêt de Nieppe', BOOK),
  // « et après le raid, lors de leur découverte par les troupes alliées »
  print('rampe-detruite', 2403.5, WANNE_EICKEL, 0.32, 0.96, -0.1, 3, 'Une rampe de V1 détruite, découverte par les troupes alliées', WEB),

  // ---------- Wanne-Eickel, 25 July 1944 ----------
  { kind: 'view', id: 'liste-wanne-eickel', at: WANNE_EICKEL, frame: FIRST_LIST },
  // « ici, un des bombardiers Halifax survolant le site »
  print('halifax-wanne-eickel', 2419.4, SOMAIN, 0.46, 0.3, -0.06, -2, 'Un Halifax au-dessus de la raffinerie de Wanne-Eickel pendant un raid de jour', WEB),
  // « Voyez le paysage lunaire après le raid »
  print('wanne-eickel-apres', 2428.6, SOMAIN, 0.3, 0.8, 0.0, 2, 'L’usine de Wanne-Eickel après le raid : un paysage lunaire', WEB),
  // « Cette mission fera l’objet de la première citation pour l’équipage » — the Carnet, July 1944
  { kind: 'spread', id: 'carnet-wanne-eickel', at: 2436.9, carnet: '1940', spread: 43, marks: [{ at: 2440.3, box: [0.038, 0.45, 0.861, 0.143] }] },
  // « à l’ordre de la brigade aérienne, en date du 22 août 1944 »
  citation(
    'citation-brigade',
    2444.8,
    SOMAIN,
    { x: 0.5, z: 0.36, turn: -1.5 },
    ['BRIGADE AÉRIENNE', 'Ordre n° 12 du 22 août 1944', 'du colonel commandant les G.B. 1'],
    [
      'Équipage qui a brillamment inauguré ses missions de guerre à partir de l’Angleterre, en participant à l’opération menée le 25 juillet sur un centre industriel important du bassin de la Ruhr.',
      'A bombardé l’objectif avec succès, malgré l’intensité de la D.C.A. adverse et des conditions météorologiques souvent défavorables.',
    ],
    [2446.0, 2464.6],
    'Première citation de l’équipage, à l’ordre de la brigade aérienne, 22 août 1944',
  ),

  // ---------- Somain, 11 August 1944 ----------
  { kind: 'view', id: 'liste-somain', at: SOMAIN + 0.1, frame: FIRST_LIST },
  // « la mission de destruction de la gare de Somain, près de Douai, le 11 août »
  print('somain', 2473.8, SECOND, 0.34, 0.24, 0.02, -2, 'La gare de triage de Somain sous les bombes, 11 août 1944', WEB),
  // « Notez, sur l’agrandissement, un Halifax qui se découpe au-dessus de la fumée des explosions »
  {
    ...print('somain-agrandissement', 2480.8, SECOND, 0.34, 0.7, 0.08, 2, 'Somain, 11 août 1944 : un Halifax se découpe au-dessus de la fumée des explosions', BOOK),
    rings: [{ at: 2484.0, box: [0.72, 0.035, 0.22, 0.17] }],
  },
  // « Citation à l’ordre de la division aérienne » — the Carnet, August 1944
  { kind: 'spread', id: 'carnet-somain', at: 2493.8, carnet: '1940', spread: 46, marks: [{ at: 2497.4, box: [0.052, 0.286, 0.88, 0.154] }] },
  citation(
    'citation-division',
    2501.2,
    SECOND,
    { x: 0.36, z: 0.45, turn: -1.5 },
    ['DIVISION AÉRIENNE', 'Ordre n° 325 — note n° 11186/3/F.A.G.B.', 'du 6 décembre 1944'],
    [
      'Équipage animé de belles qualités morales, alliées à un sang-froid et un esprit de décision qui ont trouvé à se manifester au cours de situations difficiles.',
      'Totalise un grand nombre de missions sur l’Allemagne.',
      'Le 11 août 1944, effectuant un raid sur un point très défendu de zone occupée, a poursuivi sa mission avec détermination, bien que la D.C.A., atteignant son avion de nombreux éclats, l’ait obligé à stopper un moteur 25 km avant l’objectif.',
      'A néanmoins effectué un bombardement précis et rejoint sa base sur trois moteurs.',
    ],
    [2502.5, 2533.8],
    'Deuxième citation de l’équipage, à l’ordre de la division aérienne, 6 décembre 1944',
  ),

  // ---------- the second period: October 1944 to April 1945 ----------
  { kind: 'view', id: 'deuxieme-periode', at: SECOND },
  // « Pendant la deuxième période, d’octobre 1944 à avril 1945, les missions se feront exclusivement au-dessus de l’Allemagne »
  secondPeriod,
  // « Ils sont situés sur la Ruhr, les ports du Nord, ainsi que la Bavière et la Saxe »
  { kind: 'chart', id: 'carte-ruhr', at: 2553.3, view: 'cibles-ruhr' },
  { kind: 'chart', id: 'carte-ports', at: 2558.0, view: 'cibles-ports' },
  { kind: 'chart', id: 'carte-sud', at: 2562.0, view: 'cibles-sud' },
  { kind: 'chart', id: 'carte-saxe', at: 2564.6, view: 'cible-chemnitz' },

  // ---------- Bochum, 9 October 1944 ----------
  { kind: 'view', id: 'liste-bochum', at: BOCHUM + 0.1, frame: SECOND_LIST },
  // the Carnet's scans stop in September: a Reconstructed Spread for October
  { kind: 'spread', id: 'carnet-bochum', at: 2576.5, carnet: '1940', spread: OCTOBER, marks: [{ at: 2578.2, box: entry(2) }] },
  // « est attaqué et touché au-dessus des usines de Bochum, dans la Ruhr »
  print('bombes-sur-une-gare', 2581.9, DUISBOURG, 0.3, 0.2, -0.04, -2, 'Des bombes en chute au-dessus d’une usine', WEB),
  // « et ceci par la chasse de nuit »
  print('chasse-de-nuit', 2590.0, DUISBOURG, 0.5, 0.7, -0.08, 2, 'Un Halifax attaqué par la chasse de nuit', PAINTING),
  // « Cela va justifier un complément à la citation de l’équipage à l’ordre de la division aérienne »
  citation(
    'citation-division-suite',
    2595.4,
    DUISBOURG,
    { x: 0.3, z: 0.42, turn: -1.5 },
    ['DIVISION AÉRIENNE', 'Ordre n° 325 du 6 décembre 1944', '(suite)'],
    ['Le 9 octobre 1944, au cours d’une mission de nuit sur la Ruhr, a été attaqué et touché par la chasse adverse.', 'S’est brillamment dégagé et a ramené à la base son avion criblé d’obus.'],
    [2600.0, 2611.1],
    'La suite de la citation à l’ordre de la division aérienne : la nuit du 9 octobre 1944',
  ),
  // « Cela aurait pu ressembler à ça »
  {
    ...print(
      'halifax-crible',
      2602.8,
      DUISBOURG,
      0.24,
      0.78,
      0.42,
      3,
      'L’intérieur d’un Halifax criblé d’éclats : « cela aurait pu ressembler à ça »',
      'Photographie réunie par Éric Lemoine (source internet, Imperial War Museums)',
    ),
    frame: { x: 0.52, z: 0.42, width: 0.78, depth: 0.4 },
  },

  // ---------- Duisbourg, 18 December 1944 ----------
  // a Reconstructed Spread for December
  { kind: 'spread', id: 'carnet-duisbourg', at: DUISBOURG + 0.1, carnet: '1940', spread: DECEMBER, marks: [{ at: 2619.8, box: entry(3.5) }] },
  // « on dispose du trajet et des horaires des Halifax, en particulier celui du commandant Schlegel »
  {
    ...print('trajet-duisbourg', 2623.5, MULHEIM, 0.56, 0.36, 0.02, -1.5, 'Duisbourg, 18 décembre 1944 : le trajet et les horaires des Halifax, avec le retour par Manston', BOOK),
    paper: 'sheet',
    // « l’atterrissage à Manston, près de Douvres »
    rings: [{ at: 2634.9, box: [0.195, 0.6, 0.1, 0.105] }],
  },
  // « montrant la nécessité d’échapper à la chasse et à la Flak par des manœuvres de contournement »
  {
    ...print('raid-duisbourg', 2630.0, MULHEIM, 0.38, 0.88, 0.1, 2, 'Duisbourg sous les bombes, de nuit', BOOK),
    frame: { x: 0.56, z: 0.06, width: 1.04, depth: 0.46 },
  },

  // ---------- Mülheim-Essen, 24 December 1944 ----------
  {
    kind: 'spread',
    id: 'carnet-mulheim',
    at: MULHEIM + 0.1,
    carnet: '1940',
    spread: DECEMBER,
    marks: [
      { at: MULHEIM, box: entry(3.5) },
      { at: 2648.8, box: entry(6.5) },
    ],
  },
  // « en tant que leader du « stream », formation de plus de 200 appareils »
  print('raid-mulheim', 2651.9, 2669.3, 0.5, 0.3, 0.02, -2, 'L’aérodrome de Mülheim-Essen, criblé de cratères de bombes', BOOK),
  print('halifax-de-jour', 2659.9, 2669.3, 0.46, 0.82, 0.04, 2, 'Un Halifax touché, escorté par des chasseurs, de jour', PAINTING),
  // « à l’ordre de l’armée aérienne, nomination au grade de chevalier de la Légion d’honneur »
  { kind: 'decoration', id: 'legion-honneur', at: LEGION, decoration: 'legion-honneur', place: { x: 0.2, z: -0.44, turn: -4 } },
  citation(
    'citation-legion-honneur',
    2669.3,
    CHEMNITZ,
    SHEET,
    ['ARMÉE AÉRIENNE', 'Citation avec nomination au grade de', 'chevalier de la Légion d’honneur — 3 avril 1945'],
    [
      'Commandant d’avion et navigateur d’élite, a participé à de nombreuses missions de bombardement très difficiles, les accomplissant avec un calme et une précision remarquables.',
      'Depuis le 15 octobre 1944, a exécuté dix missions sur la région de la Ruhr. Le 6 novembre 1944, a eu son avion sérieusement touché par la Flak allemande.',
      'Le 24 décembre 1944, a exécuté une mission remarquable à la tête d’une formation de plus de 200 avions, attaquant de jour et par temps clair un objectif puissamment défendu, situé au cœur de la Ruhr. Malgré un tir violent de la Flak, touchant son avion en de nombreux endroits, et un moteur gravement atteint par un obus de plein fouet, a continué droit sur l’objectif, dirigeant adroitement toute la formation à travers les défenses ennemies.',
      'Est largement responsable des excellents résultats obtenus par l’ensemble des avions qu’il guidait.',
    ],
    [2672.4, 2722.1],
    'Troisième citation, à l’ordre de l’armée aérienne, avec la Légion d’honneur, 3 avril 1945',
  ),

  // ---------- Chemnitz, 14 February 1945 ----------
  // « les Alliés vont détruire en Saxe deux sites essentiels à la logistique de la Wehrmacht »
  { kind: 'chart', id: 'carte-dresde', at: 2731.6, view: 'cible-dresde' },
  // « Dresde, le 13, et Chemnitz, le 14 février 1945 » — the routes of three raids, Chemnitz ringed
  {
    ...print('trajet-chemnitz', 2737.0, ARMY_1945, 0.5, 0.34, 0.0, -2, 'Les trajets de trois raids lointains, dont celui de Chemnitz, le 14 février 1945', BOOK),
    paper: 'sheet',
    rings: [{ at: 2744.1, box: [0.775, 0.62, 0.135, 0.14] }],
  },
  // « Sur cette dernière, les groupes français participeront à la mission » — a Reconstructed Spread for February
  { kind: 'spread', id: 'carnet-chemnitz', at: 2747.3, carnet: '1940', spread: FEBRUARY, marks: [{ at: 2748.8, box: entry(4) }] },
  // « Cette mission sera pour les Français la plus longue et la plus éprouvante de la guerre »
  print('chemnitz-avant', 2757.7, ARMY_1945, 0.42, 0.88, -0.06, 2, 'Chemnitz et sa gare avant les bombardements', WEB),
  // « Elle durera plus de huit heures, avec la destruction d’une grande partie de la gare »
  print('chemnitz-gare', 2765.7, ARMY_1945, 0.38, 0.36, 0.42, -2, 'La gare de triage de Chemnitz sous les bombes', WEB),
  // « et, malheureusement, de la ville de Chemnitz »
  print('chemnitz-en-feu', 2771.3, ARMY_1945, 0.4, 0.82, 0.36, 3, 'Chemnitz en feu', WEB),
  // « Cela fera l’objet de la quatrième citation à l’ordre de l’armée du commandant Schlegel »
  citation(
    'citation-armee-1945',
    2779.2,
    TOUR,
    SHEET,
    ['ARMÉE AÉRIENNE', 'Citation à l’ordre de l’armée', '20 juillet 1945'],
    [
      'Navigateur, commandant d’avion de grande valeur, a, par sa connaissance du matériel, son autorité sur son équipage, effectué une série d’attaques sur des objectifs ennemis très défendus, dans des conditions météorologiques souvent défavorables.',
      'A obtenu d’excellents résultats, contrôlés par la photographie, grâce à l’exploitation parfaite du matériel utilisé, à un mépris absolu du danger et à une conscience professionnelle digne de tous les éloges.',
      'A notamment participé avec succès à une longue et dure mission de nuit, le 14 février 1945, en Saxe, sur un objectif de grande importance, mission qui, avec tous les risques que comporte une D.C.A. dense et précise, était rendue encore plus dangereuse par une activité soutenue de chasseurs de nuit ennemis sur tout le parcours.',
    ],
    [2787.0, 2834.2],
    'Quatrième citation, à l’ordre de l’armée aérienne, 20 juillet 1945',
  ),

  // ---------- the end of the tour, and two more distinctions ----------
  // « Ayant terminé son tour d’opérations avec plus de 160 points […] et 38 missions, il quitte Elvington le 18 avril 1945 »
  { kind: 'view', id: 'tour-d-operations', at: TOUR, frame: SECOND_LIST },
  print('remise-legion-honneur', 2844.1, undefined, 0.32, 0.26, 0.12, -2, 'Une remise de décoration : la Légion d’honneur', 'Photographie personnelle d’André Schlegel'),
  // « Ici, la Distinguished Flying Cross »
  { kind: 'decoration', id: 'dfc', at: DFC, decoration: 'dfc', place: { x: 0.36, z: -0.44, turn: 5 }, frame: MEDALS },
  citation(
    'citation-dfc',
    2856.5,
    CROIX,
    { x: 0.76, z: 0.14, turn: 1.5 },
    ['DISTINGUISHED FLYING CROSS', 'approved by His Majesty the King George VI', 'December the 14th, 1945'],
    [
      'Le capitaine Schlegel, navigateur, commandant d’avion, vient de terminer un tour d’opérations de 38 missions avec le Bomber Command, menant à bien toutes ces opérations malgré les difficultés considérables et une opposition farouche des défenses ennemies.',
      'Le 11 août 1944, ayant dû mettre un moteur en drapeau, attaque néanmoins avec succès un atelier de réparation du chemin de fer à Somain.',
      'Le 24 décembre 1944, étant leader de la « Main Force », attaqua, de jour et par temps clair, le terrain d’aviation d’Essen-Mülheim et fut durement touché par la Flak sur l’objectif, ce qui l’obligea à effectuer tout le voyage de retour sur trois moteurs.',
      'A été neuf fois touché par la Flak et a eu son avion sérieusement touché par un chasseur.',
      'Remarquablement intelligent et précis dans l’emploi des appareillages spéciaux, a été plusieurs fois désigné pour effectuer des missions comme appui du P.P.F. ou comme « windfinder ».',
      'A toujours fait preuve d’un courage tranquille et de remarquables qualités de commandement.',
    ],
    [2864.5, 2930.2],
    'La citation de la Distinguished Flying Cross, 14 décembre 1945',
  ),
  // « Et comme dernière citation, pour la croix de guerre avec palmes »
  { kind: 'decoration', id: 'croix-de-guerre', at: 2933.0, decoration: 'croix-de-guerre', place: { x: 0.52, z: -0.44, turn: -3 }, frame: MEDALS },
  citation(
    'citation-croix-de-guerre',
    2936.4,
    undefined,
    { x: 0.76, z: 0.14, turn: 1.5 },
    ['ARMÉE AÉRIENNE', 'Citation à l’ordre de l’armée — croix de guerre', '4 mars 1946'],
    [
      'Brillant commandant d’avion, navigateur, vient d’accomplir sur Halifax de nombreuses missions sur des objectifs fortement défendus de la Ruhr, de l’Allemagne du centre et de la Saxe.',
      'A toujours obtenu d’excellents résultats malgré les réactions très vives de la défense ennemie, grâce à son habileté de navigateur, à son courage et à la parfaite cohésion qu’il a su donner à son équipage.',
      'Après avoir été engagé pendant la campagne 1939-1940, a effectué 52 missions, au cours desquelles il a eu son appareil dix-huit fois atteint par la D.C.A. et deux fois criblé par les tirs précis des chasseurs ennemis.',
      'Officier de grande classe, a su constamment mériter l’estime de ses supérieurs et de ses subordonnés par sa grande confiance et l’habileté professionnelle, et par le calme souriant avec lequel il exécute toutes les missions et remplit toutes les fonctions qui lui sont confiées.',
      'A été sept fois cité : 254 heures de vol de guerre, dont 90 de nuit.',
    ],
    [2941.1, 2998.3],
    'Dernière citation, à l’ordre de l’armée aérienne, pour la croix de guerre avec palmes, 4 mars 1946',
  ),
];

export const missions: ChapterContent = {
  chapter: chapterById('missions'),
  phrases,
  cues: cues.slice().sort((a, b) => a.at - b.at),
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
    { at: 2310.9, label: 'juillet – septembre 1944' },
    { at: 2339.6, label: 'les bases de V1' },
    { at: WANNE_EICKEL, label: '25 juillet · Wanne-Eickel' },
    { at: SOMAIN, label: '11 août · Somain' },
    { at: 2542.0, label: 'octobre 1944 – avril 1945' },
    { at: BOCHUM, label: '9 octobre · Bochum' },
    { at: DUISBOURG, label: '18 décembre · Duisbourg' },
    { at: MULHEIM, label: '24 décembre · Mülheim' },
    { at: CHEMNITZ, label: '14 février 1945 · Chemnitz' },
    { at: TOUR, label: 'fin du tour d’opérations' },
    { at: DFC, label: 'Distinguished Flying Cross' },
    { at: CROIX, label: 'croix de guerre avec palmes' },
  ],
  companion: { carnet: '1940', place: { x: -0.5, z: 0.4, turn: -2 }, view: 42 },
};
