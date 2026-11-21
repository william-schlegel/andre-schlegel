export type Point = {
  name: string;
  lng: number;
  lat: number;
};

export type Route = {
  from: Point;
  to: Point;
};

export type StageId = 'meta' | 'map' | 'routes' | 'gallery';

export type TimelineCue =
  | 'date'
  | 'title'
  | 'description'
  | 'map'
  | 'route'
  | 'image';

export type TimelineEvent = {
  cue: TimelineCue;
  delayMs: number;
  routeIndex?: number;
  imageIndex?: number;
  side?: 'left' | 'right';
  holdMs?: number;
};

export type PresentationContent = {
  slug: string;
  date: string;
  title: string;
  description: string;
  images: string[];
  routes?: Route[];
  timeline: TimelineEvent[];
  stages: StageId[];
  transcript: string;
};
