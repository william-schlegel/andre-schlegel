import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { sheetProjection, sheetSize } from '../chart/draw';
import { sheetDrawing } from '../chart/drawings';
import { gather, letter, type Side } from '../chart/marks';
import { POSTS, type PostId } from '../chart/places';
import { farPlaces, toldPlaces, type Moment, type ToldPlace, type WholeSheet } from '../chart/told';
import { chapterAt } from '../content/chapters';
import { formatTime } from '../engine/cues';
import { getClock, goToMoment } from '../engine/journey';
import { CloseUpFrame } from './CloseUpFrame';

gsap.registerPlugin(useGSAP);

/** The two sheets as they lie side by side, in the Close-up's own units (the first sheet is 1 000 wide). */
const LAID: Record<WholeSheet, { x: number; y: number; width: number; turn: number }> = {
  ensemble: { x: 0, y: 0, width: 1000, turn: -0.5 },
  'atlantique-sud': { x: 1080, y: 330, width: 690, turn: 1.3 },
};
const depthOf = (sheet: WholeSheet) => LAID[sheet].width / sheetSize(sheet).width * sheetSize(sheet).depth;
const WHOLE = {
  width: Math.max(...(Object.keys(LAID) as WholeSheet[]).map((sheet) => LAID[sheet].x + LAID[sheet].width)),
  height: Math.max(...(Object.keys(LAID) as WholeSheet[]).map((sheet) => LAID[sheet].y + depthOf(sheet))),
};

/** The Route of the whole career, from posting to posting. The crossing from Algiers to Liverpool was by sea: its course is not known, and not drawn. */
const ROUTES: { sheet: WholeSheet; posts: PostId[] }[] = [
  { sheet: 'ensemble', posts: ['tours', 'oran', 'biskra', 'meknes', 'evreux', 'pithiviers', 'blida'] },
  { sheet: 'ensemble', posts: ['liverpool', 'dumfries', 'lossiemouth', 'rufforth', 'elvington', 'paris'] },
  { sheet: 'atlantique-sud', posts: ['paris', 'dakar', 'rio', 'buenos-aires'] },
];

/** Room kept clear of the sheets: the title above, the notes below. A low screen (a phone held sideways) keeps the title only. */
const LOW = 480;
const roomAbove = (height: number) => (height < LOW ? 58 : 86);
const roomBelow = (height: number) => (height < LOW ? 46 : 52);
const CLOSEST = 4.5; // how many times nearer than the whole view
const REACH = 23; // marks nearer than this, in pixels, are gathered
const NAME_SIZE = 12.5;

interface View {
  scale: number;
  x: number;
  y: number;
}

interface Mark {
  key: string;
  places: ToldPlace[];
  /** In the Close-up's units. */
  x: number;
  y: number;
  name: string;
  /** What is written beside the mark: nothing when it gathers places that have no name in common. */
  lettering: string;
  moments: number;
}

let pen: CanvasRenderingContext2D | null = null;
/** The width of a mark's name as it is lettered: red capitals, a little apart. */
function nameWidth(name: string): number {
  pen ??= document.createElement('canvas').getContext('2d');
  if (!pen) return name.length * 9;
  pen.font = `700 ${NAME_SIZE}px "Old Standard TT", serif`;
  return pen.measureText(name.toUpperCase()).width + name.length * 0.6 + 4;
}

/** How many places each region holds: a mark takes the region's name once it stands for most of it. */
const REGIONS = new Map<string, number>();
for (const { region } of toldPlaces()) if (region) REGIONS.set(region, (REGIONS.get(region) ?? 0) + 1);

function nameOf(places: ToldPlace[]): { name: string; lettering: string } {
  const both = (name: string) => ({ name, lettering: name });
  if (places.length === 1) return both(places[0].name);
  const region = places[0].region;
  const whole = region !== undefined && places.every((place) => place.region === region);
  if (whole && (places.length > 2 || places.length === REGIONS.get(region))) return both(region);
  if (places.length === 2) return both(`${places[0].name} · ${places[1].name}`);
  if (whole) return both(region);
  // seen from too far to tell them apart: the mark's number is all that is written
  return { name: `${places[0].name}, ${places[1].name} et ${places.length - 2 === 1 ? 'un autre lieu' : `${places.length - 2} autres lieux`}`, lettering: '' };
}

