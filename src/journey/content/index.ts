import { algerie } from './algerie';
import { algerieSousVichy } from './algerie-sous-vichy';
import { apresLaGuerre } from './apres-la-guerre';
import { campagneDeFrance } from './campagne-de-france';
import { ecoleAnglaise } from './ecole-anglaise';
import { elvington } from './elvington';
import { missions } from './missions';
import { nuit } from './nuit';
import { ouverture } from './ouverture';
import { tours } from './tours';
import type { ChapterContent, ChapterId, MissionsCue, PrintCue, TypedCue } from './types';

/** The Chapters that are built. */
const CONTENT: Partial<Record<ChapterId, ChapterContent>> = {
  ouverture,
  tours,
  algerie,
  'campagne-de-france': campagneDeFrance,
  'algerie-sous-vichy': algerieSousVichy,
  'ecole-anglaise': ecoleAnglaise,
  elvington,
  nuit,
  missions,
  'apres-la-guerre': apresLaGuerre,
};

export function contentOf(id: ChapterId): ChapterContent {
  const content = CONTENT[id];
  if (!content) throw new Error(`Chapter not built: ${id}`);
  return content;
}

export function printOf(chapter: ChapterId, id: string): PrintCue | null {
  const cue = CONTENT[chapter]?.cues.find((candidate) => candidate.kind === 'print' && candidate.id === id);
  return (cue as PrintCue | undefined) ?? null;
}

export function typedOf(chapter: ChapterId, id: string): TypedCue | null {
  const cue = CONTENT[chapter]?.cues.find((candidate) => candidate.kind === 'typed' && candidate.id === id);
  return (cue as TypedCue | undefined) ?? null;
}

export function missionsSheetOf(chapter: ChapterId, id: string): MissionsCue | null {
  const cue = CONTENT[chapter]?.cues.find((candidate) => candidate.kind === 'missions' && candidate.id === id);
  return (cue as MissionsCue | undefined) ?? null;
}
