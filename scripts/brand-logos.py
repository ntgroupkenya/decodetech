"""Draws the single-colour brand logos in public/brands/ (used by components/BrandStrip.jsx).

Wordmarks are set in Inter and turned into outlines; the marks (HP disc, Microsoft panes, AMD arrow, NVIDIA eye,
Dahua ring, Vention lettering) are drawn by hand. They are simplified redraws, not the makers' official artwork.
Needs fonttools and the Inter OTF fonts:   python3 scripts/brand-logos.py public/brands
"""
import os, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

OUT = sys.argv[1]
FONTS = {w: TTFont(f'/usr/share/fonts/opentype/inter/Inter-{w}.otf') for w in ['SemiBold', 'Bold', 'ExtraBold', 'Black']}


def text(s, weight, x, base, cap, track=0.0, stretch=1.0, skew=0.0):
    """Outline of `s`; `cap` is the capital height in units. Returns (path, end_x)."""
    font = FONTS[weight]
    gs, cmap = font.getGlyphSet(), font.getBestCmap()
    k = cap / font['OS/2'].sCapHeight
    pen = SVGPathPen(gs)
    for ch in s:
        g = gs[cmap[ord(ch)]]
        # x' = x + (gx*stretch + gy*skew)*k ; y' = base - gy*k
        g.draw(TransformPen(pen, (stretch * k, 0, skew * k, -k, x, base)))
        x += g.width * stretch * k + track
    return pen.getCommands(), x - track


def svg(name, w, h, body):
    with open(os.path.join(OUT, name + '.svg'), 'w') as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" fill="currentColor">{body}</svg>\n')


# HP: a disc with the slanted "hp" cut out of it; the h rises out of the top, the p drops out of the bottom.
def par(x1, y1, x2, y2, t):  # slanted bar from (x1,y1) to (x2,y2), flat top and bottom, t wide
    return f'M{x1} {y1}H{x1 + t}L{x2 + t} {y2}H{x2}Z'
hp_cut = (  # drawn upright, then slanted
    'M22 -6H32V74H22Z'                                                            # h stem, out through the top
    'M32 40Q38 32 47 32Q56 32 56 42V74H46V45Q46 41 42 41Q37 41 32 47Z'            # h shoulder and leg
    'M60 32H70V106H60Z'                                                           # p stem, out through the bottom
    'M70 38Q75 32 83 32Q95 32 95 50Q95 68 83 68Q75 68 70 62V53Q74 59 80 59Q86 59 86 50Q86 41 80 41Q74 41 70 47Z'  # p bowl
)
svg('hp', 100, 100, f'<mask id="m"><circle cx="50" cy="50" r="50" fill="#fff"/><path d="{hp_cut}" fill="#000" transform="translate(50 50) skewX(-16) scale(1.12) translate(-58 -50)"/></mask><circle cx="50" cy="50" r="50" mask="url(#m)"/>')

# Lenovo
d, end = text('Lenovo', 'Bold', 0, 76, 74, track=-2)
svg('lenovo', end, 100, f'<path d="{d}"/>')

# Microsoft: the four-pane window and the wordmark.
panes = ''.join(f'<rect x="{x}" y="{y}" width="35" height="35"/>' for x in (0, 38) for y in (0, 38))
d, end = text('Microsoft', 'SemiBold', 92, 59, 52, track=-1)
svg('microsoft', end, 73, panes + f'<path d="{d}"/>')

# Toshiba: wide, heavy capitals.
d, end = text('TOSHIBA', 'Black', 0, 70, 70, track=6, stretch=1.3)
svg('toshiba', end, 70, f'<path d="{d}"/>')

# Vention: built from bars and arches, like the original lettering.
def n_arch(x):
    return f'M{x} 60V0H{x + 34}A24 24 0 0 1 {x + 58} 24V60H{x + 45}V25A12 12 0 0 0 {x + 33} 13H{x + 13}V60Z'
vention = (
    'M0 0H15L29 40L43 0H58L37 60H21Z'
    'M66 0H124V13H79V24H118V36H79V47H124V60H74Q66 60 66 52Z'
    + n_arch(132)
    + 'M198 0H256V13H234V60H221V25A12 12 0 0 0 209 13H198Z'
    'M264 0H277V60H264Z'
    'M313 0H317A31 30 0 0 1 317 60H313A31 30 0 0 1 313 0ZM315 13H315A17 17 0 0 0 315 47A17 17 0 0 0 315 13Z'
    + n_arch(356)
)
svg('vention', 414, 60, f'<path fill-rule="evenodd" d="{vention}"/>')

# Dahua: the open ring around the first letter, a slanted stroke, and TECHNOLOGY underneath.
sk = -0.33
d1, e1 = text('a', 'Black', 28, 70, 50, skew=-sk)
d2, e2 = text('hua', 'Black', e1 + 16, 70, 50, track=1, skew=-sk)
dahua = (
    f'<path d="{d1}"/><path d="{d2}"/>'
    f'<path d="M{e1 + 2} 70H{e1 + 14}L{e1 + 40} 0H{e1 + 28}Z"/>'                       # the slanted l
    '<path d="M74 4A44 40 0 1 0 60 82L58 76A36 33 0 1 1 70 10Z"/>'                         # the ring
)
d3, e3 = text('TECHNOLOGY', 'Bold', e1 + 2, 96, 15, track=3)
svg('dahua', max(e2, e3) + 4, 100, dahua + f'<path d="{d3}"/>')

# AMD: wordmark with the arrow, RADEON underneath.
d, end = text('AMD', 'Black', 0, 50, 50, track=2, stretch=1.08)
ax = end + 10
arrow = (f'M{ax} 0H{ax + 50}V50L{ax + 36} 36V14H{ax + 14}Z'
         f'M{ax + 10} 20H{ax + 30}V40H{ax + 22}L{ax + 10} 28Z')
d2, end2 = text('RADEON', 'SemiBold', 0, 112, 42, track=24, stretch=1.05)
svg('amd', max(ax + 50, end2), 112, f'<path d="{d}"/><path d="{arrow}"/><path d="{d2}"/>')

# Netac: leaning wordmark.
d, end = text('Netac', 'Bold', 0, 76, 74, track=1, skew=0.12)
svg('netac', end + 8, 80, f'<path d="{d}"/>')

# NVIDIA: the eye (half in a square, half open) above the wordmark.
eye = (
    '<mask id="e"><rect width="140" height="80" fill="#fff"/>'
    '<path d="M70 14Q100 14 118 40Q100 66 70 66Q52 66 40 52Q54 60 70 60Q90 60 104 40Q90 20 70 20Z" fill="#000"/>'
    '<path d="M70 28A12 12 0 1 1 70 52A12 12 0 0 1 58 40Q58 32 64 30Q60 36 64 42Q70 48 76 42A6 6 0 0 0 70 28Z" fill="#000"/>'
    '</mask><rect x="70" y="0" width="70" height="80" mask="url(#e)"/>'
    '<path fill-rule="evenodd" d="M70 8Q38 8 14 40Q38 72 70 72V64Q44 64 26 40Q44 16 70 16Z'
    'M70 24Q50 24 38 40Q50 58 70 58V50Q56 50 48 40Q56 31 70 31Z"/>'
)
d, end = text('NVIDIA', 'Black', 0, 132, 40, track=3, stretch=1.15)
off = (end - 140) / 2
svg('nvidia', end, 132, f'<g transform="translate({off:.1f} 0)">{eye}</g><path d="{d}"/>')
print('ok')
