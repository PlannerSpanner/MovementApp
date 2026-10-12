#!/usr/bin/env python
"""Generate the spoken-cue clips (Kokoro-82M, local, Apache 2.0) from the enumerated cue
strings, and write the manifest the build inlines into every app.

    node tools/cues.js                  # 1. enumerate every spoken string -> qa/cue-strings.json
    tools/tts-venv/Scripts/python tools/gen_cues.py [--force] [--voice af_heart]
    python3 src/rebuild.py              # 3. inlines src/cues.json; refuses if any clip is missing

Incremental: a string whose clip already exists (same engine/voice/speed policy) is kept;
new or edited strings generate only their own clip (~3 s each on CPU); --force redoes all.
Orphaned clips under audio/ are deleted. Model files (~350 MB) are cached in
%LOCALAPPDATA%/kokoro (auto-downloaded once); the venv is tools/tts-venv (gitignored):
    py -m venv tools/tts-venv && tools/tts-venv/Scripts/pip install kokoro-onnx soundfile lameenc numpy

Speed policy: 0.95 everywhere it fits (Will, 2026-10-12 — was 0.85 from 2026-09-28; the slower
speed produced a leading vowel burst on voiced-stop-initial words). A transition cue must fit
its gap minus the transition chime (0.8 s) minus the 3-2-1 ticks (3 s); if it doesn't at 0.95
it is regenerated at 1.0, and if it still doesn't the overrun is reported loudly.
"""
import argparse, hashlib, json, os, sys, time, urllib.request
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STRINGS=os.path.join(ROOT,'qa','cue-strings.json')
MANIFEST=os.path.join(ROOT,'src','cues.json')
AUDIO=os.path.join(ROOT,'audio')
ENGINE='kokoro-onnx'; MODEL='kokoro-v1.0'
CACHE=os.path.join(os.environ.get('LOCALAPPDATA',os.path.expanduser('~/.cache')),'kokoro')
RELEASE='https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
CHIME=0.8; TICKS=3.0            # seconds of the gap the cue cannot use
# No per-text overrides: the leading "e-" burst (a 40-100 ms vowel before a voiced-stop-initial
# word) is a Kokoro speed artifact — sweep over all 91 strings 2026-10-12: 11/53 detectable words
# at 0.85, 5 at 0.90, 1 at 0.95, 1 at 1.0 (that one looks clean on its spectrogram). Default
# speed is therefore 0.95 (Will, 2026-10-12). Leading pause tokens render no pause in Kokoro;
# phoneme input reproduces the burst; do not reintroduce a per-string list for this.
SPEED_OVERRIDE={}
SR_OUT=24000; KBPS=48; PEAK=0.89

ap=argparse.ArgumentParser()
ap.add_argument('--voice',default='af_heart'); ap.add_argument('--speed',type=float,default=0.95,help='default speed')
ap.add_argument('--fit',type=float,default=1.0,help='speed used when the default does not fit the gap')
ap.add_argument('--force',action='store_true'); ap.add_argument('--dry',action='store_true',help='report only')
a=ap.parse_args()

def model_files():
    os.makedirs(CACHE,exist_ok=True); paths=[]
    for f in ('kokoro-v1.0.onnx','voices-v1.0.bin'):
        p=os.path.join(CACHE,f)
        if not os.path.exists(p):
            print('downloading',f,'->',CACHE); urllib.request.urlretrieve(RELEASE+f,p)
        paths.append(p)
    return paths

def hkey(text,speed): return hashlib.sha1(f'{ENGINE}|{MODEL}|{a.voice}|{speed}|{text}'.encode('utf-8')).hexdigest()[:12]

def encode_mp3(audio,sr,path):
    import numpy as np, lameenc
    peak=float(np.max(np.abs(audio))) or 1.0
    pcm=(np.clip(audio/peak*PEAK,-1,1)*32767).astype('<i2').tobytes()
    enc=lameenc.Encoder(); enc.set_bit_rate(KBPS); enc.set_in_sample_rate(sr); enc.set_channels(1); enc.set_quality(2)
    data=enc.encode(pcm)+enc.flush(); open(path,'wb').write(data); return len(data)

