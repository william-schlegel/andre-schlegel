"""Make the prints of a Chapter: the photographs and documents Eric shows, as web pictures.

Reads pipeline/prints/<chapter>.json, a list of
  { "id": "...", "from": "pptx:image5.jpg" }                      a picture file of the pptx (they are the originals)
  { "id": "...", "from": "dossier:<path under Sources photos vidéos>" }
  { "id": "...", "from": "scan:<path of a PDF wrapping one scan>" }
  { "id": "...", "from": "film:146", "box": [x, y, w, h] }        cut from a Film frame, when the Dossier has no original
  optional "crop": [x, y, w, h] (fractions of the source) and "max": widest side in pixels.

Output: public/media/<chapter>/<id>.webp and src/journey/content/generated/prints-<chapter>.json (pixel sizes).

Usage: .work/venv/bin/python pipeline/prints.py <chapter>
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

from carnets import SOURCES
from find_in_dossier import frame

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / ".work" / "pptx" / "ppt" / "media"
Image.MAX_IMAGE_PIXELS = None


def load(entry: dict) -> Image.Image:
    kind, _, ref = entry["from"].partition(":")
    if kind == "pptx":
        image = Image.open(MEDIA / ref)
    elif kind == "dossier":
        image = Image.open(SOURCES / ref)
    elif kind == "scan":
        # a PDF of the Dossier that wraps one scan
        from carnets import scan_image
        image = scan_image(SOURCES / ref)
    elif kind == "film":
        image = frame(float(ref))
        x, y, w, h = entry["box"]
        image = image.crop((round(x * image.width), round(y * image.height), round((x + w) * image.width), round((y + h) * image.height)))
    else:
        raise ValueError(f"unknown source {entry['from']}")
    if image.mode in ("P", "LA", "RGBA"):
        # documents and photos have no transparency of their own: lay them on white
        rgba = image.convert("RGBA")
        white = Image.new("RGBA", rgba.size, "white")
        image = Image.alpha_composite(white, rgba)
    image = image.convert("RGB")
    if "crop" in entry:
        x, y, w, h = entry["crop"]
        image = image.crop((round(x * image.width), round(y * image.height), round((x + w) * image.width), round((y + h) * image.height)))
    return image


def main() -> None:
    chapter = sys.argv[1]
    manifest = json.loads((ROOT / "pipeline" / "prints" / f"{chapter}.json").read_text())
    out_dir = ROOT / "public" / "media" / chapter
    out_dir.mkdir(parents=True, exist_ok=True)
    sizes = {}
    for entry in manifest:
        image = load(entry)
        limit = entry.get("max", 2000)
        image.thumbnail((limit, limit), Image.LANCZOS)
        target = out_dir / f"{entry['id']}.webp"
        image.save(target, quality=82, method=6)
        sizes[entry["id"]] = [image.width, image.height]
        print(f"{entry['id']:34s} {image.width}x{image.height}  {target.stat().st_size // 1024} KB  <- {entry['from']}")
    generated = ROOT / "src" / "journey" / "content" / "generated"
    generated.mkdir(parents=True, exist_ok=True)
    (generated / f"prints-{chapter}.json").write_text(json.dumps(sizes, indent=1) + "\n")


if __name__ == "__main__":
    main()
