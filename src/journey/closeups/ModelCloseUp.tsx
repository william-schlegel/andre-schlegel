import { contentOf } from '../content';
import { AIRCRAFT } from '../content/models';
import type { ChapterId, ModelCue, ModelId } from '../content/types';
import { poseOf } from '../models/RecognitionModel';
import { CloseUpFrame } from './CloseUpFrame';
import { ModelInHand } from './ModelInHand';

/** A Recognition model of the table, taken in hand where it stands. */
export function ModelCloseUp({ model, chapter }: { model: ModelId; chapter: ChapterId }) {
  const cue = contentOf(chapter).cues.find((item): item is ModelCue => item.kind === 'model' && item.model === model);
  return (
    <CloseUpFrame label={AIRCRAFT[model]?.name ?? 'Maquette'} veil={false}>
      {cue && <ModelInHand model={model} pose={poseOf(model)} place={cue.place} hint="Glisser pour faire tourner la maquette · molette pour s’approcher" />}
    </CloseUpFrame>
  );
}
