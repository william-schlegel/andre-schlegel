"""Find which picture of the Dossier a part of a Film frame shows.

Usage: .work/venv/bin/python pipeline/find_in_dossier.py <seconds> <x> <y> <w> <h>
       (the box is given in slide coordinates, 0..1, as printed by detect_changes.py)
"""

from __future__ import annotations

import io
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

from detect_changes import FILM
from thumbs import OUT as THUMBS, thumb

ROOT = Path(__file__).resolve().parent.parent


def frame(seconds: float) -> Image.Image:
    data = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", str(seconds), "-i", str(FILM), "-frames:v", "1", "-vf", "crop=1620:1080:150:0", "-f", "image2pipe", "-vcodec", "png", "-"],
        capture_output=True,
        check=True,
    ).stdout
    return Image.open(io.BytesIO(data)).convert("RGB")


def lookup(crop: Image.Image, top: int = 5) -> list[tuple[float, str, tuple[int, int]]]:
    index = np.load(THUMBS)
    names, thumbs, sizes = index["names"], index["thumbs"], index["sizes"]
    flat = thumbs.reshape(len(thumbs), -1)
    best = np.full(len(names), -1.0)
    # the box is never exact: try it slightly shrunk and shifted
    w, h = crop.size
    for inset in (0.0, 0.03, 0.06):
        for dx in (-0.02, 0, 0.02):
            for dy in (-0.02, 0, 0.02):
                box = (int((inset + dx) * w), int((inset + dy) * h), int((1 - inset + dx) * w), int((1 - inset + dy) * h))
                score = flat @ thumb(crop.crop(box)).reshape(-1)
                best = np.maximum(best, score)
    order = np.argsort(-best)[:top]
    return [(float(best[i]), str(names[i]), (int(sizes[i][0]), int(sizes[i][1]))) for i in order]


def main() -> None:
    seconds, x, y, w, h = (float(v) for v in sys.argv[1:6])
    image = frame(seconds)
    crop = image.crop((int(x * image.width), int(y * image.height), int((x + w) * image.width), int((y + h) * image.height)))
    crop.save(ROOT / ".work" / "stills" / "crop.jpg")
    for score, name, size in lookup(crop):
        print(f"{score:5.2f}  {name}  {size[0]}x{size[1]}")


if __name__ == "__main__":
    main()
