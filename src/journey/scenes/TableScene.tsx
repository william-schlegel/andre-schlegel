import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { MathUtils, type Group } from 'three';
import { DECORATIONS } from '../content/ouverture';
import type { CarnetId, ChapterContent, ChartCue, Cue, DecorationCue, ModelCue, PrintCue, ProjectionCue, SpreadCue, TypedCue } from '../content/types';
import { cueInFocus } from '../engine/cues';
import { getClock, openCloseUp, sameList, useNarration } from '../engine/journey';
import { useJourney } from '../engine/store';
import { playSound } from '../sound/sounds';
import { Companion, companionFrame } from '../stage/Companion';
import { Decoration } from '../stage/Decoration';
import { Print, printRect } from '../stage/Print';
import { Projection, projectionShot } from '../stage/Projection';
import { lookAt, shotOn, WIDE_SHOT, type Shot } from '../stage/shot';
import { TypedSheet, typedRect } from '../stage/TypedSheet';

/** A sound only when the Narration brought the thing, not when the visitor jumped past it. */
function arrivedByListening(cue: Cue): boolean {
  const clock = getClock();
  return clock.isRunning && clock.time - cue.at < 2.5;
}

interface TableSceneProps {
  content: ChapterContent;
  /** The Narration has not begun (Introduction, Chapter opening): only what lies there from the start is shown. */
  waiting?: boolean;
  /** On the Introduction's table, opening the Carnet begins the Journey. */
  onBegin?: () => void;
  /** Someone else directs the camera (a Chapter opening). */
  directed?: boolean;
  /** The shot when nothing in particular is looked at. */
  wide?: Shot;
  /** Draws a Recognition model cue (Chapters provide their own models). */
  model?: (cue: ModelCue, shown: boolean) => ReactNode;
  /** Draws the Chart for the Chapter; it is told which of its views the Narration has reached, in order. */
  chart?: (views: string[]) => ReactNode;
  /** How to frame a model or the Chart when the camera goes to them. */
  shotFor?: (cue: Cue, aspect: number) => Shot | null;
}

/**
 * What a Chapter puts on the table, in step with the Narration: prints as Eric shows them,
 * the Companion opening at the Spreads he cites, and the camera going to whatever he is
 * talking about. Everything is derived from the Narration's time, so moving in the Timeline
 * sets the table exactly as listening would have.
 */
