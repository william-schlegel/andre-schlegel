import { SRGBColorSpace, TextureLoader, type Texture } from 'three';

/**
 * Pictures loaded on demand, without suspending React: the 3D book asks for a Spread every
 * frame and gets it once it has arrived (until then, a smaller version or plain paper).
 */

const loader = new TextureLoader();
const loaded = new Map<string, Texture>();
const loading = new Set<string>();
const failed = new Set<string>();

/** The texture if it is there; otherwise starts fetching it and returns null. */
export function textureNow(url: string): Texture | null {
  const texture = loaded.get(url);
  if (texture) return texture;
  if (!loading.has(url) && !failed.has(url)) {
    loading.add(url);
    loader.load(
      url,
      (result) => {
        result.colorSpace = SRGBColorSpace;
        result.anisotropy = 8;
        loaded.set(url, result);
        loading.delete(url);
      },
      undefined,
      () => {
        loading.delete(url);
        failed.add(url);
      },
    );
  }
  return null;
}

export function preloadTexture(url: string): void {
  textureNow(url);
}

let fontsReady: Promise<void> | null = null;

/** Resolves when the site's three faces can be drawn on a canvas. */
export function whenFontsReady(): Promise<void> {
  if (!fontsReady) {
    const faces = ['700 32px "Old Standard TT"', '400 32px "Old Standard TT"', 'italic 400 32px "Old Standard TT"', '400 32px "Special Elite"', '400 32px "EB Garamond Variable"'];
    fontsReady = Promise.all(faces.map((face) => document.fonts.load(face).catch(() => [])))
      .then(() => document.fonts.ready)
      .then(() => undefined);
  }
  return fontsReady;
}
