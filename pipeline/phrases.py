"""Draft the phrases of the Narration, Chapter by Chapter, from the Film's soundtrack.

The words and rough times come from Whisper (.work/whisper/v4dtw.json); the start and end of
each phrase are then moved onto the voice itself (where the sound rises out of a pause and
falls back into one). Known mishearings are corrected from the table below.

The draft goes to pipeline/narration/<chapter>.tsv (start, end, text). That file is then read
through and corrected by hand: it is the Narration's text of record, and it is never overwritten
unless --force is given. `--publish` turns the corrected files into the JSON the site loads.

Usage: .work/venv/bin/python pipeline/phrases.py draft <chapter> [--force]
       .work/venv/bin/python pipeline/phrases.py publish
"""

from __future__ import annotations

import json
import re
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
WHISPER = ROOT / ".work" / "whisper" / "v4dtw.json"
WAV = ROOT / ".work" / "whisper" / "v4_16k.wav"
NARRATION = ROOT / "pipeline" / "narration"
GENERATED = ROOT / "src" / "journey" / "content" / "generated"

MAX_CHARS = 92  # a caption is two short lines at most

# Mishearings of names and trade words, checked against Eric's written notes in the Dossier.
CORRECTIONS: list[tuple[str, str]] = [
    (r"\bblocs? 200\b", "Bloch 200"),
    (r"\bblocs? 210\b", "Bloch 210"),
    (r"\bBlock 2(00|10)\b", r"Bloch 2\1"),
    (r"\bPoth?[èe][sz]e? 25\b", "Potez 25"),
    (r"\bquadriplex\b", "quadriplace"),
    (r"\bDistinguished Fine Cross\b", "Distinguished Flying Cross"),
    (r"\bOran-la-Sénia\b", "Oran-La Sénia"),
    (r"\bMer[cs]el-Kéb[yi]r?\b", "Mers el-Kébir"),
    (r"\bla FN\b", "l’AFN"),
    (r"\bl'aéropostale\b", "l’Aéropostale"),
    (r"\barts et métiers\b", "Arts et Métiers"),
    (r"\bLégion d'honneur\b", "Légion d’honneur"),
    (r"\bcroix de guerre avec palme\b", "croix de guerre avec palmes"),
]


