"""List the stretches where Eric is speaking, between two times, to check phrase timings by eye.

Usage: .work/venv/bin/python pipeline/voiced.py <from> <to> [min_pause=0.3] [threshold_db=-31]
"""
import sys

import numpy as np

from phrases import read_envelope


def voiced(start: float, end: float, min_pause: float = 0.3, threshold: float = -31.0):
    envelope, step = read_envelope()
    a, b = int(start / step), int(end / step)
    loud = envelope[a:b] > threshold
    runs = []
    run_start = None
    quiet = 0
    for i, on in enumerate(loud):
        if on:
            if run_start is None:
                run_start = i
            quiet = 0
        elif run_start is not None:
            quiet += 1
            if quiet * step >= min_pause:
                runs.append((start + run_start * step, start + (i - quiet + 1) * step))
                run_start = None
    if run_start is not None:
        runs.append((start + run_start * step, end))
    return [(s, e) for s, e in runs if e - s > 0.12]


if __name__ == "__main__":
    args = [float(v) for v in sys.argv[1:]]
    for s, e in voiced(*args):
        print(f"{s:8.2f} → {e:8.2f}   ({e - s:.2f} s)")
