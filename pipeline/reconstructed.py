"""Draw the Reconstructed Spreads of the Carnet of 1940: October 1944 to March 1945.

The scans of the Carnet stop at the end of September 1944. For the months that follow, the
site shows double pages drawn in the Carnet's manner, one a month, filled from the Missions
list (src/journey/content/missions.json) and from nothing else: the date, the aircraft, the
target and what happened. What the list does not give — the crew of the day, the height, the
time in the air, the month's totals — is left blank. Each page is stamped as a reconstruction.

Output: public/media/carnets/1940/<nn>.webp and <nn>_s.webp, numbered after the last scan, and
src/journey/content/generated/carnet-1940-reconstructed.json

Usage: .work/venv/bin/python pipeline/reconstructed.py
"""

from __future__ import annotations

import json
import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
GENERATED = ROOT / "src" / "journey" / "content" / "generated"
OUT = ROOT / "public" / "media" / "carnets" / "1940"
FONTS = ROOT / "node_modules" / "@fontsource"

W, H = 2200, 1650
SMALL = 1024

MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]

# the columns of a Spread, as on the scans (fractions of the width)
LEFT = [0.064, 0.139, 0.229, 0.418, 0.512]  # DATE | FONCTION | GRADE, NOM | TYPE
RIGHT = [0.522, 0.573, 0.643, 0.694, 0.858, 0.967]  # ALTITUDE | DISTANCE | DURÉE | NATURE | OBSERVATIONS
TOP, HEAD, BOTTOM = 0.031, 0.153, 0.94
ROWS = 16

INK = (38, 44, 78)
RED = (176, 44, 40)
PRINT = (52, 46, 40)


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    files = {
        "head": FONTS / "old-standard-tt" / "files" / "old-standard-tt-latin-700-normal.woff",
        "body": FONTS / "old-standard-tt" / "files" / "old-standard-tt-latin-400-normal.woff",
        "typed": FONTS / "special-elite" / "files" / "special-elite-latin-400-normal.woff",
        "hand": Path("/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf"),
    }
    return ImageFont.truetype(str(files[name]), size)


