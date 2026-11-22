import type { Chapter, ChapterId } from './types';

/**
 * The Chapters, cut on the Film's soundtrack. A Chapter's audio file holds exactly [start, end).
 * Boundaries fall in Eric's pauses, just before the first word of the next Chapter.
 */
export const CHAPTERS: Chapter[] = [
  { id: 'ouverture', number: null, title: 'Ouverture', dates: '', start: 0, end: 44.55, ready: true },
  { id: 'tours', number: 1, title: 'Tours', dates: '1936 – 1939', start: 44.55, end: 174.6, ready: true },
  { id: 'algerie', number: 2, title: 'Algérie', dates: '1939 – 1940', start: 174.6, end: 420, ready: true },
  { id: 'campagne-de-france', number: 3, title: 'Campagne de France', dates: 'mai – juin 1940', start: 420, end: 752, ready: true },
  { id: 'algerie-sous-vichy', number: 4, title: 'Algérie sous Vichy', dates: '1940 – 1943', start: 752, end: 954.4, ready: true },
  { id: 'ecole-anglaise', number: 5, title: 'L’école anglaise', dates: '1943 – 1944', start: 954.4, end: 1308, ready: true },
  { id: 'elvington', number: 6, title: 'Elvington', dates: '1944 – 1945', start: 1308, end: 1782, ready: true },
  { id: 'nuit', number: 7, title: 'Une nuit sur l’Allemagne', dates: '1944 – 1945', start: 1782, end: 2310, ready: true },
  { id: 'missions', number: 8, title: 'Les missions', dates: 'juillet 1944 – avril 1945', start: 2310, end: 3004, ready: true },
  { id: 'apres-la-guerre', number: 9, title: 'Après la guerre', dates: '1945 – 1962', start: 3004, end: 3312, ready: false },
];

export const NARRATION_END = CHAPTERS[CHAPTERS.length - 1].end;

export function chapterById(id: ChapterId): Chapter {
  const chapter = CHAPTERS.find((c) => c.id === id);
  if (!chapter) throw new Error(`Unknown chapter: ${id}`);
  return chapter;
}

/** The Chapter a moment of the Narration belongs to. */
export function chapterAt(time: number): Chapter {
  for (const chapter of CHAPTERS) {
    if (time < chapter.end) return chapter;
  }
  return CHAPTERS[CHAPTERS.length - 1];
}

export function nextChapter(id: ChapterId): Chapter | null {
  const index = CHAPTERS.findIndex((c) => c.id === id);
  return CHAPTERS[index + 1] ?? null;
}

export function previousChapter(id: ChapterId): Chapter | null {
  const index = CHAPTERS.findIndex((c) => c.id === id);
  return index > 0 ? CHAPTERS[index - 1] : null;
}

/** The last moment of the Narration the Journey can reach today. */
export function reachableEnd(): number {
  let end = 0;
  for (const chapter of CHAPTERS) {
    if (!chapter.ready) break;
    end = chapter.end;
  }
  return end;
}
