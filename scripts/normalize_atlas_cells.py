from pathlib import Path
from tempfile import gettempdir
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
JOBS = (
    ("assets/skills/monk-bard-skills-atlas-v1.png", 5, 6, 209),
    ("assets/portraits/heroes/monk-variants.png", 5, 8, 314),
    ("assets/portraits/heroes/bard-variants.png", 5, 8, 314),
    ("assets/portraits/heroes/tiefling-variants.png", 6, 8, 314),
)

for relative_path, columns, rows, target_size in JOBS:
    path = ROOT / relative_path
    image = Image.open(path).convert("RGB")
    cell_width, cell_height = image.width // columns, image.height // rows
    side = min(cell_width, cell_height)
    normalized = Image.new("RGB", (target_size * columns, target_size * rows))
    for row in range(rows):
        for column in range(columns):
            left = column * cell_width + (cell_width - side) // 2
            top = row * cell_height + (cell_height - side) // 2
            cell = image.crop((left, top, left + side, top + side)).resize((target_size, target_size), Image.Resampling.NEAREST)
            normalized.paste(cell, (column * target_size, row * target_size))
    temporary = Path(gettempdir()) / f"guildmaster-{path.stem}-normalized.png"
    normalized.save(temporary)
    print(f"{relative_path}|{temporary}|{normalized.size[0]}x{normalized.size[1]}|{target_size}px cells")
