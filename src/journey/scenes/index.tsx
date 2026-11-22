import type { ComponentType } from 'react';
import { Chart, chartBox, chartSpot } from '../chart/Chart';
import { EVENTS, POSTS, type EventId, type PostId, type SheetId } from '../chart/places';
import type { ChapterContent, ChapterId, Cue, ModelCue, Place } from '../content/types';
import { openCloseUp } from '../engine/journey';
import { useJourney } from '../engine/store';
import { modelSpan, RecognitionModel } from '../models/RecognitionModel';
import type { LookName } from '../stage/looks';
import { shotOn, WIDE_SHOT, type Shot } from '../stage/shot';
import { TableScene } from './TableScene';

export interface SceneProps {
  content: ChapterContent;
  waiting: boolean;
  directed: boolean;
  onBegin?: () => void;
}

export interface SceneEntry {
  look: LookName;
  Scene: ComponentType<SceneProps>;
  /** The shot of the whole table. */
  wide: Shot;
  /** What the Chapter opening shows on the Chart. */
  opening?: { sheet: SheetId; place: Place; post: PostId };
}

// ---------- Ouverture: the Introduction's table, under the lamp ----------

/** Before the Narration, the table is seen a little lower, leaving room for the title above it. */
const INTRODUCTION_SHOT: Shot = { x: 0, z: -0.01, distance: 2.1, tilt: 24 };

function OuvertureScene(props: SceneProps) {
  return <TableScene {...props} wide={props.waiting ? INTRODUCTION_SHOT : WIDE_SHOT} />;
}

// ---------- Chapter 1, Tours: a summer morning in the squadron office ----------

const TOURS_CHART: Place = { x: -0.6, z: -0.17, turn: -2 };
const TOURS_WIDE: Shot = { x: 0.16, z: 0.05, distance: 2.5, tilt: 24 };

const isPost = (view: string): view is PostId => view in POSTS;
const isEvent = (view: string): view is EventId => view in EVENTS;

/** How the camera goes to a post of the Chart, or to a Recognition model. */
function shotsFor(sheet: SheetId, place: Place, around = 0.36) {
  return (cue: Cue, aspect: number): Shot | null => {
    if (cue.kind === 'chart' && isPost(cue.view)) return shotOn(chartSpot(sheet, place, cue.view, around), aspect, 14);
    if (cue.kind === 'chart' && isEvent(cue.view)) return shotOn(chartBox(sheet, place, EVENTS[cue.view].box), aspect, 14);
    if (cue.kind === 'model') {
      // the model on its stand and its label in front, whatever its size
      const span = modelSpan(cue.model);
      return { ...shotOn({ x: cue.place.x, z: cue.place.z + 0.04, width: span * 1.5 + 0.06, depth: span * 1.1 + 0.1 }, aspect, 40), y: 0.03 };
    }
    return null;
  };
}

function Models({ cue, shown }: { cue: ModelCue; shown: boolean }) {
  const closeUp = useJourney((state) => state.closeUp);
  return (
    <RecognitionModel
      cue={cue}
      shown={shown}
      inHand={closeUp?.kind === 'model' && closeUp.model === cue.model}
      onOpen={() => openCloseUp({ kind: 'model', model: cue.model })}
    />
  );
}

const toursShot = shotsFor('france', TOURS_CHART);

function ToursScene(props: SceneProps) {
  return (
    <TableScene
      {...props}
      wide={TOURS_WIDE}
      shotFor={toursShot}
      chart={() => <Chart sheet="france" place={TOURS_CHART} posts={['tours']} />}
      model={(cue, shown) => <Models key={cue.id} cue={cue} shown={shown} />}
    />
  );
}

// ---------- Chapter 2, Algérie: a trestle table under canvas, in the white light of Africa ----------

const ALGERIE_CHART: Place = { x: -0.36, z: -0.34, turn: 1.5 };
const ALGERIE_WIDE: Shot = { x: 0.3, z: 0.1, distance: 2.75, tilt: 24 };
const algerieShot = shotsFor('afrique-du-nord', ALGERIE_CHART, 0.42);

function AlgerieScene(props: SceneProps) {
  return (
    <TableScene
      {...props}
      wide={ALGERIE_WIDE}
      shotFor={algerieShot}
      // Oran is inked by the Chapter opening; Biskra and Meknès are reached by a Route as Eric names them
      chart={(views) => <Chart sheet="afrique-du-nord" place={ALGERIE_CHART} posts={['oran', ...views.filter(isPost).filter((view) => view !== 'oran')]} />}
      model={(cue, shown) => <Models key={cue.id} cue={cue} shown={shown} />}
    />
  );
}

// ---------- Chapter 3, Campagne de France: a field table under a low grey sky ----------

const CAMPAGNE_CHART: Place = { x: -0.5, z: -0.22, turn: -1.5 };
const CAMPAGNE_WIDE: Shot = { x: 0.3, z: 0.1, distance: 2.75, tilt: 24 };
const campagneShot = shotsFor('nord-de-la-france', CAMPAGNE_CHART, 0.4);

