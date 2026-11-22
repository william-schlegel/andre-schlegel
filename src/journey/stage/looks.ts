/**
 * The light and air of a Scene. Each Chapter has its own; the stage moves from one to the
 * next rather than switching (see Light.tsx).
 */
export interface Look {
  /** What lies beyond the table. */
  backdrop: string;
  /** The key light: the desk lamp at night, the window by day. */
  key: { colour: string; strength: number; from: [number, number, number]; spread: number; softness: number };
  /** The light that fills the shadows. */
  fill: { sky: string; ground: string; strength: number };
  /** The table's surface. */
  surface: 'desk-pad' | 'oak' | 'cloth';
  /** 0: the room is dark around the lamp's pool; 1: full day. */
  day: number;
}

export const LOOKS = {
  /** The lamp is off: only what the night gives. */
  dark: {
    backdrop: '#050403',
    key: { colour: '#ffd7a0', strength: 0, from: [0.25, 1.5, -0.35], spread: 0.62, softness: 0.9 },
    fill: { sky: '#31405c', ground: '#0a0806', strength: 0.05 },
    surface: 'desk-pad',
    day: 0,
  },
  /** « Dossier sous la lampe »: a warm pool of light on the desk, the room dark around it. */
  lamp: {
    backdrop: '#070504',
    key: { colour: '#ffe1bc', strength: 15, from: [0.2, 1.55, -0.3], spread: 0.56, softness: 1 },
    fill: { sky: '#3c4a66', ground: '#120c08', strength: 0.16 },
    surface: 'desk-pad',
    day: 0,
  },
  /** Tours, 1936-1939: a summer morning, the sun through the office window. */
  summer: {
    backdrop: '#191510',
    key: { colour: '#fff1d6', strength: 15, from: [-1.1, 1.9, -0.9], spread: 0.8, softness: 0.6 },
    fill: { sky: '#cfdcea', ground: '#6b5b45', strength: 0.95 },
    surface: 'oak',
    day: 1,
  },
  /** Algeria and Morocco, 1939-1940: a hard white sun, high in the sky, on a trestle table under canvas. */
  sahel: {
    backdrop: '#1d1810',
    key: { colour: '#fff3da', strength: 19, from: [0.9, 2.3, -0.5], spread: 0.85, softness: 0.45 },
    fill: { sky: '#eadfc6', ground: '#8f7650', strength: 1.05 },
    surface: 'cloth',
    day: 1,
  },
  /** The campaign of May and June 1940: a low grey sky over a field table, the light cold and without shadows. */
  overcast: {
    backdrop: '#101214',
    key: { colour: '#e6ebf1', strength: 12, from: [-0.7, 2.2, -0.8], spread: 0.95, softness: 0.95 },
    fill: { sky: '#c0cad6', ground: '#5e5a53', strength: 1.15 },
    surface: 'oak',
    day: 1,
  },
  /** Blida, 1940-1943: the end of an afternoon, the sun low and amber through the blinds, the days long. */
  evening: {
    backdrop: '#17100a',
    key: { colour: '#ffd9ac', strength: 17, from: [-1.25, 1.6, 0.1], spread: 0.95, softness: 0.7 },
    fill: { sky: '#d3c0b0', ground: '#70553a', strength: 1.0 },
    surface: 'cloth',
    day: 1,
  },
} satisfies Record<string, Look>;

export type LookName = keyof typeof LOOKS;
