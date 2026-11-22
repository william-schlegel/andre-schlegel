"""Cut the three decorations out of their photographs, so they can lie on the table.

The Dossier holds one photograph of each decoration, on a plain background. The background is
removed from the outside in (anything of the background's colour that touches the border).

Output: public/media/ouverture/<decoration>.webp (with transparency)

Usage: .work/venv/bin/python pipeline/decorations.py
"""

from pathlib import Path

import cv2
import numpy as np
from PIL import Image

from carnets import SOURCES

ROOT = Path(__file__).resolve().parent.parent
FOLDER = SOURCES / "4_Angleterre 1943-1945/5_Elvington_Squadron 347 Tunisie/Photos source internet ou archives/Missions"
OUT = ROOT / "public" / "media" / "ouverture"

# name, file, tolerance (how far from the background colour still counts as background), crop (x, y, w, h)
DECORATIONS = [
    ("legion-honneur", "Légion d'Honneur.jpeg", 26, (0.18, 0.05, 0.62, 0.93)),
    ("croix-de-guerre", "french-croix-de-guerre-with-palm_24764_pic1_size3.jpg", 16, (0.0, 0.0, 1.0, 1.0)),
    ("dfc", "DFC.jpg", 30, (0.0, 0.0, 1.0, 1.0)),
]
HEIGHT = 900


def cut_out(path: Path, tolerance: int, crop: tuple[float, float, float, float]) -> Image.Image:
    image = Image.open(path).convert("RGB")
    x, y, w, h = crop
    image = image.crop((int(x * image.width), int(y * image.height), int((x + w) * image.width), int((y + h) * image.height)))
    image.thumbnail((HEIGHT * 2, HEIGHT), Image.LANCZOS)
    rgb = np.asarray(image)
    blurred = cv2.GaussianBlur(rgb, (0, 0), 1.2)
    height, width = blurred.shape[:2]
    background = np.zeros((height + 2, width + 2), np.uint8)
    flags = 4 | cv2.FLOODFILL_MASK_ONLY | cv2.FLOODFILL_FIXED_RANGE | (255 << 8)
    step = max(4, width // 60)
    seeds = [(px, py) for px in range(0, width, step) for py in (0, height - 1)] + [(px, py) for py in range(0, height, step) for px in (0, width - 1)]
    # the background colour is the commonest border colour; only seeds of that colour count
    border = np.array([blurred[py, px] for px, py in seeds], dtype=np.int32)
    typical = np.median(border, axis=0)
    for (px, py), colour in zip(seeds, border):
        if np.abs(colour - typical).max() > tolerance:
            continue
        if background[py + 1, px + 1]:
            continue
        cv2.floodFill(blurred, background, (px, py), 0, (tolerance,) * 3, (tolerance,) * 3, flags)
    outside = background[1:-1, 1:-1] > 0
    # holes (inside a wreath, a ring) show the background too without touching the border
    near = (np.abs(blurred.astype(np.int32) - typical).max(axis=2) < tolerance * 0.55).astype(np.uint8)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(near, 8)
    for label in range(1, count):
        if stats[label, cv2.CC_STAT_AREA] > 0.0008 * near.size:
            outside |= labels == label
    alpha = np.where(outside, 0, 255).astype(np.uint8)
    # drop specks, then soften the edge by a pixel so the cut does not look scissored
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    count, labels, stats, _ = cv2.connectedComponentsWithStats(alpha, 8)
    keep = np.zeros_like(alpha)
    for label in range(1, count):
        if stats[label, cv2.CC_STAT_AREA] > 0.002 * alpha.size:
            keep[labels == label] = 255
    keep = cv2.erode(keep, np.ones((3, 3), np.uint8))
    keep = cv2.GaussianBlur(keep, (0, 0), 1.0)
    ys, xs = np.nonzero(keep > 20)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    return Image.fromarray(np.dstack([rgb, keep])).crop(box)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, file, tolerance, crop in DECORATIONS:
        image = cut_out(FOLDER / file, tolerance, crop)
        image.save(OUT / f"{name}.webp", quality=88, method=6)
        print(f"{name}: {image.width}x{image.height}")
        check = Image.new("RGBA", image.size, (40, 90, 60, 255))
        check.alpha_composite(image)
        check.convert("RGB").save(ROOT / ".work" / "stills" / f"deco_{name}.jpg", quality=85)


if __name__ == "__main__":
    main()
