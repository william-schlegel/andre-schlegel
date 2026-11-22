/**
 * How the places of the Narration are marked on the whole Chart, whatever its scale: places
 * that would stand on one another are gathered under one mark, and each mark's name is
 * written where there is room for it.
 */

export interface Spot<T> {
  item: T;
  x: number;
  y: number;
  /** Spots of different sheets are never gathered. */
  sheet: string;
}

export interface Gathering<T> {
  items: T[];
  x: number;
  y: number;
  sheet: string;
}

/**
 * Gathers the spots that are nearer than `reach` to one another once the Chart is seen at
 * `scale`: the two nearest first, then again, until every mark stands clear of the others.
 */
export function gather<T>(spots: Spot<T>[], scale: number, reach: number): Gathering<T>[] {
  const marks: Gathering<T>[] = spots.map((spot) => ({ items: [spot.item], x: spot.x, y: spot.y, sheet: spot.sheet }));
  for (;;) {
    let nearest = reach / scale;
    let pair: [number, number] | null = null;
    for (let i = 0; i < marks.length; i++) {
      for (let j = i + 1; j < marks.length; j++) {
        if (marks[i].sheet !== marks[j].sheet) continue;
        const apart = Math.hypot(marks[i].x - marks[j].x, marks[i].y - marks[j].y);
        if (apart < nearest) {
          nearest = apart;
          pair = [i, j];
        }
      }
    }
    if (!pair) return marks;
    const [a, b] = [marks[pair[0]], marks[pair[1]]];
    const count = a.items.length + b.items.length;
    // the mark stands at the middle of the places it gathers
    marks[pair[0]] = {
      items: [...a.items, ...b.items],
      x: (a.x * a.items.length + b.x * b.items.length) / count,
      y: (a.y * a.items.length + b.y * b.items.length) / count,
      sheet: a.sheet,
    };
    marks.splice(pair[1], 1);
  }
}

export type Side = 'right' | 'left' | 'below' | 'above';

export interface Lettered {
  x: number;
  y: number;
  /** Half the width of the mark itself. */
  radius: number;
  /** The size of its name, once lettered. */
  width: number;
  height: number;
  /** The name is kept inside this (the mark's sheet), if given. */
  room?: Box;
}

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const SIDES: Side[] = ['right', 'left', 'below', 'above'];

function nameBox(mark: Lettered, side: Side, gap: number): Box {
  const { x, y, radius, width, height } = mark;
  if (side === 'right') return { left: x + radius + gap, top: y - height / 2, right: x + radius + gap + width, bottom: y + height / 2 };
  if (side === 'left') return { left: x - radius - gap - width, top: y - height / 2, right: x - radius - gap, bottom: y + height / 2 };
  if (side === 'below') return { left: x - width / 2, top: y + radius + gap, right: x + width / 2, bottom: y + radius + gap + height };
  return { left: x - width / 2, top: y - radius - gap - height, right: x + width / 2, bottom: y - radius - gap };
}

const overlap = (a: Box, b: Box) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
const inside = (a: Box, room: Box) => a.left >= room.left && a.right <= room.right && a.top >= room.top && a.bottom <= room.bottom;

/**
 * Where each mark's name is written: to its right if there is room, else to its left, below
 * or above; `null` when the name would run over another mark or a name already written (the
 * first marks of the list are served first), or off its sheet. A mark without a name (no
 * width) has none to write.
 */
export function letter(marks: Lettered[], gap = 4): (Side | null)[] {
  const taken: Box[] = marks.map(({ x, y, radius }) => ({ left: x - radius, top: y - radius, right: x + radius, bottom: y + radius }));
  return marks.map((mark, index) => {
    if (!(mark.width > 0)) return null;
    for (const side of SIDES) {
      const box = nameBox(mark, side, gap);
      if (mark.room && !inside(box, mark.room)) continue;
      if (taken.some((other, at) => at !== index && overlap(box, other))) continue;
      taken.push(box);
      return side;
    }
    return null;
  });
}
