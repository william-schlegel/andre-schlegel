"""Small grey thumbnails of every picture of the Dossier, for looking up a Film frame by resemblance.

Output: .work/dossier_thumbs.npz
"""
from __future__ import annotations

import io
from pathlib import Path

import numpy as np
from PIL import Image
from pypdf import PdfReader

from carnets import SOURCES

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / ".work" / "dossier_thumbs.npz"
SIZE = 32
PICTURES = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp", ".tif", ".tiff"}
Image.MAX_IMAGE_PIXELS = None


def thumb(image: Image.Image) -> np.ndarray:
    grey = np.asarray(image.convert("L").resize((SIZE, SIZE), Image.BILINEAR), dtype=np.float32)
    grey -= grey.mean()
    norm = np.linalg.norm(grey)
    return grey / norm if norm else grey


def pictures(path: Path):
    suffix = path.suffix.lower()
    if suffix in PICTURES:
        yield "", Image.open(path).convert("RGB")
    elif suffix == ".pdf":
        reader = PdfReader(str(path))
        for number, page in enumerate(reader.pages, start=1):
            for image in page.images:
                try:
                    yield f"#p{number}", Image.open(io.BytesIO(image.data)).convert("RGB")
                except Exception:
                    continue


def main() -> None:
    names, thumbs, sizes = [], [], []
    for path in sorted(SOURCES.parent.rglob("*")):
        if not path.is_file():
            continue
        try:
            for suffix, image in pictures(path):
                names.append(str(path.relative_to(SOURCES.parent)) + suffix)
                thumbs.append(thumb(image))
                sizes.append((image.width, image.height))
        except Exception as error:
            print(f"skipped {path.name}: {error}")
    np.savez_compressed(OUT, names=np.array(names), thumbs=np.stack(thumbs), sizes=np.array(sizes))
    print(f"{len(names)} pictures -> {OUT}")


if __name__ == "__main__":
    main()
