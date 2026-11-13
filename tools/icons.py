# SUPERSEDED 2026-11-13: icon-app.png is now icons/a-180.png (Will chose icon option A; built by
# node proto/icons/build.js). Running this script would put the old gradient icon back. Kept for the record.
# Single app icon (icon-app.png): the whole collection is ONE home-screen app whose
# home page is index.html, so every page shares this icon. Will's original glyph
# (tools/icon-glyph-src.png, white on flat moss) composited onto a diagonal gradient
# through the four app theme colors — teal, moss, amber, rose (cool to warm).
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

SS = 3; SIZE = 180; S = SIZE * SS
STOPS = ['#2e7d94', '#4f7d5e', '#a5762a', '#a8546b']   # flow, hip, movement, prenatal
BG = (74, 85, 72)                                       # original flat background

def hexc(s): s = s.lstrip('#'); return tuple(int(s[i:i+2], 16) for i in (0, 2, 4))

# diagonal 4-stop gradient (top-left -> bottom-right)
cols = [hexc(c) for c in STOPS]
grad = Image.new('RGB', (S, S))
gp = grad.load()
for y in range(S):
    for x in range(S):
        t = (x + y) / (2 * (S - 1)) * (len(cols) - 1)
        i = min(int(t), len(cols) - 2); f = t - i
        gp[x, y] = tuple(round(cols[i][k] + (cols[i+1][k] - cols[i][k]) * f) for k in range(3))

# glyph alpha = how far each pixel sits from the flat bg toward white
src = Image.open(os.path.join(HERE, 'icon-glyph-src.png')).convert('RGB').resize((S, S), Image.LANCZOS)
sp = src.load()
mask = Image.new('L', (S, S))
mp = mask.load()
for y in range(S):
    for x in range(S):
        p = sp[x, y]
        a = sum(max(0, min(255, round((p[k] - BG[k]) * 255 / (255 - BG[k])))) for k in range(3)) // 3
        mp[x, y] = a

white = Image.new('RGB', (S, S), (255, 255, 255))
grad.paste(white, (0, 0), mask)
grad.resize((SIZE, SIZE), Image.LANCZOS).save(os.path.join(ROOT, 'icon-app.png'))
print('icon-app.png: original glyph on 4-app-color gradient')
