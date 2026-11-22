"""Turn the scans of a Carnet de vol into the Spreads the site shows.

The Dossier holds each double page as a JPG, a PDF wrapping one scan, or both, spread over
the folders of the bases. This gathers the scans of one Carnet, puts them in the order of
their numbers, and writes for each Spread a web picture and a small one for the 3D book.

Output: public/media/carnets/<carnet>/<nn>.webp, <nn>_s.webp and src/journey/content/generated/carnet-<carnet>.json

Usage: .work/venv/bin/python pipeline/carnets.py 1938
"""

from __future__ import annotations

import io
import json
import re
import sys
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
DOSSIER = Path.home() / "dev" / "Dossier Carrière Militaire et Aéronautique Cdt André Schlegel"
SOURCES = DOSSIER / "Sources photos vidéos"

# The scan series that make up each Carnet, in the order of the book.
CARNETS: dict[str, list[str]] = {
    "1938": [r"CDV_AS_(?:19)?38_40_0*(\d+)"],
    "1940": [
        r"CDV_AS_(?:19)?40_44_0*(\d+)",
        r"CDV_AS_5_11_43_01_44_0*(\d+)",
        r"CDV_AS_02_44_04_44_0*(\d+)",
        r"CDV_AS_03_44_0*(\d+)",
        r"CDV_AS_06_44_07_44_0*(\d+)",
    ],
    "1947": [r"CDV_AS_04_47_04_48_0*(\d+)"],
}

# Scans made on a bed larger than the open book: only this share of their height, from the top, is the Spread.
TRIM: dict[str, float] = {
    "CDV_AS_04_47_04_48_000002": 0.543,
    "CDV_AS_04_47_04_48_0014": 0.543,
}

LARGE = 2200  # widest side of a Spread, in pixels
SMALL = 1024  # the same for the book lying on the table


def scan_image(path: Path) -> Image.Image:
    if path.suffix.lower() == ".pdf":
        reader = PdfReader(str(path))
        images = [im for page in reader.pages for im in page.images]
        if not images:
            raise ValueError(f"no scan inside {path}")
        biggest = max(images, key=lambda im: len(im.data))
        return Image.open(io.BytesIO(biggest.data)).convert("RGB")
    return Image.open(path).convert("RGB")


def gather(carnet: str) -> list[tuple[int, int, Path]]:
    found: dict[tuple[int, int], Path] = {}
    for path in SOURCES.rglob("CDV_AS_*"):
        if path.suffix.lower() not in (".jpg", ".jpeg", ".pdf"):
            continue
        for series, pattern in enumerate(CARNETS[carnet]):
            match = re.fullmatch(pattern, path.stem)
            if not match:
                continue
            key = (series, int(match.group(1)))
            current = found.get(key)
            # prefer the JPG when both exist: it is the scan itself
            if current is None or (current.suffix.lower() == ".pdf" and path.suffix.lower() != ".pdf"):
                found[key] = path
    return [(series, number, path) for (series, number), path in sorted(found.items())]


def main() -> None:
    carnet = sys.argv[1]
    out_dir = ROOT / "public" / "media" / "carnets" / carnet
    out_dir.mkdir(parents=True, exist_ok=True)
    spreads = []
    for index, (series, number, path) in enumerate(gather(carnet), start=1):
        image = scan_image(path)
        if path.stem in TRIM:
            image = image.crop((0, 0, image.width, round(image.height * TRIM[path.stem])))
        name = f"{index:02d}"
        large = image.copy()
        large.thumbnail((LARGE, LARGE), Image.LANCZOS)
        large.save(out_dir / f"{name}.webp", quality=74, method=6)
        small = image.copy()
        small.thumbnail((SMALL, SMALL), Image.LANCZOS)
        small.save(out_dir / f"{name}_s.webp", quality=70, method=6)
        spreads.append(
            {
                "index": index,
                "scan": path.stem,
                "folder": str(path.parent.relative_to(SOURCES)),
                "width": large.width,
                "height": large.height,
            }
        )
        print(f"{name}  {path.stem:28s} {image.width}x{image.height}  {path.parent.relative_to(SOURCES)}")
    data_dir = ROOT / "src" / "journey" / "content" / "generated"
    data_dir.mkdir(parents=True, exist_ok=True)
    (data_dir / f"carnet-{carnet}.json").write_text(json.dumps(spreads, ensure_ascii=False, indent=1))
    print(f"{len(spreads)} spreads -> {out_dir}")


if __name__ == "__main__":
    main()