def paper(seed: int) -> Image.Image:
    """Two pages of an old ruled book: cream, a little foxed, darker at the fold and at the edges."""
    rng = random.Random(seed)
    base = Image.new("RGB", (W, H), (238, 229, 204))
    # grain
    grain = Image.effect_noise((W, H), 9).convert("L")
    base = ImageChops.multiply(base, Image.merge("RGB", [grain.point(lambda v: 232 + (v - 128) // 3)] * 3))
    # foxing
    spots = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(spots)
    for _ in range(46):
        x, y, r = rng.randrange(W), rng.randrange(H), rng.randrange(40, 240)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=rng.randrange(8, 26))
    spots = spots.filter(ImageFilter.GaussianBlur(70))
    base = Image.composite(Image.new("RGB", (W, H), (196, 170, 120)), base, spots)
    # the fold, and the edges of the leaves
    shade = Image.new("L", (W, H), 0)
    pixels = shade.load()
    fold = W * 0.517
    for x in range(W):
        near = math.exp(-((x - fold) / 26) ** 2) * 120 + math.exp(-((x - fold) / 110) ** 2) * 46
        edge = max(0.0, 1 - x / 70) * 150 + max(0.0, 1 - (W - x) / 50) * 90
        value = int(min(255, near + edge))
        if value:
            for y in range(H):
                pixels[x, y] = value
    below = Image.new("L", (W, H), 0)
    ImageDraw.Draw(below).rectangle([0, H - 44, W, H], fill=120)
    shade = ImageChops.lighter(shade, below.filter(ImageFilter.GaussianBlur(22)))
    return Image.composite(Image.new("RGB", (W, H), (70, 52, 34)), base, shade)


def centred(draw: ImageDraw.ImageDraw, lines: list[tuple[str, ImageFont.FreeTypeFont]], x0: float, x1: float, y: float, gap: int) -> None:
    total = sum(f.size for _, f in lines) + gap * (len(lines) - 1)
    top = y - total / 2
    for text, face in lines:
        width = draw.textlength(text, font=face)
        draw.text(((x0 + x1) / 2 - width / 2, top), text, font=face, fill=PRINT)
        top += face.size + gap


def form(image: Image.Image) -> None:
    """The printed form: the frame, the columns and their headings, the dotted lines."""
    draw = ImageDraw.Draw(image)
    top, head, bottom = TOP * H, HEAD * H, BOTTOM * H
    big, small, tiny = font("head", 30), font("body", 27), font("head", 22)
    for columns in (LEFT, RIGHT):
        x0, x1 = columns[0] * W, columns[-1] * W
        draw.line([x0, top, x1, top], fill=PRINT, width=7)
        draw.line([x0, top + 12, x1, top + 12], fill=PRINT, width=2)
        draw.line([x0, head, x1, head], fill=PRINT, width=3)
        for x in columns:
            draw.line([x * W, top, x * W, bottom], fill=PRINT, width=3)
        for row in range(1, ROWS + 1):
            y = head + (bottom - head) * row / ROWS
            for x in range(int(x0) + 6, int(x1) - 4, 9):
                draw.line([x, y, x + 3, y], fill=(96, 88, 76), width=2)
    middle = (top + head) / 2 + 8
    l, r = [x * W for x in LEFT], [x * W for x in RIGHT]
    centred(draw, [("DATE", big)], l[0], l[1], middle, 0)
    centred(draw, [("FONCTION", big), ("à", small), ("BORD", tiny)], l[1], l[2], middle, 10)
    centred(draw, [("GRADE, NOM", big), ("et fonction des autres membres", small), ("de l’équipage et des passagers", small)], l[2], l[3], middle, 8)
    centred(draw, [("TYPE", big), ("ET NUMÉRO", tiny), ("de l’avion", small)], l[3], l[4], middle, 10)
    centred(draw, [("ALTI-", tiny), ("TUDE", tiny), ("maxima", tiny)], r[0], r[1], middle, 8)
    centred(draw, [("DISTANCE", tiny), ("et nombre", tiny), ("d’atterris-", tiny), ("sages", tiny)], r[1], r[2], middle, 5)
    centred(draw, [("DURÉE", tiny)], r[2], r[3], middle, 0)
    centred(draw, [("NATURE", big), ("DU SERVICE AÉRIEN", tiny)], r[3], r[4], middle, 14)
    centred(draw, [("OBSERVATIONS", font("head", 24))], r[4], r[5], middle, 0)


def written(layer: Image.Image, text: str, x: float, y: float, size: int, colour=INK, underline: bool = False, seed: int = 0) -> float:
    """A word in a hand: each a little off the line, the ink uneven. Returns its width."""
    rng = random.Random(seed)
    face = font("hand", size)
    draw = ImageDraw.Draw(layer)
    cursor = x
    for character in text:
        lift = rng.uniform(-2.2, 2.2)
        alpha = rng.randrange(200, 250)
        draw.text((cursor, y + lift), character, font=face, fill=(*colour, alpha))
        cursor += draw.textlength(character, font=face) - 0.6
    if underline:
        draw.line([x - 4, y + size * 1.08, cursor + 6, y + size * 1.08 + rng.uniform(-3, 3)], fill=(*colour, 215), width=4)
    return cursor - x


def stamp(image: Image.Image, text: str, x: float, y: float, turn: float) -> None:
    """A rubber stamp in red: nobody takes the page for the original."""
    face = font("typed", 44)
    probe = ImageDraw.Draw(image)
    width = int(probe.textlength(text, font=face)) + 56
    tile = Image.new("RGBA", (width, 92), (0, 0, 0, 0))
    draw = ImageDraw.Draw(tile)
    draw.rectangle([4, 4, width - 5, 87], outline=(*RED, 215), width=5)
    draw.text((28, 22), text, font=face, fill=(*RED, 225))
    # a stamp never prints evenly
    wear = Image.effect_noise(tile.size, 60).convert("L").point(lambda v: 255 if v > 92 else 120)
    tile.putalpha(ImageChops.multiply(tile.getchannel("A"), wear))
    tile = tile.rotate(turn, expand=True, resample=Image.BICUBIC)
    image.paste(tile, (int(x), int(y)), tile)


def short_date(iso: str) -> str:
    year, month, day = iso.split("-")
    return f"{int(day)}-{int(month)}-{year[2:]}"


def target(mission: dict) -> str:
    # the country goes without saying on these pages: every one of them is over Germany
    return mission["target"].split(", ", 1)[1]


def spread(year: int, month: int, missions: list[dict], seed: int) -> Image.Image:
    image = paper(seed)
    form(image)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    head, bottom = HEAD * H, BOTTOM * H
    row = (bottom - head) / ROWS
    l, r = [x * W for x in LEFT], [x * W for x in RIGHT]
    # two lines to a mission; a blank line between them when the month leaves room
    step = 3 if len(missions) <= 5 else 2
    for index, mission in enumerate(missions):
        y = head + row * (index * step + (0.5 if step == 3 else 0)) + 6
        key = seed * 100 + index
        written(layer, short_date(mission["date"]), l[0] + 12, y + row * 0.46, 36, seed=key)
        ImageDraw.Draw(layer).line([l[0] + 8, y + row * 1.36, l[2] - 12, y + row * 1.36 + 3], fill=(*RED, 210), width=4)
        written(layer, "Nav. Cdt Av.", l[1] + 14, y + row * 0.46, 36, seed=key + 1)
        written(layer, "Halifax", l[3] + 34, y + row * 0.02, 40, seed=key + 2)
        written(layer, mission["aircraft"], l[3] + 22, y + row * 0.98, 34, seed=key + 3)
        written(layer, "Mission de guerre", r[3] + 18, y + row * 0.0, 42, colour=RED, underline=True, seed=key + 4)
        words = target(mission)
        size = 40
        while ImageDraw.Draw(layer).textlength(words, font=font("hand", size)) > (r[4] - r[3]) - 26 and size > 26:
            size -= 2
        written(layer, words, r[3] + 14, y + row * 1.0 + (40 - size) * 0.5, size, seed=key + 5)
        if mission["note"]:
            note = mission["note"]
            size = 36
            while ImageDraw.Draw(layer).textlength(note, font=font("hand", size)) > (r[5] - r[4]) - 20 and size > 22:
                size -= 2
            written(layer, note, r[4] + 10, y + row * 0.5, size, seed=key + 6)
    image.paste(layer, (0, 0), layer)

    name = f"{MONTHS[month - 1]} {year}"
    stamp(image, "RECONSTITUTION", l[2] + 40, bottom - row * 2.6, 4)
    stamp(image, f"RECONSTITUTION · {name}", r[0] + 150, bottom - row * 2.7, -3)
    draw = ImageDraw.Draw(image)
    foot = font("typed", 25)
    draw.text((l[0] + 4, bottom + 26), "Double page reconstituée pour ce récit, d’après la liste des missions.", font=foot, fill=(*RED,))
    draw.text((r[0] + 4, bottom + 26), "L’original n’est pas numérisé ; ce que la liste ne dit pas est laissé en blanc.", font=foot, fill=(*RED,))
    return image.filter(ImageFilter.GaussianBlur(0.6))


def main() -> None:
    missions = [m for m in json.loads((ROOT / "src" / "journey" / "content" / "missions.json").read_text()) if m["period"] == 2]
    scans = json.loads((GENERATED / "carnet-1940.json").read_text())
    months: dict[tuple[int, int], list[dict]] = {}
    for mission in missions:
        year, month, _ = (int(part) for part in mission["date"].split("-"))
        months.setdefault((year, month), []).append(mission)
    spreads = []
    for offset, ((year, month), group) in enumerate(sorted(months.items()), start=1):
        index = len(scans) + offset
        image = spread(year, month, group, seed=year * 100 + month)
        name = f"{index:02d}"
        image.save(OUT / f"{name}.webp", quality=84, method=6)
        small = image.copy()
        small.thumbnail((SMALL, SMALL), Image.LANCZOS)
        small.save(OUT / f"{name}_s.webp", quality=80, method=6)
        spreads.append({"index": index, "scan": f"reconstitution-{year}-{month:02d}", "folder": "", "width": W, "height": H, "reconstructed": f"{MONTHS[month - 1]} {year}", "missions": [m["date"] for m in group]})
        print(f"{name}  {MONTHS[month - 1]} {year}: {len(group)} missions")
    (GENERATED / "carnet-1940-reconstructed.json").write_text(json.dumps(spreads, indent=1, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
