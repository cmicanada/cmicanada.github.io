"""Render the Issue #19 trilingual test poster; requires Pillow and cached Noto fonts.
Run scripts/prepare-brand.py first if .preview/font-sources is empty.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parent.parent
fonts = ROOT / '.preview/font-sources'
canvas = Image.new('RGB', (1600, 1500), '#faf8f1')
draw = ImageDraw.Draw(canvas)
def text(x, y, value, size, color='#193f35', family='NotoSansTC'):
    font = ImageFont.truetype(str(fonts / (family + '.ttf')), size)
    font.set_variation_by_axes([600 if size >= 40 else 450])
    assert draw.textbbox((x,y), value, font=font)[2] < 1520, value
    draw.text((x, y), value, font=font, fill=color)
logo = Image.open(ROOT / 'assets/brand/cmi-logo-refined-v2.png').convert('RGBA')
logo.thumbnail((620, 210))
canvas.paste(logo, (90, 65), logo)
draw.rounded_rectangle((1000,95,1510,180), radius=12, fill='#193f35')
text(1040,108,'THIS IS A TEST',43,'#ffffff','Manrope')
draw.rectangle((90,310,1510,316), fill='#b8693b')
for y, label, title, line, family in [
    (370,'繁體中文','炳海牧師在馬來西亞事工','測試文章・三語發文測試','NotoSansTC'),
    (690,'简体中文','炳海牧师在马来西亚事工','测试文章・三语发文测试','NotoSansSC'),
    (1010,'ENGLISH','Pastor 炳海’s Ministry in Malaysia','Test post · Publishing in three languages','NotoSansTC'),
]:
    text(95,y,label,28,'#98603f',family)
    text(90,y+65,title,64 if label!='ENGLISH' else 60,family=family)
    text(95,y+168,line,34,family=family)
text(95,1385,'2026-10-20  /  Tom',30,family='Manrope')
text(1080,1385,'CMI CANADA',30,family='Manrope')
output = ROOT / 'assets/images/issue-19-trilingual-test-poster.png'
canvas.save(output)
for width in (480,960):
    preview=canvas.copy()
    preview.thumbnail((width,width*2))
    preview.save(output.with_name(output.stem+f'-{width}.webp'),'WEBP',quality=84)
print(output)
