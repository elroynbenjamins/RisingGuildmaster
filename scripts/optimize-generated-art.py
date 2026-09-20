from __future__ import annotations

import os
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
TARGETS = {
    384: (
        ROOT / "assets" / "artwork-v2" / "icons",
        ROOT / "assets" / "artwork-v2" / "skills",
        ROOT / "assets" / "images" / "skills",
        ROOT / "assets" / "images" / "equipment",
        ROOT / "assets" / "images" / "materials",
    ),
    512: (
        ROOT / "assets" / "artwork-v2" / "heroes",
        ROOT / "assets" / "artwork-v2" / "enemies",
        ROOT / "assets" / "artwork-v2" / "npcs",
        ROOT / "assets" / "artwork-v2" / "companions",
        ROOT / "assets" / "images" / "companions",
    ),
}


def optimize(path: Path, target_size: int) -> tuple[int, int]:
    original_bytes = path.stat().st_size
    temporary = path.with_suffix(".optimized.png")

    with Image.open(path) as source:
        source.load()
        if source.width != source.height:
            raise ValueError(f"Refusing non-square artwork: {path}")

        image = source
        if source.width > target_size:
            image = source.resize(
                (target_size, target_size),
                Image.Resampling.LANCZOS,
                reducing_gap=3.0,
            )

        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")

        image.save(
            temporary,
            format="PNG",
            optimize=True,
            compress_level=9,
        )

    optimized_bytes = temporary.stat().st_size
    os.replace(temporary, path)
    return original_bytes, optimized_bytes


def main() -> int:
    total_files = 0
    original_bytes = 0
    optimized_bytes = 0

    for target_size, directories in TARGETS.items():
        for directory in directories:
            if not directory.is_dir():
                continue
            for path in sorted(directory.rglob("*.png")):
                before, after = optimize(path, target_size)
                total_files += 1
                original_bytes += before
                optimized_bytes += after

    reduction = 0 if not original_bytes else 100 * (1 - optimized_bytes / original_bytes)
    print(f"Optimized files: {total_files}")
    print(f"Before: {original_bytes / 1024 / 1024:.1f} MB")
    print(f"After: {optimized_bytes / 1024 / 1024:.1f} MB")
    print(f"Reduction: {reduction:.1f}%")
    return 0


if __name__ == "__main__":
    sys.exit(main())
