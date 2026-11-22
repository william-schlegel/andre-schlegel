// Prepares the coastlines and borders the Chart is drawn from.
//
//   node pipeline/chart.mjs
//
// Reads Natural Earth's 1:10m countries (the world-atlas package), keeps the part of the world
// the Journey crosses (from the Sahara's edge to Scotland, from the Atlantic to Saxony),
// simplifies the outlines to what a chart of that scale can show, and writes
// src/journey/content/generated/chart-land.json.
//
// The flight of 1946 to Buenos Aires needs both shores of the Atlantic, at a far smaller scale:
// they are taken from the 1:50m countries and written to chart-monde.json.

import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';

const LANDS = [
  // tolerance in degrees: under two kilometres
  { source: 'countries-10m.json', box: { west: -12, south: 31, east: 19, north: 59.5 }, tolerance: 0.018, out: 'chart-land.json' },
  { source: 'countries-50m.json', box: { west: -84, south: -56, east: 32, north: 62 }, tolerance: 0.11, out: 'chart-monde.json' },
];

// Douglas–Peucker, on a closed ring
function simplify(ring, tolerance) {
  const keep = new Uint8Array(ring.length);
  keep[0] = keep[ring.length - 1] = 1;
  const stack = [[0, ring.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    const [ax, ay] = ring[first];
    const [bx, by] = ring[last];
    const dx = bx - ax, dy = by - ay;
    const length = Math.hypot(dx, dy);
    let worst = -1, index = -1;
    for (let i = first + 1; i < last; i++) {
      const [px, py] = ring[i];
      const distance = length === 0 ? Math.hypot(px - ax, py - ay) : Math.abs(dy * px - dx * py + bx * ay - by * ax) / length;
      if (distance > worst) {
        worst = distance;
        index = i;
      }
    }
    if (worst > tolerance) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return ring.filter((_, i) => keep[i]).map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
}

for (const { source, box, tolerance, out: name } of LANDS) {
  const world = JSON.parse(readFileSync(new URL(`../node_modules/world-atlas/${source}`, import.meta.url), 'utf8'));
  const countries = feature(world, world.objects.countries).features;

  const inBox = (ring) => {
    let west = Infinity, east = -Infinity, south = Infinity, north = -Infinity;
    for (const [x, y] of ring) {
      if (x < west) west = x;
      if (x > east) east = x;
      if (y < south) south = y;
      if (y > north) north = y;
    }
    return east >= box.west && west <= box.east && north >= box.south && south <= box.north;
  };

  const lands = [];
  for (const country of countries) {
    const polygons = country.geometry.type === 'Polygon' ? [country.geometry.coordinates] : country.geometry.coordinates;
    const kept = [];
    for (const polygon of polygons) {
      if (!inBox(polygon[0])) continue;
      const rings = polygon.map((ring) => simplify(ring, tolerance)).filter((ring) => ring.length >= 4);
      if (rings.length) kept.push(rings);
    }
    if (kept.length) lands.push({ name: country.properties.name, polygons: kept });
  }

  const out = new URL(`../src/journey/content/generated/${name}`, import.meta.url);
  writeFileSync(out, JSON.stringify(lands));
  const points = lands.reduce((sum, land) => sum + land.polygons.reduce((s, p) => s + p.reduce((t, r) => t + r.length, 0), 0), 0);
  console.log(`${lands.length} countries, ${points} points → ${out.pathname}`);
  console.log(lands.map((land) => land.name).join(', '));
}