export function TableScene({ content, waiting = false, onBegin, directed = false, wide = WIDE_SHOT, model, chart, shotFor }: TableSceneProps) {
  const { cues, companion } = content;
  const prints = useMemo(() => cues.filter((cue): cue is PrintCue => cue.kind === 'print'), [cues]);
  const spreads = useMemo(() => cues.filter((cue): cue is SpreadCue => cue.kind === 'spread'), [cues]);
  const models = useMemo(() => cues.filter((cue): cue is ModelCue => cue.kind === 'model'), [cues]);
  const charts = useMemo(() => cues.filter((cue): cue is ChartCue => cue.kind === 'chart'), [cues]);
  const decorations = useMemo(() => cues.filter((cue): cue is DecorationCue => cue.kind === 'decoration'), [cues]);
  const projections = useMemo(() => cues.filter((cue): cue is ProjectionCue => cue.kind === 'projection'), [cues]);
  const typed = useMemo(() => cues.filter((cue): cue is TypedCue => cue.kind === 'typed'), [cues]);

  // while waiting, time stands before the first word
  const at = (time: number) => (waiting ? -0.5 : time);

  const shownIds = useNarration(
    (time) => cues.filter((cue) => cue.at <= at(time) && (cue.until === undefined || at(time) < cue.until)).map((cue) => cue.id),
    sameList,
  );
  const shown = useMemo(() => new Set(shownIds), [shownIds]);
  const focus = useNarration((time) => (waiting ? null : cueInFocus(cues, time)));
  // the Carnet André is filling: the Chapter's, until the Narration reaches the pages of the next one
  const next = companion.next;
  const carnet = useNarration((time): CarnetId => (next && at(time) >= next.at ? next.carnet : companion.carnet));
  const spreadCue = useNarration((time) => {
    let latest: SpreadCue | null = null;
    for (const cue of spreads) if (cue.at <= at(time)) latest = cue;
    return latest;
  });
  const marksShown = useNarration((time) => (spreadCue?.marks ?? []).filter((mark) => mark.at <= at(time)).length);

  // the sound of what the Narration has just brought: a decoration catching the light, a model set down
  const heard = useRef(shown);
  useEffect(() => {
    for (const cue of cues) {
      if (!shown.has(cue.id) || heard.current.has(cue.id) || !arrivedByListening(cue)) continue;
      if (cue.kind === 'decoration') playSound('medal');
      if (cue.kind === 'model') playSound('print', 0.5);
      if (cue.kind === 'chart') playSound('print');
    }
    heard.current = shown;
  }, [shown, cues]);

  const closeUp = useJourney((state) => state.closeUp);
  const browsing = closeUp?.kind === 'carnet' ? closeUp.spread : null;
  /** What a book shows: the visitor's page while he browses it, else the Spread Eric cites; put away, it is closed. */
  const viewOf = (book: CarnetId, start: number): number => {
    if (closeUp?.kind === 'carnet' && closeUp.carnet === book) return closeUp.spread;
    if (book !== carnet) return 0;
    return spreadCue?.carnet === book ? spreadCue.spread : start;
  };

  // ----- the camera goes to what Eric shows -----
  const aspect = useThree((state) => state.size.width / state.size.height);
  useEffect(() => {
    // a Chapter opening, the Carnet's Close-up and a model's Close-up frame themselves
    if (directed || closeUp?.kind === 'carnet' || closeUp?.kind === 'model') return;
    let shot: Shot | null = null;
    if (!focus) shot = wide;
    else if (focus.frame) shot = shotOn(focus.frame, aspect, 13);
    else if (focus.kind === 'print') shot = shotOn(printRect(focus), aspect, 11, 0.92);
    else if (focus.kind === 'spread') shot = shotOn(companionFrame(companion.place, true), aspect, 7);
    else if (focus.kind === 'projection') shot = projectionShot(focus, aspect);
    else if (focus.kind === 'typed') shot = shotOn(typedRect(focus), aspect, 10, 0.94);
    else if (focus.kind === 'view') shot = wide;
    else shot = shotFor?.(focus, aspect) ?? wide;
    lookAt(shot);
  }, [focus, aspect, closeUp, directed, companion.place, wide, shotFor]);

  const marks = useMemo(
    () => (spreadCue?.marks ?? []).map((mark, index) => ({ spread: spreadCue!.spread, box: mark.box, shown: index < marksShown && browsing === null })),
    [spreadCue, marksShown, browsing],
  );
  const book = (id: CarnetId, start: number) => {
    const view = viewOf(id, start);
    return (
      <Companion
        carnet={id}
        place={companion.place}
        view={view}
        startView={view}
        sharp={(focus?.kind === 'spread' && focus.carnet === id) || (browsing !== null && closeUp?.kind === 'carnet' && closeUp.carnet === id)}
        marks={spreadCue?.carnet === id ? marks : undefined}
        onOpen={waiting ? onBegin : () => openCloseUp({ kind: 'carnet', carnet: id, spread: Math.max(1, view) })}
        onTurn={(what) => playSound(what)}
      />
    );
  };

  return (
    <>
      {prints.map((cue, index) => (
        <Print
          key={cue.id}
          cue={cue}
          order={index}
          shown={shown.has(cue.id)}
          onOpen={waiting ? undefined : () => openCloseUp({ kind: 'print', id: cue.id })}
          onLand={() => arrivedByListening(cue) && playSound('print')}
        />
      ))}

      {typed.map((cue, index) => (
        <TypedSheet
          key={cue.id}
          cue={cue}
          order={prints.length + index}
          shown={shown.has(cue.id)}
          onOpen={() => openCloseUp({ kind: 'typed', id: cue.id })}
          onLand={() => arrivedByListening(cue) && playSound('print')}
        />
      ))}

      {next ? (
        <>
          <InHand held={carnet === companion.carnet} towards="left">
            {book(companion.carnet, companion.view)}
          </InHand>
          <InHand held={carnet === next.carnet} towards="viewer">
            {book(next.carnet, 0)}
          </InHand>
        </>
      ) : (
        book(companion.carnet, companion.view)
      )}

      {decorations.length > 0 &&
        DECORATIONS.map((decoration) => (
          <Decoration
            key={decoration.id}
            src={decoration.src}
            width={decoration.width}
            depth={decoration.depth}
            place={decoration.place}
            lit={shown.has(decoration.id)}
          />
        ))}

      {models.map((cue) => model?.(cue, shown.has(cue.id)))}
      {chart?.(charts.filter((cue) => shown.has(cue.id)).map((cue) => cue.view))}
      {projections.map((cue) => (
        <Projection key={cue.id} cue={cue} shown={shown.has(cue.id)} watched={focus === null || focus.id === cue.id} />
      ))}
    </>
  );
}

/**
 * A Carnet put away, or taken out: when André starts a new book, the old one is closed and
 * slid off the table, and the new one is laid in its place.
 */
function InHand({ held, towards, children }: { held: boolean; towards: 'left' | 'viewer'; children: ReactNode }) {
  const group = useRef<Group>(null);
  // 1: on the table; 0: away. The book is given time to close before it leaves, and room before it comes.
  const here = useRef(held ? 1 : 0);
  const since = useRef(10);
  const was = useRef(held);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    if (was.current !== held) {
      was.current = held;
      since.current = 0;
    }
    since.current += dt;
    const wait = held ? 2.2 : 1.6;
    if (since.current > wait) here.current = MathUtils.clamp(here.current + (held ? 1 : -1) * (dt / 1.25), 0, 1);
    const node = group.current;
    if (!node) return;
    const eased = here.current * here.current * (3 - 2 * here.current);
    const away = 1 - eased;
    node.visible = away < 0.999;
    if (towards === 'left') node.position.set(-away * 1.7, 0, away * 0.25);
    else node.position.set(-away * 0.2, away * 0.05, away * 1.5);
    node.rotation.y = away * (towards === 'left' ? 0.5 : -0.35);
  });

  return (
    <group ref={group} visible={held}>
      {children}
    </group>
  );
}