def read_envelope() -> tuple[np.ndarray, float]:
    """Loudness of the soundtrack, one value every 10 ms, in dB."""
    with wave.open(str(WAV)) as wav:
        rate = wav.getframerate()
        samples = np.frombuffer(wav.readframes(wav.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    hop = rate // 100
    usable = len(samples) // hop * hop
    rms = np.sqrt((samples[:usable].reshape(-1, hop) ** 2).mean(axis=1) + 1e-10)
    # smooth over 30 ms so that a single plosive is not taken for a start
    rms = np.convolve(rms, np.ones(3) / 3, mode="same")
    return 20 * np.log10(rms), 0.01


def snap(envelope: np.ndarray, step: float, time: float, kind: str, threshold: float) -> float:
    """Move a phrase boundary onto the nearest place where the voice starts (or stops)."""
    reach = int(0.7 / step)
    centre = int(time / step)
    loud = envelope > threshold
    best = None
    for offset in range(reach):
        for index in (centre - offset, centre + offset):
            if index < 3 or index >= len(loud) - 3:
                continue
            if kind == "start" and loud[index] and not loud[index - 3 : index].any():
                best = index
            elif kind == "end" and not loud[index] and loud[index - 1] and not loud[index : index + 12].any():
                best = index
            if best is not None:
                return round(best * step, 2)
    return round(time, 2)


def correct(text: str) -> str:
    for pattern, replacement in CORRECTIONS:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE if pattern.islower() else 0)
    text = text.replace("'", "’")
    text = re.sub(r'"([^"]+)"', r"« \1 »", text)
    return text.strip()


def words_of(segment: dict) -> list[dict]:
    words: list[dict] = []
    for token in segment["tokens"]:
        text = token["text"]
        if text.startswith("[_"):
            continue
        start, end = token["offsets"]["from"] / 1000, token["offsets"]["to"] / 1000
        if text.startswith(" ") or not words:
            words.append({"text": text.strip(), "start": start, "end": end})
        else:
            words[-1]["text"] += text
            words[-1]["end"] = end
    return [w for w in words if w["text"]]


def split(words: list[dict]) -> list[list[dict]]:
    """Cut a long sentence into caption-sized parts, at its commas when it has some."""
    text = " ".join(w["text"] for w in words)
    if len(text) <= MAX_CHARS or len(words) < 6:
        return [words]
    middle = len(text) / 2
    best, best_cost = None, None
    position = 0
    for index, word in enumerate(words[:-2]):
        position += len(word["text"]) + 1
        if index < 2:
            continue
        nxt = words[index + 1]["text"].lower()
        if word["text"].endswith((",", ";", ":")):
            penalty = 0
        elif nxt in ("et", "ou", "mais", "car", "qui", "que", "dont", "où", "pour", "avec", "sur", "dans", "comme", "ainsi", "puis"):
            penalty = 14
        else:
            penalty = 40
        cost = abs(position - middle) + penalty
        if best_cost is None or cost < best_cost:
            best, best_cost = index, cost
    if best is None:
        return [words]
    return split(words[: best + 1]) + split(words[best + 1 :])


def draft(chapter_id: str, force: bool) -> None:
    chapters = chapter_bounds()
    start, end = chapters[chapter_id]
    target = NARRATION / f"{chapter_id}.tsv"
    if target.exists() and not force:
        sys.exit(f"{target} exists (it is corrected by hand); use --force to redo the draft")
    envelope, step = read_envelope()
    # between the room's hiss and the voice
    threshold = float(np.percentile(envelope, 20)) + 9
    segments = json.loads(WHISPER.read_text())["transcription"]
    rows = []
    for segment in segments:
        seg_start = segment["offsets"]["from"] / 1000
        if seg_start < start - 0.3 or seg_start >= end - 0.3:
            continue
        words = words_of(segment)
        if not words:
            continue
        for part in split(words):
            a = snap(envelope, step, part[0]["start"], "start", threshold)
            b = snap(envelope, step, part[-1]["end"], "end", threshold)
            rows.append([a, max(b, a + 0.3), correct(" ".join(w["text"] for w in part))])
    # no overlap, and inside the Chapter
    for index, row in enumerate(rows):
        row[0] = max(row[0], start)
        row[1] = min(row[1], end)
        if index + 1 < len(rows) and row[1] > rows[index + 1][0]:
            row[1] = rows[index + 1][0]
    NARRATION.mkdir(parents=True, exist_ok=True)
    target.write_text("".join(f"{a:.2f}\t{b:.2f}\t{text}\n" for a, b, text in rows))
    print(f"{len(rows)} phrases -> {target}")


def chapter_bounds() -> dict[str, tuple[float, float]]:
    source = (ROOT / "src" / "journey" / "content" / "chapters.ts").read_text()
    found = re.findall(r"id: '([a-z-]+)'.*?start: ([\d.]+), end: ([\d.]+)", source)
    return {chapter: (float(a), float(b)) for chapter, a, b in found}


def publish() -> None:
    GENERATED.mkdir(parents=True, exist_ok=True)
    bounds = chapter_bounds()
    for path in sorted(NARRATION.glob("*.tsv")):
        start, end = bounds[path.stem]
        phrases = []
        for number, line in enumerate(path.read_text().splitlines(), start=1):
            if not line.strip():
                continue
            a, b, text = line.split("\t")
            a, b = float(a), float(b)
            if not (start <= a < b <= end):
                sys.exit(f"{path.name}:{number}: {a}–{b} is outside the Chapter ({start}–{end})")
            if phrases and a < phrases[-1]["end"]:
                sys.exit(f"{path.name}:{number}: starts before the previous phrase ends")
            phrases.append({"start": a, "end": b, "text": text.strip()})
        (GENERATED / f"phrases-{path.stem}.json").write_text(json.dumps(phrases, ensure_ascii=False, indent=1) + "\n")
        print(f"{path.stem}: {len(phrases)} phrases")


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "draft":
        draft(sys.argv[2], "--force" in sys.argv)
    elif len(sys.argv) == 2 and sys.argv[1] == "publish":
        publish()
    else:
        sys.exit(__doc__)
