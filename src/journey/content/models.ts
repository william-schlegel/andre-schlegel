import type { ModelId } from './types';

/**
 * The aircraft of the story, as Recognition models. The figures are the usual published
 * ones for each type (see the Sources page); they are given for scale, not as research.
 */
export interface Aircraft {
  id: ModelId;
  name: string;
  /** What it is, in a line. */
  kind: string;
  /** What André Schlegel did aboard, as the Narration tells it. */
  role: string;
  facts: [string, string][];
}

export const AIRCRAFT: Partial<Record<ModelId, Aircraft>> = {
  'bloch-200': {
    id: 'bloch-200',
    name: 'Bloch MB.200',
    kind: 'Bombardier moyen bimoteur, à train fixe',
    role: 'Tours, 31e escadre : André Schlegel y vole comme pilote et observateur.',
    facts: [
      ['Premier vol', '1933'],
      ['Équipage', '4 hommes'],
      ['Envergure', '22,45 m'],
      ['Longueur', '16 m'],
      ['Moteurs', '2 Gnome et Rhône 14K, 870 ch'],
      ['Vitesse', '285 km/h'],
    ],
  },
  'potez-25': {
    id: 'potez-25',
    name: 'Potez 25',
    kind: 'Biplan biplace d’observation',
    role: 'Tours : André Schlegel y vole comme observateur.',
    facts: [
      ['Premier vol', '1925'],
      ['Équipage', '2 hommes'],
      ['Envergure', '14,14 m'],
      ['Longueur', '9,10 m'],
      ['Moteur', 'Lorraine 12Eb, 450 ch'],
      ['Vitesse', '214 km/h'],
    ],
  },
  'bloch-210': {
    id: 'bloch-210',
    name: 'Bloch MB.210',
    kind: 'Bombardier moyen bimoteur, à aile basse et train rentrant',
    role: 'Oran puis Biskra, 19e escadre : André Schlegel y est qualifié commandant d’avion.',
    facts: [
      ['Premier vol', '1934'],
      ['Équipage', '5 hommes'],
      ['Envergure', '22,81 m'],
      ['Longueur', '18,83 m'],
      ['Moteurs', '2 Gnome et Rhône 14N, 950 ch'],
      ['Vitesse', '322 km/h'],
    ],
  },
  'db-7': {
    id: 'db-7',
    name: 'Douglas DB-7',
    kind: 'Bombardier moyen bimoteur américain, à train tricycle',
    role: 'Meknès, printemps 1940 : dix jours et onze missions pour le prendre en main ; puis les missions de guerre de la campagne de France.',
    facts: [
      ['Premier vol', '1939'],
      ['Équipage', '3 hommes'],
      ['Envergure', '18,67 m'],
      ['Longueur', '14,32 m'],
      ['Moteurs', '2 Pratt & Whitney Twin Wasp, 1 100 ch'],
      ['Vitesse', 'près de 500 km/h'],
    ],
  },
  anson: {
    id: 'anson',
    name: 'Avro Anson',
    kind: 'Bimoteur léger d’entraînement, en toile et bois',
    role: 'Dumfries, 10e Advanced Flying Unit : André Schlegel y apprend la navigation « à l’anglaise ».',
    facts: [
      ['Premier vol', '1935'],
      ['À bord', '1 pilote, 4 élèves et instructeurs'],
      ['Envergure', '17,22 m'],
      ['Longueur', '12,88 m'],
      ['Moteurs', '2 Armstrong Siddeley Cheetah, 350 ch'],
      ['Vitesse', '300 km/h'],
    ],
  },
  wellington: {
    id: 'wellington',
    name: 'Vickers Wellington',
    kind: 'Bombardier moyen bimoteur, devenu avion d’entraînement',
    role: 'Lossiemouth, 20e Operational Training Unit : les équipages s’y constituent et s’y entraînent ensemble.',
    facts: [
      ['Premier vol', '1936'],
      ['Équipage', '6 hommes'],
      ['Envergure', '26,26 m'],
      ['Longueur', '19,69 m'],
      ['Moteurs', '2 Bristol Hercules, 1 675 ch (Mk X)'],
      ['Vitesse', '410 km/h'],
    ],
  },
  halifax: {
    id: 'halifax',
    name: 'Handley Page Halifax',
    kind: 'Bombardier lourd quadrimoteur',
    role: 'Rufforth, Heavy Conversion Unit 1663 : la conversion sur Halifax V, avant le Halifax III des missions de guerre.',
    facts: [
      ['Premier vol', '1939'],
      ['Équipage', '7 hommes'],
      ['Envergure', '31,75 m (Mk III)'],
      ['Longueur', '21,82 m'],
      ['Moteurs', '4 Bristol Hercules, 1 615 ch (Mk III)'],
      ['Bombes', 'jusqu’à 6 tonnes'],
    ],
  },
  'ju-52': {
    id: 'ju-52',
    name: 'Junkers Ju 52 « Toucan »',
    kind: 'Trimoteur de transport à train fixe, construit en France après la guerre sous le nom d’AAC.1',
    role: 'G.M.M.T.A., 1945-1946 : le transport aérien militaire renaît avec du matériel récupéré, « en particulier chez l’ennemi ».',
    facts: [
      ['Premier vol', '1932 (trimoteur)'],
      ['À bord', '3 hommes d’équipage, 17 passagers'],
      ['Envergure', '29,25 m'],
      ['Longueur', '18,90 m'],
      ['Moteurs', '3 BMW 132, environ 700 ch'],
      ['Vitesse', 'environ 265 km/h'],
    ],
  },
  'c-54': {
    id: 'c-54',
    name: 'Douglas C-54 Skymaster',
    kind: 'Quadrimoteur de transport à long rayon d’action, version militaire du DC-4',
    role: 'Du 30 août au 7 septembre 1946 : Paris – Rio de Janeiro – Buenos Aires et retour, André Schlegel navigateur. Le récit parle d’un Avro York ; la lettre de félicitations dit « à bord du C.54 », et c’est lui qui est modelé ici.',
    facts: [
      ['Premier vol', '1942'],
      ['À bord', '6 hommes d’équipage, jusqu’à 50 passagers'],
      ['Envergure', '35,81 m'],
      ['Longueur', '28,60 m'],
      ['Moteurs', '4 Pratt & Whitney Twin Wasp R-2000, 1 350 ch'],
      ['Vitesse', 'environ 440 km/h'],
    ],
  },
  york: {
    id: 'york',
    name: 'Avro York',
    kind: 'Quadrimoteur de transport, dérivé du bombardier Lancaster',
    role: 'G.L.A.M., 1946-1948 : André Schlegel y vole comme navigateur, jusqu’à Karachi et New Delhi ; son dernier vol, le 10 avril 1948, est un vol local à Orly sur York.',
    facts: [
      ['Premier vol', '1942'],
      ['Équipage', '5 hommes'],
      ['Envergure', '31,09 m'],
      ['Longueur', '23,93 m'],
      ['Moteurs', '4 Rolls-Royce Merlin, 1 610 ch'],
      ['Vitesse', 'environ 480 km/h'],
    ],
  },
};