function CampagneScene(props: SceneProps) {
  return (
    <TableScene
      {...props}
      wide={CAMPAGNE_WIDE}
      shotFor={campagneShot}
      // Évreux is inked by the Chapter opening; Pithiviers is reached by a Route when the escadrille falls back
      chart={(views) => <Chart sheet="nord-de-la-france" place={CAMPAGNE_CHART} posts={['evreux', ...views.filter(isPost).filter((view) => view !== 'evreux')]} />}
      model={(cue, shown) => <Models key={cue.id} cue={cue} shown={shown} />}
    />
  );
}

// ---------- Chapter 4, Algérie sous Vichy: the same trestle table, at the end of a long afternoon ----------

const VICHY_CHART: Place = { x: -0.39, z: -0.33, turn: 1.5 };
const VICHY_WIDE: Shot = { x: 0.3, z: 0.1, distance: 2.75, tilt: 24 };
const vichyShot = shotsFor('maroc-algerie', VICHY_CHART, 0.42);

function VichyScene(props: SceneProps) {
  return (
    <TableScene
      {...props}
      wide={VICHY_WIDE}
      shotFor={vichyShot}
      // Blida is inked by the Chapter opening; Meknès is reached by a Route for the week of the raids on Gibraltar
      chart={(views) => (
        <Chart
          sheet="maroc-algerie"
          place={VICHY_CHART}
          posts={['blida', ...views.filter(isPost).filter((view) => view !== 'blida')]}
          events={views.filter(isEvent)}
        />
      )}
      model={(cue, shown) => <Models key={cue.id} cue={cue} shown={shown} />}
    />
  );
}

// ---------- Chapter 5, L’école anglaise: a hut on a Scottish airfield, in the pale light of a northern winter ----------

const BRITAIN_CHART: Place = { x: -0.62, z: -0.15, turn: -1.5 };
const BRITAIN_WIDE: Shot = { x: 0.3, z: 0.1, distance: 2.75, tilt: 24 };
const britainShot = shotsFor('grande-bretagne', BRITAIN_CHART, 0.3);

function BritainScene(props: SceneProps) {
  return (
    <TableScene
      {...props}
      wide={BRITAIN_WIDE}
      shotFor={britainShot}
      // Liverpool is inked by the Chapter opening; each school is reached by a Route from the one before
      chart={(views) => (
        <Chart
          sheet="grande-bretagne"
          place={BRITAIN_CHART}
          posts={['liverpool', ...views.filter(isPost).filter((view) => view !== 'liverpool')]}
          events={views.filter(isEvent)}
        />
      )}
      model={(cue, shown) => <Models key={cue.id} cue={cue} shown={shown} />}
    />
  );
}

// ---------- Chapter 6, Elvington: the operations hut of a bomber station, at the end of the day ----------

const ELVINGTON_CHART: Place = { x: -0.5, z: -0.22, turn: -1.5 };
const ELVINGTON_WIDE: Shot = { x: 0.4, z: 0.1, distance: 3.0, tilt: 24 };
const elvingtonShot = shotsFor('europe-du-nord-ouest', ELVINGTON_CHART, 0.34);

function ElvingtonScene(props: SceneProps) {
  return (
    <TableScene
      {...props}
      wide={ELVINGTON_WIDE}
      shotFor={elvingtonShot}
      // Elvington is inked by the Chapter opening; the reach of its Halifax is swept over Europe as Eric tells it
      chart={(views) => <Chart sheet="europe-du-nord-ouest" place={ELVINGTON_CHART} posts={['elvington']} events={views.filter(isEvent)} />}
      model={(cue, shown) => <Models key={cue.id} cue={cue} shown={shown} />}
    />
  );
}

export const SCENES: Partial<Record<ChapterId, SceneEntry>> = {
  ouverture: { look: 'lamp', Scene: OuvertureScene, wide: WIDE_SHOT },
  tours: { look: 'summer', Scene: ToursScene, wide: TOURS_WIDE, opening: { sheet: 'france', place: TOURS_CHART, post: 'tours' } },
  algerie: { look: 'sahel', Scene: AlgerieScene, wide: ALGERIE_WIDE, opening: { sheet: 'afrique-du-nord', place: ALGERIE_CHART, post: 'oran' } },
  'campagne-de-france': {
    look: 'overcast',
    Scene: CampagneScene,
    wide: CAMPAGNE_WIDE,
    opening: { sheet: 'nord-de-la-france', place: CAMPAGNE_CHART, post: 'evreux' },
  },
  'algerie-sous-vichy': {
    look: 'evening',
    Scene: VichyScene,
    wide: VICHY_WIDE,
    opening: { sheet: 'maroc-algerie', place: VICHY_CHART, post: 'blida' },
  },
  'ecole-anglaise': {
    look: 'north',
    Scene: BritainScene,
    wide: BRITAIN_WIDE,
    opening: { sheet: 'grande-bretagne', place: BRITAIN_CHART, post: 'liverpool' },
  },
  elvington: {
    look: 'dusk',
    Scene: ElvingtonScene,
    wide: ELVINGTON_WIDE,
    opening: { sheet: 'europe-du-nord-ouest', place: ELVINGTON_CHART, post: 'elvington' },
  },
};
