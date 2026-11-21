/**
 * The shapes of the Journey's content. Vocabulary follows CONTEXT.md.
 * Every time is a number of seconds on the Film's soundtrack (see docs/adr/0001).
 */

export type ChapterId =
  | 'ouverture'
  | 'tours'
  | 'algerie'
  | 'campagne-de-france'
  | 'algerie-sous-vichy'
  | 'ecole-anglaise'
  | 'elvington'
  | 'nuit'
  | 'missions'
  | 'apres-la-guerre';

export interface Chapter {
  id: ChapterId;
  /** 1…9; the Ouverture has none. */
  number: number | null;
  title: string;
  /** The years the Chapter covers, as shown on the Timeline. */
  dates: string;
  start: number;
  end: number;
  /** False until the Chapter is built; the Journey stops before it. */
  ready: boolean;
}

export interface Phrase {
  start: number;
  end: number;
  text: string;
}

/** Where André is serving: the card that stays in the corner of a Scene. */
export interface Posting {
  from: number;
  rank: string;
  base: string;
  unit: string;
  dates: string;
}

/** A dated event of the story, written under the Timeline. */
export interface TimelineMark {
  at: number;
  label: string;
}

/** A place on the table, in metres from its centre; `turn` in degrees, clockwise seen from above. */
export interface Place {
  x: number;
  z: number;
  turn?: number;
}

export type CarnetId = '1938' | '1940' | '1947';

export type ModelId =
  | 'bloch-200'
  | 'potez-25'
  | 'bloch-210'
  | 'db-7'
  | 'anson'
  | 'wellington'
  | 'halifax'
  | 'york'
  | 'ju-52'
  | 'c-54';

/** A rectangle of the table: its centre, its width (along x) and its depth (along z). */
export interface Frame {
  x: number;
  z: number;
  width: number;
  depth: number;
}

interface CueBase {
  id: string;
  /** When Eric shows it. */
  at: number;
  /** When it leaves the table; by default it stays until the end of the Chapter. */
  until?: number;
  /** How long the camera stays on it; by default until the next cue takes the eye. */
  hold?: number;
  /** What the camera frames, when it is not the thing itself (a group of things, say). */
  frame?: Frame;
}

/** A photograph or a document laid on the table. */
export interface PrintCue extends CueBase {
  kind: 'print';
  src: string;
  /** Pixel size of the picture, for its proportions. */
  size: [number, number];
  /** Width of the print on the table, in metres. */
  width: number;
  place: Place;
  /** What the picture shows, in a few words. */
  legend: string;
  /** Where it comes from. */
  source: string;
  /** Paper: a photographic print with its white border, or a bare sheet. */
  paper?: 'photo' | 'sheet' | 'bare';
  /** A Bonus is not in the Film. */
  bonus?: boolean;
}

/** The Companion opens at a Spread. */
export interface SpreadCue extends CueBase {
  kind: 'spread';
  carnet: CarnetId;
  spread: number;
  /** Lines Eric points at: boxes in the Spread, as fractions [x, y, w, h]. */
  marks?: { at: number; box: [number, number, number, number] }[];
}

/** A Recognition model is set on the table. */
export interface ModelCue extends CueBase {
  kind: 'model';
  model: ModelId;
  place: Place;
  /** The typed label in front of its stand. */
  label: string[];
}

/** The camera takes in a part of the table, or the whole of it, with nothing new laid down. */
export interface ViewCue extends CueBase {
  kind: 'view';
  frame?: Frame;
}

/** The Chart is unrolled, or moves to another view. */
export interface ChartCue extends CueBase {
  kind: 'chart';
  view: string;
}

export type DecorationId = 'legion-honneur' | 'croix-de-guerre' | 'dfc';

/** A decoration catches the light as Eric names it (Ouverture). */
export interface DecorationCue extends CueBase {
  kind: 'decoration';
  decoration: DecorationId;
}

/** Words set on the table: a title, a typed note. */
export interface NoteCue extends CueBase {
  kind: 'note';
  lines: string[];
  place: Place;
  style: 'title' | 'typed';
}

export type Cue = PrintCue | SpreadCue | ModelCue | ChartCue | DecorationCue | NoteCue | ViewCue;

/** The Carnet André is filling during the Chapter, and where it lies on the table. */
export interface CompanionPlace {
  carnet: CarnetId;
  /** Where the spine lies. Closed, the book extends to the right of it. */
  place: Place;
  /** The view the book shows as the Chapter starts: 0 is closed, 1 the title page, n the nth scan. */
  view: number;
}

export interface ChapterContent {
  chapter: Chapter;
  phrases: Phrase[];
  /** Sorted by `at`. */
  cues: Cue[];
  postings: Posting[];
  marks: TimelineMark[];
  companion: CompanionPlace;
}
