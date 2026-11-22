import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import type { TypedCue } from '../content/types';
import { getClock } from '../engine/journey';
import { playSound } from '../sound/sounds';
import { Leaf } from './Print';
import { whenFontsReady } from './textures';

/**
 * A citation or an order as a typed sheet. It is laid on the table with its letterhead;
 * the text is typed on it while Eric reads it out, at the pace of his reading.
 */

const PIXELS = 1000; // width of the drawing
const MARGIN = 92;
const LINE = 46;
const HEAD_LINE = 44;
const TOP = 118;
const COLUMNS = 54; // characters to a line: a typewriter's line is counted, not measured

/** The text cut into typewriter lines; a list keeps its own lines (the text's line breaks). */
export function typedLines(text: string): string[] {
  const lines: string[] = [];
  for (const entry of text.split('\n')) {
    let line = '';
    // French punctuation keeps to its word: no line begins with a closing guillemet, a colon or a dash
    const bound = entry.replace(/« /g, '«\u00a0').replace(/ ([»:;!?—])/g, '\u00a0$1');
    for (const word of bound.split(/[ \t]+/)) {
      if (line && line.length + 1 + word.length > COLUMNS) {
        lines.push(line);
        line = word;
      } else {
        line = line ? `${line} ${word}` : word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function sheetPixels(cue: TypedCue): number {
  return TOP + cue.heading.length * HEAD_LINE + 56 + typedLines(cue.text).length * LINE + 96;
}

export function typedDepth(cue: TypedCue): number {
  return (cue.width * sheetPixels(cue)) / PIXELS;
}

export function typedRect(cue: TypedCue) {
  return { x: cue.place.x, z: cue.place.z, width: cue.width, depth: typedDepth(cue) };
}

const WINDOW = 11; // lines of a long sheet the camera takes in at once

/** The line being typed at a moment of the Narration (the first before the reading, the last after it). */
export function typedLineAt(cue: TypedCue, time: number): number {
  const lines = typedLines(cue.text);
  let left = typedAt(cue, time, lines.reduce((sum, line) => sum + line.length, 0));
  for (let index = 0; index < lines.length; index++) {
    if (left <= lines[index].length) return index;
    left -= lines[index].length;
  }
  return lines.length - 1;
}

/**
 * What the camera frames on a typed sheet: the whole of a short one; on a long one, the lines
 * around the one being typed, so that the words stay large enough to be read as Eric reads them.
 */
export function typedWindow(cue: TypedCue, line: number) {
  const count = typedLines(cue.text).length;
  const whole = typedRect(cue);
  if (count <= WINDOW + 3) return whole;
  const pixels = sheetPixels(cue);
  const tall = WINDOW * LINE + 150;
  const bodyTop = TOP + cue.heading.length * HEAD_LINE + 56;
  // the line being typed sits two thirds of the way down: what has just been read stays in sight
  const top = Math.min(pixels - tall, Math.max(0, bodyTop + line * LINE - tall * 0.66));
  return { x: whole.x, z: whole.z + ((top + tall / 2) / pixels - 0.5) * whole.depth, width: whole.width, depth: (cue.width * tall) / PIXELS };
}

/** How many characters are typed at a moment of the Narration. */
function typedAt(cue: TypedCue, time: number, total: number): number {
  const [from, to] = cue.reading;
  return Math.round(total * Math.min(1, Math.max(0, (time - from) / (to - from))));
}

interface TypedSheetProps {
  cue: TypedCue;
  shown: boolean;
  order: number;
  onOpen?: () => void;
  onLand?: () => void;
}

export function TypedSheet({ cue, shown, order, onOpen, onLand }: TypedSheetProps) {
  const lines = useMemo(() => typedLines(cue.text), [cue.text]);
  const total = useMemo(() => lines.reduce((sum, line) => sum + line.length, 0), [lines]);
  const height = sheetPixels(cue);

  const { canvas, texture } = useMemo(() => {
    const element = document.createElement('canvas');
    element.width = PIXELS;
    element.height = height;
    const result = new CanvasTexture(element);
    result.colorSpace = SRGBColorSpace;
    result.anisotropy = 8;
    return { canvas: element, texture: result };
  }, [height]);
  useEffect(() => () => texture.dispose(), [texture]);

  // how many characters are on the paper; -1 asks for the sheet to be drawn afresh
  const typed = useRef(-1);
  useEffect(() => {
    void whenFontsReady().then(() => (typed.current = -1));
  }, []);

  useFrame(() => {
    if (!shown && typed.current >= 0) return;
    const clock = getClock();
    const wanted = typedAt(cue, clock.time, total);
    if (wanted === typed.current) return;
    const ctx = canvas.getContext('2d')!;
    const bodyTop = TOP + cue.heading.length * HEAD_LINE + 56;

    let from = typed.current;
    if (from < 0 || wanted < from) {
      // the blank form: paper, letterhead, a rule
      ctx.fillStyle = '#ece4cf';
      ctx.fillRect(0, 0, PIXELS, height);
      const age = ctx.createRadialGradient(PIXELS / 2, height / 2, 200, PIXELS / 2, height / 2, 900);
      age.addColorStop(0, 'rgba(140, 105, 60, 0)');
      age.addColorStop(1, 'rgba(140, 105, 60, 0.16)');
      ctx.fillStyle = age;
      ctx.fillRect(0, 0, PIXELS, height);
      ctx.fillStyle = '#23201c';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      cue.heading.forEach((line, index) => {
        ctx.font = index === 0 ? '400 38px "Special Elite", monospace' : '400 27px "Special Elite", monospace';
        ctx.fillText(line, PIXELS / 2, TOP + index * HEAD_LINE);
      });
      ctx.fillRect(PIXELS / 2 - 110, TOP + (cue.heading.length - 1) * HEAD_LINE + 26, 220, 2);
      from = 0;
    }

    // the characters typed since the last look
    ctx.font = '400 30px "Special Elite", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    let before = 0;
    lines.forEach((line, row) => {
      const start = Math.max(0, from - before);
      const end = Math.min(line.length, wanted - before);
      for (let column = start; column < end; column++) {
        const index = before + column;
        // a ribbon inks unevenly, and no key strikes quite on the line
        const ink = 0.74 + 0.24 * Math.abs(Math.sin(index * 12.9898));
        ctx.fillStyle = `rgba(35, 32, 28, ${ink})`;
        const x = MARGIN + ctx.measureText(line.slice(0, column)).width;
        ctx.fillText(line[column], x, bodyTop + row * LINE + Math.sin(index * 4.7) * 0.9);
      }
      before += line.length;
    });

    if (typed.current >= 0 && wanted > typed.current && clock.isRunning && wanted % 3 === 0) playSound('tick');
    typed.current = wanted;
    texture.needsUpdate = true;
  });

  return <Leaf texture={texture} width={cue.width} depth={typedDepth(cue)} place={cue.place} paper="sheet" shown={shown} order={order} onOpen={onOpen} onLand={onLand} />;
}
