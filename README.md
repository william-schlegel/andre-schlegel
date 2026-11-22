# André Schlegel — le parcours

Le site raconte la carrière militaire et aéronautique du commandant André Schlegel (1935–1962),
avec la voix d'Éric Lemoine, son petit-fils, ses carnets de vol et les documents du dossier familial.

- `CONTEXT.md` — the vocabulary of the project (Journey, Chapter, Scene, Companion, Chart…).
- `docs/adr/` — the decisions that are not obvious from the code.
- `src/journey/` — the Journey itself (one React app mounted by `src/pages/index.astro`).
- `pipeline/` — scripts that derive the site's media and timings from the Dossier and the Film (V4).
  They need the Dossier on the machine; their intermediates go to `.work/` (not committed).
  What the site needs is committed under `public/media/` and `src/journey/content/generated/`.

```sh
npm install
npm run dev      # the site on http://localhost:4321
npm test         # timing logic
npm run build
```
