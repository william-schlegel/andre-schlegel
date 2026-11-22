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
};
