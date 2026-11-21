"""Cut Eric's voice out of the Film, one file per Chapter.

Each file holds exactly the Chapter's stretch of the Film's soundtrack ([start, end) as written
in src/journey/content/chapters.ts), so a time in the file plus the Chapter's start is a time of the Film.

Output: public/media/<chapter>/voix.m4a

Usage: .work/venv/bin/python pipeline/voice.py <chapter> [<chapter>…]
"""

import subprocess
import sys
from pathlib import Path

from detect_changes import FILM
from phrases import chapter_bounds

ROOT = Path(__file__).resolve().parent.parent


def cut(chapter: str) -> None:
    start, end = chapter_bounds()[chapter]
    out = ROOT / "public" / "media" / chapter / "voix.m4a"
    out.parent.mkdir(parents=True, exist_ok=True)
    length = end - start
    subprocess.run(
        [
            "ffmpeg", "-v", "error", "-y", "-i", str(FILM), "-ss", f"{start}", "-to", f"{end}", "-vn",
            # mono: the voice is the same on both sides; short fades so the cut never clicks
            "-ac", "1", "-af", f"afade=t=in:d=0.03,afade=t=out:st={length - 0.05:.3f}:d=0.05",
            "-c:a", "aac_at", "-b:a", "80k", "-movflags", "+faststart", str(out),
        ],
        check=True,
    )
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)],
        capture_output=True, text=True, check=True,
    )
    print(f"{chapter}: {length:.2f} s asked, {float(probe.stdout):.2f} s written, {out.stat().st_size // 1024} KB")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for name in sys.argv[1:]:
        cut(name)
