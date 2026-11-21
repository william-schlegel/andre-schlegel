import type { ComponentType } from 'react';
import { Chart, chartSpot } from '../chart/Chart';
import type { PostId, SheetId } from '../chart/places';
import type { ChapterContent, ChapterId, Cue, Place } from '../content/types';
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

function toursShot(cue: Cue, aspect: number): Shot | null {
  if (cue.kind === 'chart') return shotOn(chartSpot('france', TOURS_CHART, 'tours', 0.36), aspect, 14);
  if (cue.kind === 'model') {
    // the model on its stand and its label in front, whatever its size
    const span = modelSpan(cue.model);
    return { ...shotOn({ x: cue.place.x, z: cue.place.z + 0.04, width: span * 1.5 + 0.06, depth: span * 1.1 + 0.1 }, aspect, 40), y: 0.03 };
  }
  return null;
}

function ToursScene(props: SceneProps) {
  const closeUp = useJourney((state) => state.closeUp);
  return (
    <TableScene
      {...props}
      wide={TOURS_WIDE}
      shotFor={toursShot}
      chart={() => <Chart sheet="france" place={TOURS_CHART} posts={['tours']} />}
      model={(cue, shown) => (
        <RecognitionModel
          key={cue.id}
          cue={cue}
          shown={shown}
          inHand={closeUp?.kind === 'model' && closeUp.model === cue.model}
          onOpen={() => openCloseUp({ kind: 'model', model: cue.model })}
        />
      )}
    />
  );
}

export const SCENES: Partial<Record<ChapterId, SceneEntry>> = {
  ouverture: { look: 'lamp', Scene: OuvertureScene, wide: WIDE_SHOT },
  tours: { look: 'summer', Scene: ToursScene, wide: TOURS_WIDE, opening: { sheet: 'france', place: TOURS_CHART, post: 'tours' } },
};
