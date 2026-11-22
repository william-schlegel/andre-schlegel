import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { missionsOf, typedDate } from '../content/missionsList';
import type { Mission, MissionsCue } from '../content/types';
import { getClock } from '../engine/journey';
import { playSound } from '../sound/sounds';
import { Leaf } from './Print';
import { whenFontsReady } from './textures';

/**
 * A page of the Missions list: a typed table, one line a sortie. The lines are typed while the
 * Film shows the table; later, when Eric tells one of the sorties, its line is underlined in red
 * pencil, as one ticks off a list.
 */

const PIXELS = 1800; // width of the drawing
const MARGIN = 74;
const TOP = 104;
const HEAD_LINE = 46;
const ROW = 37;
const GAP = 32; // between two columns
const FACE = '"Special Elite", monospace';
const UNDERLINE = 0.7; // seconds for the pencil to cross the sheet

const COLUMNS = ['DATE', 'AVION', 'OBJECTIF', 'INCIDENT', 'CITATION'] as const;

function cells(mission: Mission): string[] {
  return [typedDate(mission.date), mission.aircraft, mission.target, mission.note, mission.cited];
}

function rowsTop(cue: MissionsCue): number {
  return TOP + cue.heading.length * HEAD_LINE + 104;
}

function sheetPixels(cue: MissionsCue): number {
  return rowsTop(cue) + missionsOf(cue.period).length * ROW + 64;
}

export function missionsDepth(cue: MissionsCue): number {
  return (cue.width * sheetPixels(cue)) / PIXELS;
}

export function missionsRect(cue: MissionsCue) {
  return { x: cue.place.x, z: cue.place.z, width: cue.width, depth: missionsDepth(cue) };
}

interface MissionsSheetProps {
  cue: MissionsCue;
  shown: boolean;
  order: number;
  onOpen?: () => void;
  onLand?: () => void;
}

export function MissionsSheet({ cue, shown, order, onOpen, onLand }: MissionsSheetProps) {
  const rows = useMemo(() => missionsOf(cue.period).map(cells), [cue.period]);
  const dates = useMemo(() => missionsOf(cue.period).map((mission) => mission.date), [cue.period]);
  const total = useMemo(() => rows.reduce((sum, row) => sum + row.join('').length, 0), [rows]);
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

  // what is on the paper: so many characters, each told line underlined so far; null asks for a fresh drawing
  const drawn = useRef<string | null>(null);
  const ticked = useRef(0);
  useEffect(() => {
    void whenFontsReady().then(() => (drawn.current = null));
  }, []);

  useFrame(() => {
    if (!shown && drawn.current !== null) return;
    const clock = getClock();
    const [from, to] = cue.typing;
    const typed = Math.round(total * Math.min(1, Math.max(0, (clock.time - from) / (to - from))));
    const lines = cue.told.map((told) => Math.min(1, Math.max(0, (clock.time - told.at) / UNDERLINE)));
    const state = `${typed}|${lines.map((line) => line.toFixed(2)).join()}`;
    if (state === drawn.current) return;
    const typing = drawn.current !== null && typed > Number(drawn.current.split('|')[0]);
    drawn.current = state;

    const ctx = canvas.getContext('2d')!;
    // the paper
    ctx.fillStyle = '#ece4cf';
    ctx.fillRect(0, 0, PIXELS, height);
    const age = ctx.createRadialGradient(PIXELS / 2, height / 2, 300, PIXELS / 2, height / 2, 1300);
    age.addColorStop(0, 'rgba(140, 105, 60, 0)');
    age.addColorStop(1, 'rgba(140, 105, 60, 0.17)');
    ctx.fillStyle = age;
    ctx.fillRect(0, 0, PIXELS, height);

    // the heading
    ctx.fillStyle = '#23201c';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    cue.heading.forEach((line, index) => {
      ctx.font = index === 0 ? `400 40px ${FACE}` : `400 27px ${FACE}`;
      ctx.fillText(line, PIXELS / 2, TOP + index * HEAD_LINE);
    });

    // the columns: as wide as their longest entry
    ctx.font = `400 23px ${FACE}`;
    ctx.textAlign = 'left';
    const widths = COLUMNS.map((_, column) => Math.max(...rows.map((row) => ctx.measureText(row[column]).width), 120));
    // what the sheet has to spare is shared between the columns
    const spare = Math.max(0, PIXELS - 2 * MARGIN - widths.reduce((sum, width) => sum + width, 0) - GAP * (COLUMNS.length - 1)) / (COLUMNS.length - 1);
    const lefts: number[] = [];
    let x = MARGIN;
    widths.forEach((width) => {
      lefts.push(x);
      x += width + GAP + spare;
    });
    const top = rowsTop(cue);
    const headAt = top - 46;
    ctx.fillRect(MARGIN, headAt - 34, PIXELS - 2 * MARGIN, 2);
    ctx.fillRect(MARGIN, headAt + 14, PIXELS - 2 * MARGIN, 2);
    ctx.font = `400 19px ${FACE}`;
    COLUMNS.forEach((name, column) => ctx.fillText(name.split('').join(' '), lefts[column], headAt));

    // the lines typed so far
    ctx.font = `400 23px ${FACE}`;
    let before = 0;
    rows.forEach((row, index) => {
      const y = top + index * ROW;
      ctx.fillStyle = 'rgba(35, 32, 28, 0.13)';
      ctx.fillRect(MARGIN, y + 11, PIXELS - 2 * MARGIN, 1);
      row.forEach((cell, column) => {
        const count = Math.min(cell.length, typed - before);
        before += cell.length;
        if (count <= 0) return;
        // a ribbon inks unevenly from line to line
        ctx.fillStyle = `rgba(35, 32, 28, ${0.8 + 0.18 * Math.abs(Math.sin((index * 5 + column) * 12.9898))})`;
        ctx.fillText(cell.slice(0, count), lefts[column], y + Math.sin(index * 4.7 + column) * 0.9);
      });
    });

    // the sorties Eric has told: a stroke of red pencil under the line, a tick in the margin
    cue.told.forEach((told, index) => {
      const row = dates.indexOf(told.date);
      const progress = lines[index];
      if (row < 0 || progress <= 0) return;
      const y = top + row * ROW + 9;
      const end = MARGIN - 8 + (PIXELS - 2 * MARGIN + 16) * progress;
      ctx.strokeStyle = 'rgba(168, 40, 30, 0.86)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(MARGIN - 8, y + 1);
      ctx.quadraticCurveTo((MARGIN + end) / 2, y - 2.5 + (index % 2) * 4, end, y + 1.5 - (index % 2) * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(MARGIN - 44, y - 14);
      ctx.lineTo(MARGIN - 36, y - 4);
      ctx.lineTo(MARGIN - 20, y - 24);
      ctx.stroke();
    });

    // the typewriter, heard while the lines come
    if (typing && clock.isRunning && performance.now() - ticked.current > 75) {
      ticked.current = performance.now();
      playSound('tick');
    }
    texture.needsUpdate = true;
  });

  return <Leaf texture={texture} width={cue.width} depth={missionsDepth(cue)} place={cue.place} paper="sheet" shown={shown} order={order} onOpen={onOpen} onLand={onLand} />;
}
