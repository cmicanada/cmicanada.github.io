"""Make responsive previews without modifying the preserved original files (Pillow)."""
from pathlib import Path
from PIL import Image, ImageOps
for path in Path('assets/images').iterdir():
    if path.suffix.lower() not in ['.png', '.jpg', '.jpeg']: continue
    with Image.open(path) as original:
        for width in [480, 960]:
            preview = ImageOps.exif_transpose(original).convert('RGB')
            preview.thumbnail((width, width * 2))
            preview.save(path.with_name(path.stem + f'-{width}.webp'), 'WEBP', quality=84)
print('Responsive image previews ready.')
