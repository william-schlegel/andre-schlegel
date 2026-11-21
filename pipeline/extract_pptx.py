"""Read the unpacked pptx of the Film and describe every slide.

Output (.work/pptx.json): for each slide, its shapes (pictures, texts, films) with their
place on the slide, and the order in which the slide's animation reveals and hides them.
The pptx timings are NOT used (see docs/adr/0001); only the structure and the files are.

Usage: .work/venv/bin/python pipeline/extract_pptx.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from lxml import etree

ROOT = Path(__file__).resolve().parent.parent
PPTX = ROOT / ".work" / "pptx" / "ppt"
OUT = ROOT / ".work" / "pptx.json"

NS = {
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def q(tag: str) -> str:
    prefix, name = tag.split(":")
    return f"{{{NS[prefix]}}}{name}"


def slide_size() -> tuple[int, int]:
    pres = etree.parse(str(PPTX / "presentation.xml"))
    size = pres.find(".//p:sldSz", NS)
    return int(size.get("cx")), int(size.get("cy"))


def relationships(slide_no: int) -> dict[str, str]:
    rels = etree.parse(str(PPTX / "slides" / "_rels" / f"slide{slide_no}.xml.rels"))
    return {r.get("Id"): r.get("Target") for r in rels.findall(".//rel:Relationship", NS)}


def paragraphs(el) -> list[str]:
    out = []
    for para in el.findall(".//a:p", NS):
        text = "".join(t.text or "" for t in para.findall(".//a:t", NS)).strip()
        text = re.sub(r"\s+", " ", text)
        if text:
            out.append(text)
    return out


def shape(el, rels: dict[str, str], width: int, height: int) -> dict | None:
    kind = etree.QName(el).localname
    if kind not in ("sp", "pic", "graphicFrame", "grpSp", "cxnSp"):
        return None
    props = el.find(".//p:cNvPr", NS)
    xfrm = el.find(".//a:xfrm", NS)
    if xfrm is None:
        xfrm = el.find(".//p:xfrm", NS)
    off = xfrm.find("a:off", NS) if xfrm is not None else None
    ext = xfrm.find("a:ext", NS) if xfrm is not None else None
    out: dict = {"id": props.get("id"), "name": props.get("name"), "kind": kind}
    if off is not None and ext is not None:
        out["rect"] = [
            round(int(off.get("x")) / width, 5),
            round(int(off.get("y")) / height, 5),
            round(int(ext.get("cx")) / width, 5),
            round(int(ext.get("cy")) / height, 5),
        ]
        if xfrm.get("rot"):
            out["rotation"] = round(int(xfrm.get("rot")) / 60000, 2)
    blip = el.find(".//a:blip", NS)
    if blip is not None and blip.get(q("r:embed")):
        out["image"] = Path(rels[blip.get(q("r:embed"))]).name
        crop = el.find(".//a:srcRect", NS)
        if crop is not None:
            out["crop"] = {k: round(int(v) / 100000, 5) for k, v in crop.attrib.items()}
    video = el.find(".//a:videoFile", NS)
    if video is not None:
        out["kind"] = "film"
        link = video.get(q("r:link"))
        if link and link in rels:
            out["film"] = Path(rels[link]).name
    if out.get("film") is None:
        for rid, target in rels.items():
            if target.endswith(".mp4") and kind == "pic" and el.find(".//p:nvPr/a:videoFile", NS) is not None:
                out["film"] = Path(target).name
    text = paragraphs(el)
    if text:
        out["text"] = text
    return out


def animation_steps(tree) -> list[dict]:
    """The main sequence, as the list of clicks; each click lists what appears and what leaves."""
    main = tree.find(".//p:timing//p:cTn[@nodeType='mainSeq']", NS)
    if main is None:
        return []
    steps = []
    for click in main.find("p:childTnLst", NS):
        effects = []
        for node in click.iter(q("p:cTn")):
            cls = node.get("presetClass")
            if cls is None:
                continue
            target = node.find(".//p:spTgt", NS)
            if target is None:
                continue
            dur = max((int(d.get("dur")) for d in node.iter(q("p:cTn")) if (d.get("dur") or "").isdigit()), default=0)
            delay = node.find("p:stCondLst/p:cond", NS)
            hides_after = node.find("p:subTnLst//p:strVal[@val='hidden']", NS) is not None
            filt = node.find(".//p:animEffect", NS)
            effects.append(
                {
                    "shape": target.get("spid"),
                    "class": cls,  # entr | exit | emph | path
                    "trigger": node.get("nodeType"),  # clickEffect | withEffect | afterEffect
                    "effect": filt.get("filter") if filt is not None else None,
                    "duration_ms": dur,
                    "delay_ms": int(delay.get("delay")) if delay is not None and (delay.get("delay") or "").isdigit() else 0,
                    "hidden_on_next_click": hides_after,
                }
            )
        if effects:
            steps.append({"effects": effects})
    return steps


def main() -> None:
    width, height = slide_size()
    slides = []
    numbers = sorted(int(re.findall(r"\d+", p.name)[0]) for p in (PPTX / "slides").glob("slide*.xml"))
    for no in numbers:
        tree = etree.parse(str(PPTX / "slides" / f"slide{no}.xml"))
        rels = relationships(no)
        shapes = [s for s in (shape(el, rels, width, height) for el in tree.find(".//p:cSld/p:spTree", NS)) if s]
        films = [Path(t).name for t in rels.values() if t.lower().endswith(".mp4")]
        slides.append(
            {
                "slide": no,
                "shapes": shapes,
                "films": films,
                "steps": animation_steps(tree),
            }
        )
    OUT.write_text(json.dumps({"aspect": width / height, "slides": slides}, ensure_ascii=False, indent=1))
    pictures = sum(1 for s in slides for sh in s["shapes"] if "image" in sh)
    print(f"{len(slides)} slides, {pictures} pictures, {sum(len(s['films']) for s in slides)} films -> {OUT}")


if __name__ == "__main__":
    main()
