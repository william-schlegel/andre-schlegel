import { getCollection } from 'astro:content';
import type { PresentationContent, StageId, TimelineEvent } from './presentation-types';

const formatIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const computeStages = (entry: {
  images: string[];
  routes: Array<unknown>;
  timeline: TimelineEvent[];
}): StageId[] => {
  if (entry.timeline.length > 0) {
    const hasMap = entry.timeline.some((event) => event.cue === 'map');
    const hasRoutes = entry.timeline.some((event) => event.cue === 'route');
    const hasGallery = entry.timeline.some((event) => event.cue === 'image');
    const stages: StageId[] = ['meta'];
    if (hasMap) stages.push('map');
    if (hasRoutes) stages.push('routes');
    if (hasGallery) stages.push('gallery');
    return stages;
  }

  const stages: StageId[] = ['meta'];
  const hasMap = entry.routes.length > 0;

  if (hasMap) {
    stages.push('map');
    stages.push('routes');
  }

  if (entry.images.length > 0) {
    stages.push('gallery');
  }

  return stages;
};

const defaultTimeline = (entry: { images: string[]; routes: Array<unknown> }): TimelineEvent[] => {
  const events: TimelineEvent[] = [
    { cue: 'date', at: 0 },
    { cue: 'title', at: 120 },
    { cue: 'description', at: 320 }
  ];

  if (entry.routes.length > 0) {
    events.push({ cue: 'map', at: 520 });
    entry.routes.forEach((_, index) => {
      events.push({ cue: 'route', at: 900 + index * 1300, routeIndex: index });
    });
  }

  if (entry.images.length > 0) {
    entry.images.forEach((_, index) => {
      events.push({
        cue: 'image',
        at: 1100 + index * 400,
        imageIndex: index,
        side: index % 2 === 0 ? 'left' : 'right'
      });
    });
  }

  return events;
};

export const loadPresentationContents = async (): Promise<PresentationContent[]> => {
  const entries = await getCollection('contents');

  const sorted = entries.sort((a, b) => a.data.date.getTime() - b.data.date.getTime());

  return sorted.map((entry) => ({
    slug: entry.slug,
    date: formatIsoDate(entry.data.date),
    title: entry.data.title,
    description: entry.data.description,
    images: entry.data.images,
    routes: entry.data.routes,
    timeline: (entry.data.timeline.length > 0 ? entry.data.timeline : defaultTimeline({
      images: entry.data.images,
      routes: entry.data.routes
    })).sort((a, b) => a.at - b.at),
    stages: computeStages({
      images: entry.data.images,
      routes: entry.data.routes,
      timeline: entry.data.timeline
    }),
    transcript: entry.body
  }));
};

export const getPresentationStepCount = (items: PresentationContent[]) => {
  return items.reduce((acc, item) => acc + Math.max(item.timeline.length, 1), 0);
};
