import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three';

/**
 * The surfaces of the table, drawn once at start-up rather than downloaded: wood, the leather
 * of the desk pad, paper, and the soft shadow that anything lying on the table casts.
 */

const cache = new Map<string, Texture>();

function once(key: string, make: () => Texture): Texture {
  let texture = cache.get(key);
  if (!texture) {
    texture = make();
    cache.set(key, texture);
  }
  return texture;
}

/** A small repeatable pseudo-random generator, so the table looks the same on every visit. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const element = document.createElement('canvas');
  element.width = width;
  element.height = height;
  return [element, element.getContext('2d')!];
}

function finish(element: HTMLCanvasElement, repeat?: [number, number]): CanvasTexture {
  const texture = new CanvasTexture(element);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  if (repeat) {
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(repeat[0], repeat[1]);
  }
  return texture;
}

/** Speckle a canvas with fine grain. */
function grain(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number, random: () => number): void {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const shift = (random() - 0.5) * amount;
    data[i] += shift;
    data[i + 1] += shift;
    data[i + 2] += shift;
  }
  ctx.putImageData(image, 0, 0);
}

/** A table top: boards laid side by side, each with its own tint and long streaks of grain. */
export function woodTexture(tone: 'walnut' | 'oak' = 'walnut'): Texture {
  return once(`wood-${tone}`, () => {
    const size = 2048;
    const boards = 8;
    const [element, ctx] = canvas(size, size);
    const random = seeded(tone === 'walnut' ? 11 : 23);
    const base = tone === 'walnut' ? [52, 34, 22] : [146, 112, 74];
    const board = size / boards;
    for (let index = 0; index < boards; index++) {
      const top = index * board;
      // no two boards come from the same tree
      const shift = (random() - 0.5) * (tone === 'walnut' ? 10 : 16);
      ctx.fillStyle = `rgb(${base.map((channel) => Math.round(channel + shift)).join(',')})`;
      ctx.fillRect(0, top, size, board);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, top, size, board);
      ctx.clip();
      for (let i = 0; i < 230; i++) {
        const y = top + random() * board;
        const length = 300 + random() * 1700;
        const x = random() * size - length / 2;
        const light = random() > 0.55;
        const alpha = (tone === 'walnut' ? 0.05 : 0.035) + random() * (tone === 'walnut' ? 0.09 : 0.05);
        ctx.strokeStyle = light ? `rgba(255, 226, 180, ${alpha * 0.7})` : `rgba(40, 22, 6, ${alpha})`;
        ctx.lineWidth = 0.6 + random() * 1.8;
        const wobble = 1.5 + random() * 5;
        const phase = random() * 6.28;
        const pace = 0.25 + random() * 0.4;
        // drawn again one tile to the left and right, so the grain crosses the tile's edge unbroken
        for (const wrap of [-size, 0, size]) {
          ctx.beginPath();
          for (let step = 0; step <= 24; step++) {
            const px = x + wrap + (length * step) / 24;
            const py = y + Math.sin(phase + step * pace) * wobble;
            if (step === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      }
      ctx.restore();
      // the joint between two boards
      ctx.fillStyle = tone === 'walnut' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(40, 24, 8, 0.42)';
      ctx.fillRect(0, top, size, 2);
      ctx.fillStyle = 'rgba(255, 235, 200, 0.07)';
      ctx.fillRect(0, top + 2, size, 2);
    }
    grain(ctx, size, size, 10, random);
    // the tile covers 1.6 m of table: boards 20 cm wide
    return finish(element, [9 / 1.6, 6 / 1.6]);
  });
}

/** The desk pad: dark green leather with a tooled gilt line near its edge. */
export function deskPadTexture(): Texture {
  return once('desk-pad', () => {
    const width = 2048;
    const height = 1280;
    const [element, ctx] = canvas(width, height);
    const random = seeded(7);
    ctx.fillStyle = '#1d2a22';
    ctx.fillRect(0, 0, width, height);
    // the pebbled surface of leather
    for (let i = 0; i < 26000; i++) {
      const x = random() * width;
      const y = random() * height;
      const radius = 1 + random() * 3.2;
      ctx.fillStyle = random() > 0.5 ? `rgba(255,255,235,${0.012 + random() * 0.02})` : `rgba(0,0,0,${0.03 + random() * 0.05})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 6.2832);
      ctx.fill();
    }
    // wear: lighter where hands and papers have rubbed
    const wear = ctx.createRadialGradient(width / 2, height * 0.55, 80, width / 2, height * 0.55, width * 0.55);
    wear.addColorStop(0, 'rgba(120, 140, 110, 0.10)');
    wear.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
    ctx.fillStyle = wear;
    ctx.fillRect(0, 0, width, height);
    // gilt tooling: a double line with corner ornaments
    const inset = 46;
    ctx.strokeStyle = 'rgba(190, 158, 92, 0.75)';
    ctx.lineWidth = 3;
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(190, 158, 92, 0.55)';
    ctx.strokeRect(inset + 12, inset + 12, width - (inset + 12) * 2, height - (inset + 12) * 2);
    for (const [cx, cy] of [
      [inset + 6, inset + 6],
      [width - inset - 6, inset + 6],
      [inset + 6, height - inset - 6],
      [width - inset - 6, height - inset - 6],
    ]) {
      ctx.fillStyle = 'rgba(190, 158, 92, 0.8)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 13);
      ctx.lineTo(cx + 13, cy);
      ctx.lineTo(cx, cy + 13);
      ctx.lineTo(cx - 13, cy);
      ctx.closePath();
      ctx.fill();
    }
    grain(ctx, width, height, 9, random);
    return finish(element);
  });
}

/** Plain paper of the period: cream, slightly mottled, darker towards the edges. */
export function paperTexture(tone: 'cream' | 'white' | 'card' = 'cream'): Texture {
  return once(`paper-${tone}`, () => {
    const size = 512;
    const [element, ctx] = canvas(size, size);
    const random = seeded(tone.length * 31);
    ctx.fillStyle = tone === 'cream' ? '#e9dfc2' : tone === 'white' ? '#f3efe4' : '#d9c9a0';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 420; i++) {
      const x = random() * size;
      const y = random() * size;
      const radius = 6 + random() * 40;
      const blot = ctx.createRadialGradient(x, y, 0, x, y, radius);
      blot.addColorStop(0, random() > 0.5 ? 'rgba(120, 90, 40, 0.035)' : 'rgba(255, 255, 255, 0.05)');
      blot.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = blot;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    const edge = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.75);
    edge.addColorStop(0, 'rgba(0,0,0,0)');
    edge.addColorStop(1, 'rgba(110, 80, 30, 0.16)');
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, size, size);
    grain(ctx, size, size, 10, random);
    return finish(element);
  });
}

/** The edge of a block of pages: fine lines. */
export function pageEdgeTexture(): Texture {
  return once('page-edge', () => {
    const [element, ctx] = canvas(64, 64);
    const random = seeded(3);
    ctx.fillStyle = '#d8cba6';
    ctx.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 2) {
      ctx.fillStyle = `rgba(90, 70, 40, ${0.1 + random() * 0.25})`;
      ctx.fillRect(0, y, 64, 1);
    }
    return finish(element, [1, 1]);
  });
}

/** The soft shadow under something lying on the table: a blurred rounded rectangle. */
export function contactShadowTexture(): Texture {
  return once('contact-shadow', () => {
    const size = 256;
    const [element, ctx] = canvas(size, size);
    // draw the rectangle off-canvas and keep only its blurred shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 1)';
    ctx.shadowBlur = 34;
    ctx.shadowOffsetX = size * 2;
    ctx.fillStyle = '#000';
    ctx.fillRect(-size * 2 + 48, 48, size - 96, size - 96);
    const texture = new CanvasTexture(element);
    return texture;
  });
}

/** A round soft spot, for glints and inked dots. */
export function glowTexture(): Texture {
  return once('glow', () => {
    const size = 128;
    const [element, ctx] = canvas(size, size);
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.35)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new CanvasTexture(element);
  });
}
