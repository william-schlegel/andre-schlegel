import { MathUtils } from 'three';

/**
 * Where the camera looks. The table is the plane y = 0, x to the right, z towards the viewer;
 * distances are in metres. A Scene asks for a shot; the camera glides to it (CameraRig).
 */
export interface Shot {
  /** The point of the table at the centre of the picture. */
  x: number;
  z: number;
  /** Height of the looked-at point above the table (a model on its stand, say). */
  y?: number;
  /** From the camera to that point. */
  distance: number;
  /** Degrees from the vertical: 0 looks straight down, 90 would be level with the table. */
  tilt: number;
  /** Degrees around the vertical; 0 looks from the viewer's side of the table. */
  turn?: number;
}

export const FIELD_OF_VIEW = 30;

/** Share of the picture's height kept free below (captions, Timeline) and above (Posting, title). */
const BAND_BELOW = 0.2;
const BAND_ABOVE = 0.1;
const SIDE_MARGIN = 0.06;

/** The whole table, as a Scene opens. */
export const WIDE_SHOT: Shot = { x: 0, z: 0.19, distance: 2.2, tilt: 24 };

/**
 * The shot that shows a rectangle of the table (a print, a Spread) as large as the picture
 * allows, clear of the captions and the Timeline.
 */
export function shotOn(rect: { x: number; z: number; width: number; depth: number }, aspect: number, tilt = 10, fill = 1): Shot {
  const half = Math.tan(MathUtils.degToRad(FIELD_OF_VIEW / 2));
  const usableHeight = 1 - BAND_BELOW - BAND_ABOVE;
  const usableWidth = 1 - 2 * SIDE_MARGIN;
  // a tilted camera sees the rectangle's depth foreshortened
  const seenDepth = rect.depth * Math.cos(MathUtils.degToRad(tilt));
  const distance = Math.max(seenDepth / (2 * half * usableHeight), rect.width / (2 * half * aspect * usableWidth)) / fill;
  // the free band below is taller than the one above: look a little lower than the rectangle's centre
  const visibleDepth = 2 * half * distance;
  const shift = ((BAND_BELOW - BAND_ABOVE) / 2) * visibleDepth;
  return { x: rect.x, z: rect.z + shift, distance, tilt };
}

/** The shot the rig is asked for. Scenes write it; the rig reads it every frame. */
export const stageShot: { wanted: Shot; cut: boolean } = { wanted: WIDE_SHOT, cut: true };

export function lookAt(shot: Shot, cut = false): void {
  stageShot.wanted = shot;
  if (cut) stageShot.cut = true;
}
