"""Prepare vector identity and locally served fonts. Requires fonttools[woff]."""
from pathlib import Path
import argparse, hashlib, html, json, urllib.request
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--source-dir', type=Path, default=ROOT / '.preview/font-sources')
args = parser.parse_args()
args.source_dir.mkdir(parents=True, exist_ok=True)
sources = json.loads((ROOT / 'assets/fonts/sources.json').read_text())
for name, source in sources['fonts'].items():
    target = args.source_dir / (name + '.ttf')
    if not target.exists():
        target.write_bytes(urllib.request.urlopen(source['url'], timeout=60).read())
    if hashlib.sha256(target.read_bytes()).hexdigest() != source['sha256']:
        raise ValueError(f'Unexpected font source bytes: {name}')

# Include all preserved copy and browser-generated interface strings.
corpus = '\n'.join(p.read_text() for p in ROOT.rglob('*.html') if '.git' not in p.parts)
for name in ['content/site.json', 'assets/app.js', 'scripts/build.mjs']:
    corpus += '\n' + (ROOT / name).read_text()
corpus = html.unescape(corpus)
tc_cmap = TTFont(args.source_dir / 'NotoSansTC.ttf').getBestCmap()
companion_chars = {c for c in corpus if '\u3400' <= c <= '\u9fff' and ord(c) not in tc_cmap}
sc_cmap = TTFont(args.source_dir / 'NotoSansSC.ttf').getBestCmap()
unsupported = {c for c in companion_chars if ord(c) not in sc_cmap}
if unsupported:
    raise ValueError(f'Chinese characters unavailable in bundled sources: {unsupported}')
for name, output in [('NotoSansTC', 'cmi-noto-sans-tc.woff2'), ('NotoSansSC', 'cmi-noto-sans-sc.woff2'), ('Manrope', 'cmi-manrope.woff2')]:
    font = TTFont(args.source_dir / (name + '.ttf'))
    font.recalcTimestamp = False
    options = subset.Options()
    options.layout_features = ['*']
    options.name_IDs = ['*']
    options.name_languages = ['*']
    options.recalc_timestamp = False
    sub = subset.Subsetter(options=options)
    if name in ('NotoSansTC', 'NotoSansSC'):
        sub.populate(text=corpus if name == 'NotoSansTC' else ''.join(sorted(companion_chars)))
        sub.subset(font)
    # Keep the complete small Latin family so form inputs support new names.
    font.flavor = 'woff2'
    font.save(ROOT / 'assets/fonts' / output)
    print(output, (ROOT / 'assets/fonts' / output).stat().st_size, 'bytes')

manrope = instantiateVariableFont(TTFont(args.source_dir / 'Manrope.ttf'), {'wght': 750})
canada = instantiateVariableFont(TTFont(args.source_dir / 'Manrope.ttf'), {'wght': 550})
chinese = TTFont(args.source_dir / 'NotoSansTC.ttf')
small_subset = subset.Subsetter()
small_subset.populate(text='加拿大國際關懷協會')
small_subset.subset(chinese)
chinese = instantiateVariableFont(chinese, {'wght': 500})

def lettering(font, text, x, y, size, tracking=0):
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / font['head'].unitsPerEm
    output = []
    for char in text:
        name = cmap[ord(char)]
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        output.append(f'<path d="{pen.getCommands()}" transform="translate({x:.4f} {y}) scale({scale:.6f} {-scale:.6f})"/>')
        x += glyphs[name].width * scale + tracking
    return ''.join(output)

# Open palms lift the cross; the maple leaf identifies the Canadian sending base.
# The shared geometry is used for every logo variant and the favicon.
def emblem(ink, accent):
    return f'''<path d="M30 10h8v15h13v8H38v22h-8V33H17v-8h13z" fill="{ink}"/>
<path d="M7 42c4 14 13 23 26 27M65 42C61 56 52 65 39 69" fill="none" stroke="{ink}" stroke-width="6.5" stroke-linecap="round"/>
<path d="m12 0 2.6 6.5 3.4-1.5-.7 5L22 8l-1.5 5L24 15l-8 3 1 5-4-1-1 7-1-7-4 1 1-5-8-3 3.5-2L2 8l4.7 2L6 5l3.4 1.5Z" transform="translate(54 2) scale(.66)" fill="{accent}"/>'''

brand = ROOT / 'assets/brand'
for variant, ink, accent in [('dark','#193f35','#b8693b'),('light','#faf8f1','#d99b73')]:
    text = lettering(manrope, 'CMI', 92, 43, 40, -.6) + lettering(canada, 'Canada', 177, 43, 21, -.2)
    tagline = lettering(chinese, '加拿大國際關懷協會', 94, 65, 12.8, .3)
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 276 80" role="img" aria-labelledby="title desc"><title id="title">CMI Canada</title><desc id="desc">加拿大國際關懷協會 — open hands supporting a cross, with a Canadian maple leaf.</desc><g transform="translate(1 2)">{emblem(ink,accent)}</g><g fill="{ink}">{text}<g>{tagline}</g></g></svg>'''
    (brand / f'cmi-logo-{variant}.svg').write_text(svg)
(brand/'cmi-mark.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" role="img" aria-label="CMI Canada care and cross emblem">{emblem("#193f35","#b8693b")}</svg>')
(brand/'cmi-favicon.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="15" fill="#193f35"/><g transform="translate(5 5) scale(.875)">{emblem("#faf8f1","#d99b73")}</g></svg>')
print('Vector logo, light variant, emblem, and favicon ready.')
