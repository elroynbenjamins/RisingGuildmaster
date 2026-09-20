"""Install generated alpha cutouts at the established 384px runtime size."""
import importlib.util
import json
import shutil
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('art_optimizer', ROOT / 'scripts/optimize-generated-art.py')
optimizer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(optimizer)
entries = json.loads((ROOT / 'output/icon-transparency/generation-attempts.json').read_text())
destination = ROOT / 'assets/artwork-v2/icons/game-transparent'
destination.mkdir(parents=True, exist_ok=True)
report = []
for entry in entries:
    source = Path(entry['sourcePath'])
    with Image.open(source) as image:
        if image.mode != 'RGBA' or image.getchannel('A').getextrema() != (0, 255):
            raise ValueError(f"Not a genuine transparent cutout: {entry['id']}")
    target = destination / (entry['id'] + '.png')
    shutil.copy2(source, target)
    before, after = optimizer.optimize(target, 384)
    with Image.open(target) as image:
        alpha = image.getchannel('A')
        report.append({'id': entry['id'], 'size': image.size, 'mode': image.mode, 'alpha': alpha.getextrema(), 'transparentPixels': alpha.histogram()[0], 'beforeBytes': before, 'afterBytes': after})
(ROOT / 'output/icon-transparency/asset-checks.json').write_text(json.dumps(report, indent=2))
print(f'Installed {len(report)} transparent UI icons at 384x384; originals preserved.')
