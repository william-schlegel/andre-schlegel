"""Trace every picture of the pptx back to its original in the Dossier.

For each picture file inside the pptx, finds the file of the Dossier that shows the same
picture (the pptx often holds a reduced or cropped copy), so the site can use the best
original and name its source. Carnet scans are recognised as Spreads.

Output: .work/media_index.json   { "image13.jpg": {"width":…, "height":…, "source": "…", "distance": n, "carnet": "1938", "spread": 7}, … }

Usage: .work/venv/bin/python pipeline/match_media.py
"""

from __future__ import annotations

import io
import json
import re
from pathlib import Path

import imagehash
from PIL import Image
from pypdf import PdfReader

from carnets import CARNETS, SOURCES, gather

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / ".work" / "pptx" / "ppt" / "media"
CACHE = ROOT / ".work" / "dossier_hashes.json"
OUT = ROOT / ".work" / "media_index.json"

Image.MAX_IMAGE_PIXELS = None
PICTURES = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp", ".tif", ".tiff"}


def open_any(path: Path) -> Image.Image | None:
    try:
        if path.suffix.lower() == ".pdf":
            reader = PdfReader(str(path))
            if len(reader.pages) != 1:
                return None
            images = list(reader.pages[0].images)
            if len(images) != 1:
                return None
            return Image.open(io.BytesIO(images[0].data)).convert("RGB")
        if path.suffix.lower() in PICTURES:
            return Image.open(path).convert("RGB")
    except Exception as error:  # unreadable file: skip it, say so
        print(f"  skipped {path.name}: {error}")
    return None


def fingerprint(image: Image.Image) -> dict:
    return {
        "p": str(imagehash.phash(image, hash_size=16)),
        "d": str(imagehash.dhash(image, hash_size=16)),
        "w": image.width,
        "h": image.height,
    }


def dossier_index() -> dict[str, dict]:
    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}
    changed = False
    for path in sorted(SOURCES.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in PICTURES | {".pdf"}:
            continue
        key = str(path.relative_to(SOURCES))
        if key in cache:
            continue
        image = open_any(path)
        cache[key] = fingerprint(image) if image is not None else None
        changed = True
    if changed:
        CACHE.write_text(json.dumps(cache, ensure_ascii=False))
    return {k: v for k, v in cache.items() if v}


def distance(a: dict, b: dict) -> int:
    return (imagehash.hex_to_hash(a["p"]) - imagehash.hex_to_hash(b["p"])) + (
        imagehash.hex_to_hash(a["d"]) - imagehash.hex_to_hash(b["d"])
    )


def main() -> None:
    index = dossier_index()
    spreads = {}
    for carnet in CARNETS:
        for number, (_, _, path) in enumerate(gather(carnet), start=1):
            spreads[path.stem] = (carnet, number)

    out = {}
    for path in sorted(MEDIA.iterdir(), key=lambda p: int(re.findall(r"\d+", p.name)[0])):
        image = open_any(path)
        if image is None:
            continue
        mine = fingerprint(image)
        ranked = sorted(((distance(mine, other), key) for key, other in index.items()), key=lambda r: r[0])
        best_distance, best = ranked[0]
        entry = {"width": image.width, "height": image.height}
        # 512 bits compared; the same picture reduced or recompressed stays well under 60
        if best_distance <= 60:
            # among equally good matches, take the largest file
            same = [key for d, key in ranked if d <= best_distance + 8]
            best = max(same, key=lambda key: index[key]["w"] * index[key]["h"])
            entry.update(
                {
                    "source": best,
                    "distance": best_distance,
                    "source_width": index[best]["w"],
                    "source_height": index[best]["h"],
                }
            )
            stem = Path(best).stem
            if stem in spreads:
                entry["carnet"], entry["spread"] = spreads[stem]
        else:
            entry["nearest"] = best
            entry["distance"] = best_distance
        out[path.name] = entry
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1))
    traced = sum(1 for e in out.values() if "source" in e)
    print(f"{traced} of {len(out)} pptx pictures traced to the Dossier -> {OUT}")


if __name__ == "__main__":
    main()
