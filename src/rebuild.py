import os; os.chdir(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(os.getcwd())  # repo root — built HTML lives there for GitHub Pages
# Build into a staging dir first: tools/cues.js --check enumerates every spoken string
# from the freshly built pages and verifies each has a clip; only then are the pages
# installed into the repo root. A missing clip therefore never reaches GitHub Pages.
import tempfile, shutil, subprocess, sys
OUT = tempfile.mkdtemp(prefix='movement-build-')
exec(open('build.py', encoding='utf-8').read())
BLUE=dict(n=13,accent='#2e7d94',
 fig=[('#6d4f1c','#245e70'),('#c2a473','#93b8c4'),('#7d5a1e','#2e7d94')],css=[
 ('#fdf7e9 0%,#fdf0dc 45%,#f4f3e3 100%','#eef6f8 0%,#e6f0f5 45%,#eaf2ee 100%'),
 ('#a5762a','#2e7d94'),('#a4947a','#8aa2ab'),('#bd8629','#3f96ae'),('#7d5a1e','#245e70'),
 ('#9c8b6d','#7d97a0'),('#f0e5cd','#d9e8ee'),('#dd9a3c','#3f96ae'),('#ecca8e','#a8cdd9'),
 ('#665c48','#4a626b'),('#4a4237','#33474e'),('#c8862e','#2e7d94'),
 ('rgba(144,127,97,0.16)','rgba(70,110,125,0.16)'),('rgba(165,118,42,0.22)','rgba(46,125,148,0.22)'),
 ('rgba(221,154,60,0.3)','rgba(63,150,174,0.3)'),('rgba(221,154,60,0.15)','rgba(63,150,174,0.15)'),
 ('rgba(221,154,60,0.45)','rgba(63,150,174,0.45)'),('rgba(221,154,60,0.5)','rgba(63,150,174,0.5)'),
 ('rgba(180,140,60,0.3)','rgba(63,150,174,0.3)'),('#e8dcc0','#d3e4ea'),
 ('#6d4f1c','#245e70'),('#c2a473','#93b8c4'),('#7d5a1e','#2e7d94'),('#caac79','#9dc2cd')])
ROSE=dict(n=10,accent='#a8546b',
 fig=[('#6d4f1c','#7d3f53'),('#c2a473','#cfa8b3'),('#7d5a1e','#a8546b')],
 warnText='#8f4550',warnBg='rgba(214,110,120,0.11)',
 warnBorder='rgba(214,110,120,0.3)',warnStrong='#7d353f',css=[
 ('#fdf7e9 0%,#fdf0dc 45%,#f4f3e3 100%','#fdf4f1 0%,#fbecf1 42%,#f1eefa 100%'),
 ('#a5762a','#a8546b'),('#a4947a','#a98b95'),('#bd8629','#c4657f'),('#7d5a1e','#7d3f53'),
 ('#9c8b6d','#a1808b'),('#f0e5cd','#f2dfe4'),('#dd9a3c','#d9788f'),('#ecca8e','#e8b6c4'),
 ('#665c48','#6b555d'),('#4a4237','#4c3d43'),('#c8862e','#c4657f'),
 ('rgba(144,127,97,0.16)','rgba(150,115,127,0.16)'),('rgba(165,118,42,0.22)','rgba(168,84,107,0.2)'),
 ('rgba(221,154,60,0.3)','rgba(217,120,143,0.28)'),('rgba(221,154,60,0.15)','rgba(217,120,143,0.14)'),
 ('rgba(221,154,60,0.45)','rgba(217,120,143,0.45)'),('rgba(221,154,60,0.5)','rgba(217,120,143,0.45)'),
 ('rgba(180,140,60,0.3)','rgba(190,120,140,0.3)'),('#e8dcc0','#f0dde3'),
 ('#6d4f1c','#7d3f53'),('#c2a473','#cfa8b3'),('#7d5a1e','#a8546b'),('#caac79','#dcbcc4')])
A11=dict(n=12,accent='#a5762a',warnText='#8d5326',warnBg='rgba(214,140,70,0.12)',
 warnBorder='rgba(214,140,70,0.32)',warnStrong='#7a441c',css=[])
VIOLET=dict(n=13,accent='#6b5ca8',
 fig=[('#6d4f1c','#453a70'),('#c2a473','#b0a6d4'),('#7d5a1e','#6b5ca8')],css=[
 ('#fdf7e9 0%,#fdf0dc 45%,#f4f3e3 100%','#f4f2fb 0%,#ece9f8 45%,#efeef6 100%'),
 ('#a5762a','#6b5ca8'),('#a4947a','#948aa8'),('#bd8629','#7d6bbd'),('#7d5a1e','#4a3f78'),
 ('#9c8b6d','#8d84a0'),('#f0e5cd','#e6e2f2'),('#dd9a3c','#8a76cf'),('#ecca8e','#c3b8e8'),
 ('#665c48','#55506b'),('#4a4237','#3d3852'),('#c8862e','#7a68c0'),
 ('rgba(144,127,97,0.16)','rgba(122,110,160,0.16)'),('rgba(165,118,42,0.22)','rgba(107,92,168,0.22)'),
 ('rgba(221,154,60,0.3)','rgba(138,118,207,0.3)'),('rgba(221,154,60,0.15)','rgba(138,118,207,0.15)'),
 ('rgba(221,154,60,0.45)','rgba(138,118,207,0.45)'),('rgba(221,154,60,0.5)','rgba(138,118,207,0.5)'),
 ('rgba(180,140,60,0.3)','rgba(138,118,207,0.3)'),('#e8dcc0','#ddd8ec'),
 ('#6d4f1c','#453a70'),('#c2a473','#b0a6d4'),('#7d5a1e','#6b5ca8'),('#caac79','#b8addc')])
BAN=("<strong>Listen to your body.</strong> Ease off anything that feels sharp or wrong, "
     "and mention it to your provider. Breathe continuously — never hold your breath "
     "or bear down.")
build(os.path.join(OUT,'morning-flow.html'),'d_flow.js',open('x_flow.js',encoding='utf-8').read(),
 'Morning Flow','Dynamic Qi Gong · Targeted Rehab','icon-app.png','#eef6f8',BLUE,
 '<strong>Morning Flow</strong> runs about 13½ minutes: eight standing movements, continuous and rhythmic, then a five-movement ground finish. Each movement gets its own set-up countdown. Every one does double duty: it feels like a workout and targets a specific weak point.',
 '<strong>Done.</strong> Thoracic spine mobilised, serratus fired, hips open, needle threaded, cobra charmed. Go get it.',trall=True)
# Morning Movement retired 2026-08-26: movements redistributed to Morning Flow and
# Daily 13; leftovers archived in src/d_retired.js (data2.js/mm_extra.js kept intact).
# The page template head that app once donated is frozen as src/app_head.html.
build(os.path.join(OUT,'prenatal-stretch.html'),'d_stretch.js',open('x_stretch.js',encoding='utf-8').read(),
 'Prenatal Stretch','Gentle · Stretch & Release','icon-app.png','#fdf4f1',ROSE,
 '<strong>Prenatal Stretch</strong> runs about 10 minutes. Every position is seated, hands-and-knees, or standing with support — no lying flat on the back, no inversions, no balance challenges. Breathe continuously throughout.',
 '<strong>Done.</strong> Stretch goals: met. Butterflies earned. Sip some water.',banner=BAN)
build(os.path.join(OUT,'prenatal-movement.html'),'d_birth.js',open('x_birth.js',encoding='utf-8').read(),
 'Birth Prep','Pelvic mobility · Floor release','icon-app.png','#fdf7e9',A11,
 '<strong>The idea:</strong> for perineal tearing, the ability to <em>relax and lengthen</em> the pelvic floor matters more than strength. This trains release and coordination, plus the hip and adductor mobility that lets the pelvic outlet open.',
 '<strong>Done.</strong> Clamshells opened, hips rocked and rolled. You’re on the ball.',banner=BAN,x2=True)
build(os.path.join(OUT,'daily-13.html'),'d_daily.js',open('x_daily.js',encoding='utf-8').read(),
 'Daily 13','Posture · Pull · Reset','icon-app.png','#f4f2fb',VIOLET,
 '<strong>Daily 13</strong> runs about 12 minutes: postural maintenance, not training — nothing near failure, no recovery cost next to the Wed/Sat strength block. The theme is anterior-tilt correction. Hard rules: no pressing below parallel and nothing behind the neck (right AC joint); all pulling neutral or overhand, never underhand (bicep tendon rehab); no jumping or lateral bounding (right peroneal tendon). Each movement gets its own set-up countdown. Start standing, feet shoulder width.',
 '<strong>Done.</strong> Squats sunk, bugs dead, bridges built, posture reset. Carry yourself accordingly.',trall=True)
# daily-10.html lives on as a redirect stub (the app was renamed Daily 13): old
# home-screen bookmarks land here, the freshCheck in any cached copy still finds a
# BUILDV stamp (regex needs [0-9a-f]+), reloads once, and gets bounced to daily-13.
_rd = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Movement">
<link rel="apple-touch-icon" href="icon-app.png">
<meta name="theme-color" content="#f4f2fb">
<title>Daily 13</title>
<meta http-equiv="refresh" content="0;url=daily-13.html">
</head>
<body>
<script>
const BUILDV='%s';
location.replace('daily-13.html');
</script>
<p style="font-family:sans-serif;padding:24px"><a href="daily-13.html">Daily 10 is now Daily 13 &#8594;</a></p>
</body>
</html>
"""
import hashlib as _hl
_rv = _hl.sha1((_rd % '').encode('utf-8')).hexdigest()[:10]
open(os.path.join(OUT,'daily-10.html'),'w',encoding='utf-8',newline='\n').write(_rd % _rv)
# strength.html — scrollable two-workout strength reference. Separate template
# (wk_head.html + wk_tpl.js): no timer, no audio; same engine, same BUILDV scheme.
import hashlib, re as _re
_wk_head = open('wk_head.html', encoding='utf-8').read()
_wk_js = '\n'.join(open(f, encoding='utf-8').read() for f in
                   ('d_wka.js', 'd_wkb.js', 'eng2.js', 'wk_tpl.js'))
_wk = _wk_head.replace('</body>', '<script>\n' + _wk_js + '</script>\n</body>', 1)
_wv = hashlib.sha1(_wk.encode('utf-8')).hexdigest()[:10]
_wk = _wk.replace('<script>\n', "<script>\nconst BUILDV='%s';\n" % _wv, 1)
open(os.path.join(OUT, 'strength.html'), 'w', encoding='utf-8', newline='\n').write(_wk)

# hip-activation.html is not built from src, but its CUES manifest is stamped here
_hp = os.path.join(ROOT, 'hip-activation.html')
_hs = open(_hp, encoding='utf-8').read()
_hn = _re.sub(r"const CUES=\{.*?\};(   // replaced at build time)?\n", "const CUES=" + CUES_JSON + ";\n", _hs, count=1, flags=_re.S)
assert _hn.count('const CUES=') == 1
if _hn != _hs:
    open(_hp, 'w', encoding='utf-8', newline='\n').write(_hn)

# refuse-on-missing: every string the built pages can speak must have a clip
_chk = subprocess.run(['node', os.path.join(ROOT, 'tools', 'cues.js'), '--check', '--dir', OUT],
                      capture_output=True, text=True, encoding='utf-8')
_tail = '\n'.join(l for l in (_chk.stdout + _chk.stderr).splitlines() if 'WARN' in l or 'MISSING' in l or 'CHECK' in l or 'note:' in l)
if _chk.returncode != 0 and not _tail:   # the checker itself crashed: show why, never a blank refusal
    _tail = (_chk.stdout + _chk.stderr).strip()[-1500:]
if _chk.returncode != 0 and not os.environ.get('SKIP_CUE_CHECK'):
    shutil.rmtree(OUT, ignore_errors=True)
    raise SystemExit('REBUILD REFUSED — cue clips missing:\n' + _tail + '\n(fix: node tools/cues.js && tools/tts-venv/Scripts/python tools/gen_cues.py; or SKIP_CUE_CHECK=1 to bootstrap)')
print(_tail)
for _f in os.listdir(OUT):
    shutil.copyfile(os.path.join(OUT, _f), os.path.join(ROOT, _f))
shutil.rmtree(OUT, ignore_errors=True)

# stamp index.html too (hand-edited, so the stamp is refreshed here; deterministic:
# hash of the content with an emptied stamp, idempotent across rebuilds)
_ip = os.path.join(ROOT, 'index.html')
_s = open(_ip, encoding='utf-8').read()
_z = _re.sub(r"BUILDV='[0-9a-f]*'", "BUILDV=''", _s, count=1)
_v = hashlib.sha1(_z.encode('utf-8')).hexdigest()[:10]
_ns = _re.sub(r"BUILDV='[0-9a-f]*'", "BUILDV='%s'" % _v, _s, count=1)
if _ns != _s:
    open(_ip, 'w', encoding='utf-8', newline='\n').write(_ns)
print("built")
