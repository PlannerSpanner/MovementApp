import hashlib, json, os, re

# Page template head: frozen snapshot of the retired Morning Movement build (the
# original template donor, app retired 2026-08-26). Amber baseline values; build()
# re-targets title/subtitle/intro/count per app below. Before 2026-08-26 this was
# read from the ALREADY-BUILT morning-movement.html — the source of the stale-stamp
# trap documented in CLAUDE.md; the regex replaces below still guard against baked
# values drifting inside this snapshot.
HEAD = open('app_head.html', encoding='utf-8').read()
# spoken-cue clip manifest (tools/gen_cues.py). Inlined whole into every app (~12 KB);
# each app prefetches only the strings it can say. Missing file => the build cannot
# know which cues exist, so refuse early with the fix spelled out.
CUES_PATH = 'cues.json'
if not os.path.exists(CUES_PATH):
    raise SystemExit('src/cues.json missing — run: node tools/cues.js && tools/tts-venv/Scripts/python tools/gen_cues.py')
CUES_JSON = json.dumps(json.load(open(CUES_PATH, encoding='utf-8'))['clips'], ensure_ascii=False, separators=(',', ':'))
TPL  = open('app_tpl.js', encoding='utf-8').read()
ENG  = open('eng2.js', encoding='utf-8').read()

def build(out, data_file, extra, title, sub, icon, theme, colors, intro, done_msg, banner=None, x2=False, trall=False):
    head = HEAD
    # one home-screen app: every page shares the same icon and web-app title, so the
    # identity is identical no matter which page gets saved. Regex (not literal) targets
    # so the current template values can never break the next rebuild.
    head = re.sub(r'<meta name="apple-mobile-web-app-title" content="[^"]*">',
                  '<meta name="apple-mobile-web-app-title" content="Movement">', head)
    head = head.replace('<title>Morning Movement</title>', f'<title>{title}</title>')
    head = re.sub(r'<link rel="apple-touch-icon" href="[^"]*">',
                  f'<link rel="apple-touch-icon" href="{icon}">', head)
    head = head.replace('<meta name="theme-color" content="#fdf7e9">',
                        f'<meta name="theme-color" content="{theme}">')
    head = head.replace('<h1>Morning Movement</h1>', f'<h1>{title}</h1>')
    head = head.replace('<div class="sub">Mobility · Control · Stability</div>',
                        f'<div class="sub">{sub}</div>')
    head = re.sub(r'<div class="cue" id="cue">.*?</div>\n', f'<div class="cue" id="cue">{intro}</div>\n', head, flags=re.S)
    # regex (not a literal-value replace): whatever count is baked into the
    # app_head.html snapshot must be matched dynamically, not against a hardcoded
    # old value — otherwise every app's badge silently keeps a stale count if the
    # snapshot's baked value ever drifts from the hardcoded literal.
    head = re.sub(r'<div class="count" id="count">–/\d+</div>',
                  '<div class="count" id="count">–/%d</div>' % colors['n'], head)
    # banner CSS must be injected BEFORE the color swaps: the swap tables rewrite
    # #c8862e, so replacing the .state-done selector after them silently misses (ROSE bug)
    if banner:
        head = head.replace('<div class="num" id="mNum">',
            f'<div class="safety">{banner}</div>\n  <div class="num" id="mNum">')
        head = head.replace('.state-done .nm{color:#c8862e}',
            '.state-done .nm{color:%s}\n.safety{font-size:0.62rem;line-height:1.5;color:%s;background:%s;'
            'border:1px solid %s;border-radius:10px;padding:7px 11px;margin-bottom:9px;text-align:left}'
            '.safety strong{color:%s}' % (colors['accent'], colors['warnText'], colors['warnBg'],
                                          colors['warnBorder'], colors['warnStrong']))
    for a, b in colors['css']:
        head = head.replace(a, b)
    body = TPL
    # theme the figure: explicit INK/LIMB_L/TORSO map per theme \u2014 the head css table
    # has duplicate source hexes, so it must not be reused here (identity roles stay
    # static per app \u2014 see CLAUDE.md)
    for a, b in colors.get('fig', []):
        body = body.replace(a, b)
    if x2:
        body = body.replace('const X2OPT=false;', 'const X2OPT=true;')
    assert body.count('const CUES={};   // replaced at build time') == 1
    body = body.replace('const CUES={};   // replaced at build time', 'const CUES=' + CUES_JSON + ';')
    # authored-transition mode (Daily 10): gaps before every movement + prop-aware
    # camera fit. Two consts flip together — the app that wants one wants both.
    if trall:
        body = body.replace('const TR_ALL=false;', 'const TR_ALL=true;')
        body = body.replace('const PROPFIT=false;', 'const PROPFIT=true;')
    # app_tpl.js contains the LITERAL 6-character JS escape text \u2013 (not a real
    # en-dash character), so match that literal text directly rather than a Python
    # string with a decoded unicode escape (which would never match the source bytes).
    body = re.sub(r"'\\u2013/\d+'", "'\\\\u2013/%d'" % colors['n'], body)
    body = re.sub(r"\$\('cue'\)\.innerHTML='<strong>Done\.</strong>[^;]*;",
                  "$('cue').innerHTML=%s;" % json.dumps(done_msg, ensure_ascii=False), body)
    body = re.sub(r"(\$\('bReset'\)\.onclick[\s\S]*?)\$\('cue'\)\.innerHTML='<strong>Morning Movement</strong>[^;]*;",
                  lambda m: m.group(1) + "$('cue').innerHTML=%s;" % json.dumps(intro, ensure_ascii=False), body)
    html = head + '<script>\n' + open(data_file, encoding='utf-8').read() + '\n' + ENG + '\n' + extra + '\n' + body + '</script>\n</body>\n</html>\n'
    # build stamp for the launch-time freshness check (deterministic: hash of the
    # unstamped content, so unchanged sources still rebuild byte-identical)
    ver = hashlib.sha1(html.encode('utf-8')).hexdigest()[:10]
    html = html.replace('<script>\n', "<script>\nconst BUILDV='%s';\n" % ver, 1)
    open(out, 'w', encoding='utf-8', newline='\n').write(html)
    return html
