import type { Chapter, ChapterId } from '../content/types';

/**
 * The Timeline lays the Narration out from left to right, divided into Chapters. The Chapter
 * being told is given more room than its length alone would (so that one can move inside it
 * precisely and read its dates); the others keep their proportions among themselves.
 */

export interface Segment {
  chapter: Chapter;
  /** Left edge and width, as fractions of the Timeline (0…1). */
  left: number;
  width: number;
}

/** The share of the Timeline the current Chapter gets at least. */
export const CURRENT_SHARE = 0.4;

export function layoutTimeline(chapters: readonly Chapter[], current: ChapterId): Segment[] {
  const total = chapters.reduce((sum, chapter) => sum + (chapter.end - chapter.start), 0);
  const currentChapter = chapters.find((chapter) => chapter.id === current);
  const currentLength = currentChapter ? currentChapter.end - currentChapter.start : 0;
  const natural = total > 0 ? currentLength / total : 0;
  const share = currentChapter ? Math.max(natural, CURRENT_SHARE) : 0;
  const others = total - currentLength;

  let left = 0;
  return chapters.map((chapter) => {
    const length = chapter.end - chapter.start;
    const width = chapter.id === current ? share : others > 0 ? ((1 - share) * length) / others : 0;
    const segment = { chapter, left, width };
    left += width;
    return segment;
  });
}

/** Where a moment of the Narration falls on the Timeline (0…1). */
export function positionOf(segments: readonly Segment[], time: number): number {
  for (const { chapter, left, width } of segments) {
    if (time < chapter.end) {
      const inside = Math.max(0, time - chapter.start) / (chapter.end - chapter.start);
      return left + inside * width;
    }
  }
  return 1;
}

/** The moment of the Narration under a point of the Timeline (0…1). */
export function timeAt(segments: readonly Segment[], position: number): number {
  const clamped = Math.min(1, Math.max(0, position));
  for (const { chapter, left, width } of segments) {
    if (clamped <= left + width || chapter === segments[segments.length - 1].chapter) {
      const inside = width > 0 ? Math.min(1, Math.max(0, (clamped - left) / width)) : 0;
      return chapter.start + inside * (chapter.end - chapter.start);
    }
  }
  return segments[segments.length - 1].chapter.end;
}
