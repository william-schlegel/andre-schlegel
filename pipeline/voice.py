"""Cut Eric's voice out of the Film, one file per Chapter.

Each file holds exactly the Chapter's stretch of the Film's soundtrack ([start, end) as written
in src/journey/content/chapters.ts), so a time in the file plus the Chapter's start is a time of the Film.

Output: public/media/<chapter>/voix.m4a

Usage: .work/venv/bin/python pipeline/voice.py <chapter> [<chapter>…]
       .work/venv/bin/python pipeline/voice.py --check [<chapter>…]   compare the files with the Film, by loudness
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import numpy as np

from detect_changes import FILM
from phrases import chapter_bounds

ROOT = Path(__file__).resolve().parent.parent

RATE = 8000


def loudness(source: Path, start: float | None = None, length: float | None = None) -> np.ndarray:
    """How loud a sound file is, second by second, in decibels."""
    where = [] if start is None else ["-ss", f"{start}", "-t", f"{length}"]
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", *where, "-i", str(source), "-vn", "-ac", "1", "-ar", str(RATE), "-f", "s16le", "-"],
        capture_output=True, check=True,
    ).stdout
    samples = np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768
    seconds = samples[: len(samples) // RATE * RATE].reshape(-1, RATE)
    return 20 * np.log10(np.sqrt((seconds**2).mean(axis=1)) + 1e-9)


def cut(chapter: str) -> None:
    start, end = chapter_bounds()[chapter]
    out = ROOT / "public" / "media" / chapter / "voix.m4a"
    out.parent.mkdir(parents=True, exist_ok=True)
    length = end - start
    subprocess.run(
        [
            "ffmpeg", "-v", "error", "-y", "-i", str(FILM), "-vn", "-ac", "1",
            # The stretch is cut inside the filter chain and its time set back to zero, so that the
            # fades are counted from the start of the Chapter. (Cut with -ss/-to instead, the fades
            # are counted from the start of the Film: the fade-out then silences the Film from the
            # Chapter's *length* on, which is before or inside every Chapter but the first.)
            # Mono: the voice is the same on both sides; short fades so the cut never clicks.
            "-af", f"atrim=start={start}:end={end},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={length - 0.05:.3f}:d=0.05",
            "-c:a", "aac_at", "-b:a", "80k", "-movflags", "+faststart", str(out),
        ],
        check=True,
    )
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)],
        capture_output=True, text=True, check=True,
    )
    print(f"{chapter}: {length:.2f} s asked, {float(probe.stdout):.2f} s written, {out.stat().st_size // 1024} KB")
    check(chapter)


def check(chapter: str) -> bool:
    """The file must sound like its stretch of the Film: nobody can hear a silent file by reading its length."""
    start, end = chapter_bounds()[chapter]
    out = ROOT / "public" / "media" / chapter / "voix.m4a"
    film = loudness(FILM, start, end - start)
    voice = loudness(out)
    seconds = min(len(film), len(voice))
    spoken = film[:seconds] > -45
    lost = spoken & (voice[:seconds] < film[:seconds] - 6)
    if abs(len(film) - len(voice)) > 1 or lost.sum() > 0.01 * max(1, spoken.sum()):
        first = int(np.argmax(lost)) if lost.any() else seconds
        print(f"  WRONG {chapter}: {int(lost.sum())} of {int(spoken.sum())} seconds of sound are missing (from {first} s); {len(voice)} s for {len(film)} s of Film")
        return False
    print(f"  heard {chapter}: all {int(spoken.sum())} seconds of sound are there")
    return True


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    if sys.argv[1] == "--check":
        # every Chapter's file as it stands, without cutting anything
        results = [check(name) for name in (sys.argv[2:] or chapter_bounds())]
        sys.exit(0 if all(results) else 1)
    for name in sys.argv[1:]:
        cut(name)
