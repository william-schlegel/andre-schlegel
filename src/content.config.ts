import { defineCollection, z } from 'astro:content';

const routeSchema = z.object({
  from: z.object({
    name: z.string(),
    lng: z.number(),
    lat: z.number()
  }),
  to: z.object({
    name: z.string(),
    lng: z.number(),
    lat: z.number()
  })
});

const timelineSchema = z.object({
  cue: z.enum(['date', 'title', 'description', 'map', 'route', 'image']),
  delayMs: z.number().int().nonnegative(),
  routeIndex: z.number().int().nonnegative().optional(),
  imageIndex: z.number().int().nonnegative().optional(),
  side: z.enum(['left', 'right']).optional(),
  holdMs: z.number().int().positive().optional()
});

const contents = defineCollection({
  type: 'content',
  schema: z.object({
    date: z.coerce.date(),
    title: z.string(),
    description: z.string(),
    images: z.array(z.string()).default([]),
    routes: z.array(routeSchema).default([]),
    videos: z.array(z.string()).optional(),
    timeline: z.array(timelineSchema).default([]),
    logbookImage: z.string().optional(),
    logbookText: z.string().optional(),
    grade: z.string().optional(),
    narratorAudio: z.string().optional()
  })
});

export const collections = { contents };
