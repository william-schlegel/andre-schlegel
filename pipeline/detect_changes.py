"""Find every moment the picture of the Film (V4) changes.

Reads V4 at a low frame rate and size, and lists the "changes": stretches of time during
which the picture is moving from one still state to another, with the part of the picture
that changed (in slide coordinates, 0..1, the slide being the 3:2 area inside the 16:9 frame).

Output: .work/changes.json

Usage: .work/venv/bin/python pipeline/detect_changes.py [start_s] [end_s]
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
FILM = (
    Path.home()
    / "dev"
    / "Dossier Carrière Militaire et Aéronautique Cdt André Schlegel"
    / "Carrière Militaire et Aéronautique du Cdt André Schlegel_V4.mp4"
)
OUT = ROOT / ".work" / "changes.json"

FPS = 10
W, H = 192, 108  # 16:9 frame
SLIDE_X0, SLIDE_X1 = 15, 177  # the 3:2 slide inside it (1920x1080 -> x from 150 to 1770)
PIXEL_THRESHOLD = 10  # grey levels (0..255) for a pixel to count as changed
AREA_THRESHOLD = 0.0015  # share of the slide that must change for a frame to count
GAP = 0.35  # seconds of stillness that end a change


def frames(start: float | None, end: float | None):
    cmd = ["ffmpeg", "-v", "error"]
    if start is not None:
        cmd += ["-ss", str(start)]
    if end is not None:
        cmd += ["-to", str(end)]
    cmd += ["-i", str(FILM), "-vf", f"fps={FPS},scale={W}:{H}", "-pix_fmt", "gray", "-f", "rawvideo", "-"]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    size = W * H
    while True:
        buf = proc.stdout.read(size)
        if len(buf) < size:
            break
        yield np.frombuffer(buf, dtype=np.uint8).reshape(H, W)[:, SLIDE_X0:SLIDE_X1].astype(np.int16)


def main() -> None:
    start = float(sys.argv[1]) if len(sys.argv) > 1 else None
    end = float(sys.argv[2]) if len(sys.argv) > 2 else None
    offset = start or 0.0

    changes = []
    current = None
    previous = None
    for index, frame in enumerate(frames(start, end)):
        t = offset + index / FPS
        if previous is not None:
            moved = np.abs(frame - previous) > PIXEL_THRESHOLD
            share = float(moved.mean())
            if share > AREA_THRESHOLD:
                if current is None:
                    current = {"start": t - 1 / FPS, "end": t, "mask": moved.copy(), "peak": share, "before": previous}
                else:
                    current["end"] = t
                    current["mask"] |= moved
                    current["peak"] = max(current["peak"], share)
            elif current is not None and t - current["end"] > GAP:
                changes.append(finish(current, previous))
                current = None
        previous = frame
    if current is not None:
        changes.append(finish(current, previous))

    OUT.write_text(json.dumps(changes, indent=1))
    print(f"{len(changes)} changes -> {OUT}")


def finish(change: dict, after: np.ndarray) -> dict:
    # what differs between the still state before and the still state after
    net = np.abs(after - change["before"]) > PIXEL_THRESHOLD
    mask = net if net.mean() > AREA_THRESHOLD / 2 else change["mask"]
    ys, xs = np.nonzero(mask)
    h, w = mask.shape
    # trim stray pixels: keep the box that holds 98% of the changed pixels
    x0, x1 = np.percentile(xs, [1, 99])
    y0, y1 = np.percentile(ys, [1, 99])
    return {
        "start": round(change["start"], 2),
        "end": round(change["end"], 2),
        "box": [round(x0 / w, 3), round(y0 / h, 3), round((x1 - x0 + 1) / w, 3), round((y1 - y0 + 1) / h, 3)],
        "area": round(float(net.mean()), 4),
        "peak": round(change["peak"], 4),
        "brighter": bool((after - change["before"])[mask].mean() > 0),
    }


if __name__ == "__main__":
    main()