strings=json.load(open(STRINGS,encoding='utf-8'))
if strings and isinstance(strings[0],str): strings=[{'text':t,'gap':None} for t in strings]
old=json.load(open(MANIFEST,encoding='utf-8')) if os.path.exists(MANIFEST) else {}
oldclips=old.get('clips',{}) if old.get('engine')==ENGINE and old.get('voice')==a.voice else {}
os.makedirs(AUDIO,exist_ok=True)
k=None
def synth(text,speed):
    global k
    if k is None:
        from kokoro_onnx import Kokoro; onnx,voices=model_files(); k=Kokoro(onnx,voices)
    audio,sr=k.create(text,voice=a.voice,speed=speed,lang='en-gb' if a.voice.startswith('b') else 'en-us')
    return audio,sr

clips={}; rows=[]; t0=time.time(); made=0
for s in strings:
    text=s['text']; gap=s.get('gap'); budget=(gap-CHIME-TICKS) if gap else None
    prev=oldclips.get(text); want=SPEED_OVERRIDE.get(text,a.speed)
    if prev and not a.force and os.path.exists(os.path.join(ROOT,prev['f'])) and prev['sp']>=want and (budget is None or prev['s']<=budget or prev['sp']>=a.fit):
        clips[text]=prev; rows.append((text,gap,prev['sp'],prev['s'],'kept')); continue
    if a.dry: rows.append((text,gap,None,None,'WOULD GENERATE')); continue
    speed=want; audio,sr=synth(text,speed); dur=len(audio)/sr; note='ok' if text not in SPEED_OVERRIDE else 'override'
    if budget is not None and dur>budget:
        speed=a.fit; audio,sr=synth(text,speed); dur=len(audio)/sr
        note='refit' if dur<=budget else f'OVERRUN by {dur-budget:.1f}s'
    fn=f'audio/{hkey(text,speed)}.mp3'; size=encode_mp3(audio,sr,os.path.join(ROOT,fn)); made+=1
    clips[text]={'f':fn,'s':round(dur,2),'sp':speed}; rows.append((text,gap,speed,dur,note))
    print(f'  {dur:5.1f}s sp={speed} {size//1024:3d}KB  {note:14} {text[:70]}')

if not a.dry:
    keep={c['f'] for c in clips.values()}
    for f in os.listdir(AUDIO):
        rel='audio/'+f
        if rel not in keep: os.remove(os.path.join(AUDIO,f)); print('  pruned',rel)
    json.dump({'engine':ENGINE,'model':MODEL,'voice':a.voice,'speed':a.speed,'fit':a.fit,
               'budget':f'gap-{CHIME}-{TICKS}','clips':clips},open(MANIFEST,'w',encoding='utf-8'),ensure_ascii=False,indent=0)
tot=sum(c['s'] for c in clips.values()); size=sum(os.path.getsize(os.path.join(ROOT,c['f'])) for c in clips.values()) if clips else 0
print(f'\n{len(clips)} clips ({made} generated, {time.time()-t0:.0f}s), {tot:.0f}s of audio, {size/1e6:.2f} MB -> {os.path.relpath(MANIFEST,ROOT)}')
print('\nSPEED TABLE (transition cues):')
for text,gap,sp,dur,note in sorted((r for r in rows if r[1]),key=lambda r:-(r[3] or 0)):
    print(f'  gap {gap:>2}s budget {gap-CHIME-TICKS:4.1f}s  clip {dur:4.1f}s @{sp}  {note:14} {text[:60]}')
over=[r for r in rows if 'OVERRUN' in (r[4] or '')]
if over: print(f'\n{len(over)} cue(s) do not fit their gap even at speed {a.fit} — listed above as OVERRUN')