const whenTold = (moment: Moment) => {
  const chapter = chapterAt(moment.at);
  return `${chapter.number ? `Chapitre ${chapter.number} · ` : ''}${chapter.title} · ${formatTime(moment.at)}`;
};

/**
 * The whole Chart: the sheets of every Chapter in one, with all the places of the Narration.
 * Choosing a place takes the Narration to the moment it is told; where several places stand
 * together, or one is told more than once, a list gives the choice. The visitor moves over
 * the Chart by dragging, and comes nearer with the wheel, two fingers or the buttons.
 */
export function ChartCloseUp() {
  const root = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  useEffect(() => {
    const resize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ----- the view: the whole of both sheets to begin with -----
  const above = roomAbove(size.height);
  const below = roomBelow(size.height);
  const whole = useMemo((): View => {
    const scale = Math.min((size.width * 0.95) / WHOLE.width, (size.height - above - below) / WHOLE.height);
    return { scale, x: (size.width - WHOLE.width * scale) / 2, y: above + (size.height - above - below - WHOLE.height * scale) / 2 };
  }, [size, above, below]);
  const [view, setView] = useState(whole);
  useEffect(() => setView(whole), [whole]);

  const held = useCallback(
    (next: View): View => {
      const scale = Math.min(whole.scale * CLOSEST, Math.max(whole.scale, next.scale));
      // the sheets never leave the picture: a small view stays inside it, a large one covers it
      const within = (value: number, room: number, extent: number, before: number, after: number) => {
        const a = before;
        const b = room - after - extent * scale;
        return Math.min(Math.max(a, b), Math.max(Math.min(a, b), value));
      };
      return { scale, x: within(next.x, size.width, WHOLE.width, whole.x, whole.x), y: within(next.y, size.height, WHOLE.height, whole.y, size.height - whole.y - WHOLE.height * whole.scale) };
    },
    [whole, size],
  );
  /** Comes nearer (or goes back) keeping the point of the Chart under (x, y) where it is. */
  const nearer = useCallback(
    (by: number, x: number, y: number) =>
      setView((now) => {
        const scale = Math.min(whole.scale * CLOSEST, Math.max(whole.scale, now.scale * by));
        return held({ scale, x: x - ((x - now.x) * scale) / now.scale, y: y - ((y - now.y) * scale) / now.scale });
      }),
    [whole, held],
  );
  const glide = useRef<gsap.core.Tween | null>(null);
  /** The buttons: the view glides to its new scale. */
  const step = (by: number) => {
    glide.current?.kill();
    const from = { scale: view.scale };
    const to = by === 0 ? whole.scale : Math.min(whole.scale * CLOSEST, Math.max(whole.scale, view.scale * by));
    let last = from.scale;
    glide.current = gsap.to(from, {
      scale: to,
      duration: 0.45,
      ease: 'power2.inOut',
      onUpdate: () => {
        nearer(from.scale / last, size.width / 2, (size.height + above - below) / 2);
        last = from.scale;
      },
      onComplete: () => by === 0 && setView(whole),
    });
  };
  useEffect(() => () => void glide.current?.kill(), []);

  // ----- the places, each where it falls on its sheet -----
  const spots = useMemo(() => {
    const projections = { ensemble: sheetProjection('ensemble'), 'atlantique-sud': sheetProjection('atlantique-sud') };
    const onWhole = (sheet: WholeSheet, at: [number, number]) => {
      const laid = LAID[sheet];
      const [px, py] = projections[sheet](at)!;
      const unit = laid.width / sheetSize(sheet).pixels[0];
      // the sheet is turned a little about its middle
      const dx = px * unit - laid.width / 2;
      const dy = py * unit - depthOf(sheet) / 2;
      const turn = (laid.turn * Math.PI) / 180;
      return { x: laid.x + laid.width / 2 + dx * Math.cos(turn) - dy * Math.sin(turn), y: laid.y + depthOf(sheet) / 2 + dx * Math.sin(turn) + dy * Math.cos(turn) };
    };
    return {
      places: toldPlaces().map((place) => ({ item: place, sheet: place.sheet, ...onWhole(place.sheet, place.at) })),
      routes: ROUTES.map(({ sheet, posts }) => posts.map((post) => onWhole(sheet, POSTS[post].at))),
    };
  }, []);

  // where the Narration is: the place told last
  const here = useMemo(() => {
    const now = getClock().time;
    let last: { place: ToldPlace; moment: Moment } | null = null;
    for (const place of toldPlaces()) for (const moment of place.moments) if (moment.at <= now && (!last || moment.at >= last.moment.at)) last = { place, moment };
    return last;
  }, []);

  // ----- the marks at this scale: places that would stand on one another are gathered -----
  const scale = Math.round(view.scale * 200) / 200;
  const marks = useMemo(() => {
    const gathered: Mark[] = gather(spots.places, scale, REACH).map(({ items, x, y }) => {
      const places = [...items].sort((a, b) => a.moments[0].at - b.moments[0].at);
      return { key: places.map((place) => place.id).join('+'), places, x, y, ...nameOf(places), moments: places.reduce((sum, place) => sum + place.moments.length, 0) };
    });
    // a name stays on the paper of its sheet
    const paper = (sheet: WholeSheet) => ({
      left: (LAID[sheet].x + 14) * scale,
      top: (LAID[sheet].y + 14) * scale,
      right: (LAID[sheet].x + LAID[sheet].width - 14) * scale,
      bottom: (LAID[sheet].y + depthOf(sheet) - 14) * scale,
    });
    gathered.sort((a, b) => a.places[0].moments[0].at - b.places[0].moments[0].at);
    const sides = letter(
      gathered.map((mark) => ({
        x: mark.x * scale,
        y: mark.y * scale,
        radius: mark.places.length > 1 ? 11 : 8,
        width: mark.lettering ? nameWidth(mark.lettering) : 0,
        height: NAME_SIZE + 3,
        room: paper(mark.places[0].sheet),
      })),
    );
    return gathered.map((mark, index) => ({ ...mark, side: sides[index] }));
  }, [spots, scale]);

  // ----- what the visitor points at, and the list of a mark that holds several moments -----
  const [pointed, setPointed] = useState<Mark | null>(null);
  const [list, setList] = useState<{ mark: Mark; x: number; y: number } | null>(null);
  const choose = (mark: Mark, event: { clientX: number; clientY: number; currentTarget: Element }) => {
    if (dragged.current) return;
    if (mark.moments === 1) return goToMoment(mark.places[0].moments[0].at);
    const box = event.currentTarget.getBoundingClientRect();
    setList({ mark, x: box.left + box.width / 2, y: box.top + box.height / 2 });
  };
  // Escape puts the list away before it closes the Chart
  useEffect(() => {
    if (!list) return;
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopImmediatePropagation();
      setList(null);
    };
    window.addEventListener('keydown', key, true);
    return () => window.removeEventListener('keydown', key, true);
  }, [list]);

  // ----- moving over the Chart -----
  const fingers = useRef(new Map<number, { x: number; y: number }>());
  const travelled = useRef(0);
  const dragged = useRef(false);
  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest('[data-list], [data-tools]')) return;
    if (list) setList(null);
    glide.current?.kill();
    fingers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (fingers.current.size === 1) {
      travelled.current = 0;
      dragged.current = false;
    }
  };
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    const finger = fingers.current.get(event.pointerId);
    if (!finger) return;
    const dx = event.clientX - finger.x;
    const dy = event.clientY - finger.y;
    if (fingers.current.size === 2) {
      // two fingers: the Chart comes nearer as they part
      const [other] = [...fingers.current.entries()].filter(([id]) => id !== event.pointerId).map(([, at]) => at);
      const before = Math.hypot(finger.x - other.x, finger.y - other.y);
      const after = Math.hypot(event.clientX - other.x, event.clientY - other.y);
      dragged.current = true;
      if (before > 0) nearer(after / before, (event.clientX + other.x) / 2, (event.clientY + other.y) / 2);
    } else {
      travelled.current += Math.abs(dx) + Math.abs(dy);
      // a few pixels are a click that slipped, not a move
      if (travelled.current > 5) {
        if (!dragged.current) {
          dragged.current = true;
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            // a pointer that is already gone: the move goes on without the capture
          }
        }
        setView((now) => held({ ...now, x: now.x + dx, y: now.y + dy }));
      }
    }
    finger.x = event.clientX;
    finger.y = event.clientY;
  };
  const up = (event: ReactPointerEvent<HTMLDivElement>) => void fingers.current.delete(event.pointerId);

  useGSAP(
    () => {
      gsap.fromTo('[data-sheet]', { autoAlpha: 0, y: 46 }, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power3.out', stagger: 0.14 });
      gsap.fromTo('[data-marks]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power1.out', delay: 0.55 });
      gsap.fromTo('[data-words]', { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.2 });
    },
    { scope: root },
  );

  const zoomed = view.scale > whole.scale * 1.01;
  const said = pointed ?? (list ? list.mark : null);

  return (
    <CloseUpFrame label="Carte d’ensemble : les lieux du récit">
      <div
        ref={root}
        className={`absolute inset-0 touch-none overflow-hidden ${zoomed ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onWheel={(event) => {
          if ((event.target as Element).closest('[data-list]')) return;
          setList(null);
          nearer(Math.exp(-event.deltaY * 0.0016), event.clientX, event.clientY);
        }}
      >
        {/* the sheets, and the Route of the career drawn over them */}
        <div className="absolute left-0 top-0 origin-top-left will-change-transform" style={{ width: WHOLE.width, height: WHOLE.height, transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
          {(Object.keys(LAID) as WholeSheet[]).map((sheet) => (
            <div key={sheet} data-sheet className="invisible absolute" style={{ left: LAID[sheet].x, top: LAID[sheet].y, width: LAID[sheet].width, height: depthOf(sheet) }}>
              <Sheet id={sheet} turn={LAID[sheet].turn} />
            </div>
          ))}
          <svg data-marks className="pointer-events-none invisible absolute left-0 top-0" width={WHOLE.width} height={WHOLE.height} viewBox={`0 0 ${WHOLE.width} ${WHOLE.height}`} aria-hidden="true">
            {spots.routes.map((route, index) => (
              <polyline
                key={index}
                points={route.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
                fill="none"
                stroke="#a8281e"
                strokeOpacity="0.5"
                strokeWidth="1.5"
                strokeDasharray="7 5"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        </div>

        {/* the marks keep their size whatever the scale */}
        <div data-marks className="invisible absolute left-0 top-0" style={{ transform: `translate(${view.x}px, ${view.y}px)` }}>
          {marks.map((mark) => {
            const several = mark.places.length > 1;
            const told = here !== null && mark.places.includes(here.place);
            return (
              <button
                key={mark.key}
                type="button"
                onClick={(event) => choose(mark, event)}
                onPointerEnter={() => setPointed(mark)}
                onPointerLeave={() => setPointed((now) => (now === mark ? null : now))}
                onFocus={() => setPointed(mark)}
                onBlur={() => setPointed((now) => (now === mark ? null : now))}
                aria-label={mark.moments === 1 ? `${mark.name} : ${mark.places[0].moments[0].what}. Aller à ce moment du récit.` : `${mark.name} : ${mark.moments} moments du récit. Choisir.`}
                aria-haspopup={mark.moments > 1 ? 'dialog' : undefined}
                className="chart-mark group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full"
                style={{ left: mark.x * view.scale, top: mark.y * view.scale }}
              >
                {told && <span className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-lamp/55 blur-[5px]" />}
                <span
                  className={`typed relative flex items-center justify-center rounded-full border-2 border-red-ink text-[0.62rem] leading-none text-red-ink shadow-[0_0_0_2px_rgb(239_229_198/0.75)] transition duration-200 group-hover:scale-125 group-hover:bg-red-ink group-hover:text-paper-light group-focus-visible:scale-125 group-focus-visible:bg-red-ink group-focus-visible:text-paper-light ${
                    several ? 'h-[22px] w-[22px] bg-paper-light/90' : 'h-4 w-4 bg-paper-light/75'
                  }`}
                >
                  {several ? mark.places.length : <span className="h-[5px] w-[5px] rounded-full bg-red-ink transition group-hover:bg-paper-light group-focus-visible:bg-paper-light" />}
                </span>
                {mark.side && <Name side={mark.side} text={mark.lettering} />}
              </button>
            );
          })}
        </div>

        {/* the words stay legible when the paper passes under them */}
        <div data-words className="pointer-events-none invisible absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-night/90 via-night/55 to-transparent" />
        <div data-words className="pointer-events-none invisible absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-night/90 via-night/50 to-transparent" />

        {/* the title, and what the visitor is pointing at */}
        <header data-words className="pointer-events-none invisible absolute left-5 top-4 max-w-[min(46rem,calc(100vw-12rem))]">
          <p className="typed text-[0.68rem] uppercase tracking-[0.24em] text-lamp/80">Carte d’ensemble</p>
          <h2 className="title-face text-[1.55rem] leading-tight text-paper-light">Les lieux du récit</h2>
          <p className="typed mt-[0.15rem] truncate text-[0.74rem] text-paper/75 low:hidden" aria-live="polite">
            {said
              ? said.moments === 1
                ? `${said.name} — ${said.places[0].moments[0].what} · ${whenTold(said.places[0].moments[0])}`
                : `${said.name} — ${said.places.length > 1 ? `${said.places.length} lieux, ` : ''}${said.moments} moments du récit`
              : here
                ? `Le récit en est à : ${here.place.name} — ${here.moment.what}`
                : 'Choisir un lieu pour aller au moment où il est raconté'}
          </p>
        </header>

        {/* places neither sheet reaches */}
        <p data-words data-tools className="typed invisible absolute bottom-4 left-5 flex flex-wrap items-center gap-x-2 text-[0.72rem] text-paper/70">
          <span>Hors de la carte :</span>
          {farPlaces().map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => goToMoment(place.moments[0].at)}
              title={`${place.moments[0].what} · ${whenTold(place.moments[0])}`}
              className="rounded-sm border border-paper/30 bg-night/60 px-2 py-[0.2rem] text-paper/90 transition hover:border-lamp hover:text-lamp"
            >
              {place.name}
            </button>
          ))}
        </p>

        <p data-words className="typed pointer-events-none invisible absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.7rem] tracking-wider text-paper/70 max-lg:hidden">
          Choisir un lieu pour y reprendre le récit · glisser pour se déplacer, molette pour s’approcher
        </p>

        <div data-words data-tools className="invisible absolute bottom-4 right-4 flex items-center gap-2">
          {zoomed && (
            <button type="button" onClick={() => step(0)} className="typed rounded-sm border border-paper/30 bg-night/70 px-3 py-[0.4rem] text-[0.7rem] uppercase tracking-[0.14em] text-paper/90 backdrop-blur-sm transition hover:border-lamp hover:text-lamp">
              Vue d’ensemble
            </button>
          )}
          <button
            type="button"
            onClick={() => step(1 / 1.7)}
            disabled={!zoomed}
            aria-label="S’éloigner"
            className="typed h-8 w-8 rounded-sm border border-paper/30 bg-night/70 text-[1rem] leading-none text-paper/90 backdrop-blur-sm transition hover:border-lamp hover:text-lamp disabled:cursor-default disabled:opacity-35 disabled:hover:border-paper/30 disabled:hover:text-paper/90"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => step(1.7)}
            disabled={view.scale >= whole.scale * CLOSEST * 0.99}
            aria-label="S’approcher"
            className="typed h-8 w-8 rounded-sm border border-paper/30 bg-night/70 text-[1rem] leading-none text-paper/90 backdrop-blur-sm transition hover:border-lamp hover:text-lamp disabled:cursor-default disabled:opacity-35 disabled:hover:border-paper/30 disabled:hover:text-paper/90"
          >
            +
          </button>
        </div>

        {list && <Moments mark={list.mark} x={list.x} y={list.y} room={size} />}
      </div>
    </CloseUpFrame>
  );
}

/** A sheet of the Chart, laid flat: its drawing is made once and kept. */
function Sheet({ id, turn }: { id: WholeSheet; turn: number }) {
  const paper = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let alive = true;
    void sheetDrawing(id).then((drawing) => {
      if (!alive || !paper.current) return;
      drawing.style.cssText = 'display:block;width:100%;height:100%';
      paper.current.replaceChildren(drawing);
    });
    return () => {
      alive = false;
    };
  }, [id]);
  return <div ref={paper} className="h-full w-full bg-[#e8dcbc] shadow-[0_18px_50px_rgb(0_0_0/0.65)]" style={{ rotate: `${turn}deg` }} />;
}

/** A mark's name, in the red capitals of the Chart's posts, on the side where there is room. */
function Name({ side, text }: { side: Side; text: string }) {
  const where = {
    right: 'left-full top-1/2 ml-1 -translate-y-1/2',
    left: 'right-full top-1/2 mr-1 -translate-y-1/2',
    below: 'left-1/2 top-full mt-1 -translate-x-1/2',
    above: 'bottom-full left-1/2 mb-1 -translate-x-1/2',
  }[side];
  return (
    <span
      className={`title-face pointer-events-none absolute whitespace-nowrap font-bold uppercase leading-none tracking-[0.04em] text-red-ink [text-shadow:0_0_2px_#efe5c6,0_0_3px_#efe5c6,0_0_5px_#efe5c6,0_0_7px_#efe5c6] ${where}`}
      style={{ fontSize: NAME_SIZE }}
    >
      {text}
    </span>
  );
}

/** The moments a mark holds, on a slip of paper beside it: one is chosen, and the Narration goes there. */
function Moments({ mark, x, y, room }: { mark: Mark; x: number; y: number; room: { width: number; height: number } }) {
  const slip = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.fromTo(slip.current, { autoAlpha: 0, scale: 0.94, rotate: -2 }, { autoAlpha: 1, scale: 1, rotate: -0.6, duration: 0.3, ease: 'back.out(1.6)' });
    slip.current?.querySelector('button')?.focus({ preventScroll: true });
  });
  // beside the mark, on the side of the picture that has the more room
  const toRight = x < room.width / 2;
  const below = y < room.height / 2;
  return (
    <div
      ref={slip}
      data-list
      role="dialog"
      aria-label={`${mark.name} : choisir un moment du récit`}
      className="invisible absolute z-10 flex w-[min(23rem,calc(100vw-2rem))] flex-col bg-paper text-ink shadow-[0_18px_50px_rgb(0_0_0/0.7)]"
      style={{
        [toRight ? 'left' : 'right']: Math.max(12, (toRight ? x : room.width - x) + 18),
        [below ? 'top' : 'bottom']: Math.max(12, (below ? y : room.height - y) - 26),
        maxHeight: `calc(100vh - ${Math.max(12, (below ? y : room.height - y) - 26) + 12}px)`,
        transformOrigin: `${toRight ? 'left' : 'right'} ${below ? 'top' : 'bottom'}`,
      }}
    >
      <header className="border-b border-ink/20 px-5 pb-2 pt-4">
        <p className="typed text-[0.64rem] uppercase tracking-[0.22em] text-red-ink">{mark.places.length > 1 ? `${mark.places.length} lieux` : 'Raconté plusieurs fois'}</p>
        <h3 className="title-face text-[1.3rem] leading-tight">{mark.name}</h3>
      </header>
      <ul className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {mark.places.map((place) => (
          <li key={place.id}>
            {mark.places.length > 1 && <p className="title-face px-3 pt-2 text-[0.82rem] font-bold uppercase tracking-[0.05em] text-red-ink">{place.name}</p>}
            {place.moments.map((moment) => (
              <button key={moment.at + moment.what} type="button" onClick={() => goToMoment(moment.at)} className="block w-full rounded-[2px] px-3 py-[0.4rem] text-left transition-colors hover:bg-red-ink/10 focus-visible:bg-red-ink/10">
                <span className="block text-[1.02rem] leading-snug">{moment.what}</span>
                <span className="typed block text-[0.68rem] text-ink-soft">{whenTold(moment)}</span>
              </button>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
