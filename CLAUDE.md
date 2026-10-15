# Movement App — stick-figure exercise timers

Four single-file HTML exercise timer apps with animated 3D stick-figure demonstrations,
deployed to GitHub Pages at https://plannerspanner.github.io/MovementApp/
(repo `PlannerSpanner/MovementApp` — username lowercase in URL, repo capitalized).
Built for iPhone Safari (wake lock + Add to Home Screen require Safari, not Chrome).

Apps: `morning-flow` (Morning Flow — 13-move qi gong warmup: 8 standing + 5-move ground
finish, TR_ALL authored transitions incl. an explicit 15s "get on the ground" gap (5s until
2026-10-15), 805s (cobra 40s since 2026-10-15);
seven poses rebuilt 2026-10-12 per Will's spec — Hip circles became the single-leg hip
CAR "Single-leg hip circles", Folded cat-cows became the quadruped "Cat-cows"; the old
poses are archived in d_retired.js),
`prenatal-stretch` (Prenatal Stretch, 10 moves), `prenatal-movement` (Birth Prep, 11 moves),
`daily-13` (Daily 13 — 13-move postural maintenance timer, violet theme, dumbbells/bench
props, authored per-movement transitions via TR_ALL, exactly 715s; renamed from Daily 10
2026-08-26 — `daily-10.html` is a BUILDV-stamped redirect stub for old bookmarks, written
by rebuild.py),
`strength` (two-workout gym REFERENCE — no timer/audio; scrollable cards, tabs A/B +
set checks persisted in localStorage, own template `wk_head.html`+`wk_tpl.js`, green theme).
Set checks are day-stamped (`wkChk.day`, LOCAL calendar date, pure `freshChecks` above
the DOM marker): a different day clears them on load, and a FULLY-checked workout clears
on its next same-day load (done = next visit is a new session); partial same-day checks
survive phone lock. Manual reset button kept. Legacy unstamped data starts fresh.
Also `hip-activation.html` — older layout, no figures, timer already timestamp-patched. Leave unless asked
(exception: it carries the same audio path inline — clip player, keep-alive, panel — and
rebuild.py stamps its CUES manifest).
Morning Movement RETIRED 2026-08-26: its movements were redistributed (5 → Flow's ground
block, 3 → Daily 13); the rest are archived — NOTHING deleted — in `src/d_retired.js`
(+ `data2.js`/`mm_extra.js` kept intact) and documented in docs/movement-reference.md
under "Retired — available for future versions".

## Build

    python3 src/rebuild.py     # stamps all four timer apps + strength + the daily-10
                               # redirect stub from src/ into the output dir

Everything is inlined: engine + template + data + cues → one self-contained HTML per app
(plus the spoken-cue MP3s under `audio/`, referenced by the inlined manifest). rebuild.py
builds to a staging dir and refuses to install if any spoken string has no clip.
Edit sources, never the built HTML. `rebuild.py` holds per-app themes (hex swap tables),
intros, and movement counts. Adjust its output path for this repo (was /mnt/user-data/outputs).

## Source map (src/)

- `eng2.js` — 3D skeleton solver. Pose schema: `{p:[x,y,z], yaw, tw, sl, s:[s0,s1], hf,
  aL/aR:[flex,abd,flex,abd] (absolute angles), lL/lR (legs, same), ikL/ikR (arm IK: {k:'jointName'}
  or {w:[x,y,z]}), ikFL/ikFR (foot IK world targets), swL/swR (knee swivel deg about hip→ankle axis)}`.
  Coordinates: y DOWN, floor at y=93, canvas 0–100. Limb segments 19 (leg) / 13 (arm/spine),
  foot 6.4. `sl` = lateral spine bend. Feet: sagittal-plane perpendicular + floor clamp
  (flat when planted, trails shin when kneeling).
  - `tw` is a torso twist about the LOWER-SPINE AXIS (pelvis→chest), not the world
    vertical (changed 2026-10-12). Upright the two coincide (shoulder yaw); hinged or on
    all fours it is a true thoracic ROLL — one shoulder rises, the other drops (bent
    rotation sweeps, thread the needle). Sign: tw>0 raises the right shoulder when the
    torso is horizontal; upright, tw>0 pulls the right shoulder BACK. Chest→neck carries
    45%, head/shoulders/FK arms the full angle. FK arm angles are body-frame BEFORE the
    roll: an arm abducted 60° becomes vertical under a 60° roll (windmill bottom hand).
  - `bend` (added 2026-10-15) = spine curvature in degrees of arc, + flexion/rounding,
    − extension/arching. Blends like `tw`. It NEVER moves a joint: `torsoEdges()` in
    eng2.js bows the torso's two hip→shoulder side edges along the trunk's rear (flexion)
    or front (extension) normal by the arc's sagitta, and figMarkup (app_tpl AND wk_tpl)
    draws them as a `<path>` only when bend ≠ 0 — zero/absent bend emits the legacy
    `<polygon>` byte-for-byte (verified over every frame of all five apps). Used by
    Cat-cows (+60/−50), Cobra (−45), Bent rotation sweeps' M (+45). Candidates: thread
    the needle, wide-knee child's pose.
  - `orb` modes: `{hips:true,rx,rz,ry}` pelvis circle (feet pinned), `{swivel:true,amp}`
    knee circles, `{leg:'R'|'L',fB,fA,aB,aA,knee?}` single-leg hip CAR — that leg's thigh
    traces a cone from the phase, knee ~90° (shin follows the thigh), the other leg keeps
    its planted target. `{leg,alt:true}` (2026-10-15) ALTERNATES legs within one cycle:
    first half = `leg`'s orbit from the floor and back (four thigh stations
    down/behind/out/front on a periodic Catmull-Rom spline; the down station is fitted so
    the straight leg's foot lands exactly on base's `ikF` target — both feet need targets),
    second half = the other leg mirrored. Only `A` is used by orbital movements. A
    bilateral `orb.leg` movement is cued/badged like a sided move ("Start with your right
    side." / "Switch sides."); `orb.alt` and the other orbits say "Change direction."
    (`dirOnly()` in app_tpl.js).
  - Arm IK with a joint key (`{k:"shL"}`) can't blend — `lerpT` returns it unchanged
    for an entire blend segment, so the hand stays pinned for the whole half and pops
    at the crossover. Any movement with an `M` keyframe must use world-point targets
    (`{w:[x,y,z]}`) at the solved joint positions instead.
  - Limb abduction is body-frame, applied before yaw. A cross-midline movement's
    screen-space read depends on both abd and the movement's yaw — at some yaws they
    cancel exactly. Always verify crossing movements at their actual yaw rather than
    assuming abd alone puts the limb across.
  - Arms have optional IK swivels `swAL`/`swAR` (same semantics as leg swL/swR,
    undefined = legacy behavior). Both wk_tpl.js AND app_tpl.js blend them now. Like the
    legs, the cones are asymmetric: fit each side numerically (row uses swAR 80 with
    swAL untouched; chest row −100/+80; wall slide (retired) −85/+100, dips ±150).
- `app_tpl.js` — shared app body: renderer, timers, audio. Key facts:
  - Timer is wall-clock anchored (`segEnd`); survives backgrounding, catches up on return.
  - SPOKEN CUES ARE PRE-GENERATED CLIPS, NOT WEB SPEECH (decided by Will 2026-09-28 after a
    two-week on-device investigation; the WHY is recorded below). Kokoro-82M (Apache 2.0,
    local, free) voice `af_heart`, MP3 48 kbps mono under `audio/<hash>.mp3`, manifest
    `src/cues.json` (text -> {f, s: seconds, sp: speed}), inlined whole into every app as
    `CUES` by build.py (rebuild.py also stamps it into hip-activation.html). `say(t)` looks
    the text up, decodes the clip on the SAME AudioContext as the chimes and schedules an
    AudioBufferSource on the audio clock: `max(now+0.02, chimeEndAt+0.04, cueEndAt)` --
    right after the chime tail, never over the previous cue. Chime sequences call
    `hold(secs)` up front so chimeEndAt covers the whole sequence. Clips prefetch at load
    (HTTP cache) and decode at the Start tap. No clip -> `[voice] no clip for ...` warning,
    cue skipped, timer unaffected. Speech is never scheduled by setTimeout any more.
    CUE WORKFLOW: edit names/setups/posCues in d_*.js -> `npm run cues` (= `node
    tools/cues.js`, the enumerator and THE source of truth: drives every built app end to
    end through the `window.__onSay` seam; then `node tools/gen_cues.js`, a launcher that
    finds the venv interpreter on any OS -- cmd.exe could not run the forward-slash venv
    path, fixed 2026-10-15 -- and runs `tools/gen_cues.py`, which generates only the
    missing clips, prunes orphans, rewrites the manifest) -> `python3 src/rebuild.py`
    (builds to a staging dir, runs `tools/cues.js --check`, REFUSES to install if any
    spoken string lacks a clip; `SKIP_CUE_CHECK=1` only to bootstrap) -> commit the new
    mp3s + manifest with the change. One edited cue = one clip (~3 s CPU); new voice or
    speed = all 91 (~1 min). Needs `tools/tts-venv` (gitignored: `py -m venv
    tools/tts-venv && tools/tts-venv/Scripts/pip install kokoro-onnx soundfile lameenc
    numpy`; kokoro-onnx runs on Python 3.14, the torch build does not) and the model
    files, auto-downloaded once to %LOCALAPPDATA%/kokoro (~350 MB, never in the repo).
    PUNCTUATION RULE (Will, 2026-10-12): EVERY spoken string ends in terminal punctuation --
    Kokoro renders an unpunctuated string ("Hip circles", "Switch sides") with a rising,
    question-like contour. cueFor() appends "." to bare movement names; "Switch sides." /
    "Change direction." carry theirs. `spokenName()` in app_tpl.js reshapes spellings that
    read fine on screen but not aloud ("90/90" -> "90 90", else Kokoro says "ninety SLASH
    ninety"; "Y-T-W" -> "Y T W", else one run-together word) -- display text untouched.
    Setup scripts use sentence punctuation, not em-dashes or colons mid-sentence. Check a
    new string's phonemes with the kokoro-onnx Tokenizer before trusting how it reads.
    LEADING "e-" BURST (class of bug, found 2026-10-12): at speed 0.85 Kokoro prepends a 40-100 ms
    full-level vowel before voiced-stop-initial words (Glute bridge, Switch sides, Dead bug...).
    Sweep over all 91 strings: 11/53 detectable words at 0.85, 5 at 0.90, 1 at 0.95, 1 at 1.0.
    Leading pause tokens render NO pause in Kokoro and phoneme input reproduces it, so the fix is
    the default speed (0.95), never a per-string list. Detector + sweep tooling under audition/
    (gitignored). PROSODY: Kokoro exposes no pitch/duration/per-word control; stress and length
    marks in phoneme input do nothing to the closing contour; the style-vector row lowers the
    closing word but slows every clip ~30% -- Will's decision 2026-10-12: baseline is fine, skip.
    SPEED POLICY: 0.95 everywhere it fits (was 0.85 until 2026-10-12); a transition cue must fit its gap minus the
    chime (0.8 s) minus the 3-2-1 ticks (3 s) -- 6.2 s in a 10 s gap, 11.2 s in 15 s -- else
    it is refit at 1.0; remaining overruns print as OVERRUN and the checker WARNs. As of
    2026-09-28 three overrun: Cat-cows (Flow's authored 5 s ground gap, ~5.7 s clip; was Folded cat-cows),
    Side-lying clamshell (+0.7 s), Side plank (+0.1 s) -- Will's decision 2026-09-30:
    leave all three as they are, not noticeable in use (a cue overlapping the ticks
    mixes, it does not cut). Since 2026-10-15 the ground gap is 15 s, so only the two
    Daily 13 overruns remain. Device-verified 2026-09-30: full Morning Flow session,
    silent mode on, phone speaker, every cue and chime audible.
    WHY (keep -- it is the platform record): iOS Safari speechSynthesis.speak() activates
    the system synthesizer's own audio session; WebKit drops the page's AudioContext to
    'interrupted' mid-utterance and it never comes back without resume() (Apple forums
    FB14444620: AVSpeechSynthesizer never deactivates/notifies). With the keep-alive media
    element active the fight reverses: utterances stall mid-speech and never END. No
    page-level control exists. Whichever API fires first wins -- so there is only one now.
    STILL TRUE FOR WEB AUDIO: (a) a bare AudioContext gets the 'ambient' session, muted
    by the ring/silent switch; an active HTMLMediaElement (or navigator.audioSession
    'playback', set BEFORE the context is created) moves it to 'playback' -- `audioKeepAlive`
    (silent looping WAV: inline data URI first, repo-root silent.wav second; restarts
    itself since some WebKit ports don't loop) runs inside the Start/Resume tap and on
    foreground return, pauses on Pause/Reset and 6 s after the finish cues. (b) resume()
    is WebKit's lever for BOTH 'suspended' and 'interrupted' -- `acResume()` before every
    chime/cue and in the tap. (c) every audio call is try/catch: no audio API may ever
    block the timer. (d) `audioSession.state` is unimplemented in Safari ('auto/?' is
    normal). Playwright's Windows WebKit has no AudioContext and rejects data: media.
    ON-DEVICE DIAGNOSTICS PANEL: `?debug=1` or 5 quick taps on the title (works in the
    home-screen build). Strictly passive (reads + event listeners only; probes are
    tap-only): clip stats, AC state/sampleRate/latency, audioSession, keep-alive, every
    cue's scheduled offset vs the chime tail, Copy log / Share log. qa/voice.js (fake DOM:
    iOS-shaped interrupted context, fetch failure modes, scheduling, no speechSynthesis
    left) + qa/webkit-voice.js (real MP3 decode + scheduling in Chromium; WebKit runs the
    page and the keep-alive fallback) + `tools/cues.js --check` are in the gauntlet.
    "ALLOW BACKGROUND MUSIC" SETTING (2026-10-12; checkbox under the nav row in all 5
    speaking apps, localStorage `mvBgMusic`, one value for the whole origin, flips live
    mid-session). WebKit maps Audio Session types to AVAudioSession categories
    (DOMAudioSession.cpp): playback -> MediaPlayback (silent-switch immune, EXCLUSIVE: pauses
    Spotify for the run and iOS never resumes it); transient AND ambient -> Ambient (mixes
    with other apps, no ducking, silenced by the silent switch AND screen lock);
    transient-solo -> SoloAmbient (interrupts AND muted). Nothing on the web both mixes
    and survives the switch (that is Playback+mixWithOthers, not exposed). OFF (default) =
    'playback' + keep-alive, the proven path. ON = 'transient' and NO keep-alive: a playing
    media element is itself what makes WebKit claim MediaPlayback, and under Ambient it buys
    nothing. Engaging the keep-alive only around cues cannot work: each Playback activation
    interrupts Spotify again. qa/voice.js + qa/webkit-voice.js assert both states.
    RULE FOR FUTURE FEATURES: anything that plays a sound must go through the shared
    AudioContext (chime() / say()) so it is gesture-unlocked, session-covered and
    clock-scheduled with everything else. New spoken text = run `npm run cues`.
    Guards: qa/voice.js (fake DOM, empty voice list, absent API, all 5 speaking apps)
    + qa/webkit-voice.js (Playwright WebKit — stubs Web Speech, which Windows WebKit
    lacks — and Chromium). Neither is a substitute for a real-iPhone check.
  - The timer walks `SEGS`, derived from MOVES at load: an 8s `{trans:true}` "GET SET UP"
    segment is inserted wherever consecutive movements' `pos` tags differ (a gap's `m` is
    the UPCOMING movement, so the figure previews it). Voice speaks the position phrase
    (`POS_CUE` map; per-movement `posCue` overrides). Gaps are never bilateral, never 2×-
    multiplied (`sdur`), and invisible to dots/counts/prev-next (`segOfMove`). qa/trans.js
    guards all of this.
  - Movements: `{n, pos, posCue?, setup?, tdur?, cue, dur, bil, cyc, pin, belly, cam, prop,
    orb, A, B, M?}`. `M` = optional mid-keyframe (path A→M→B→M→A). `pin:'LR'` nails feet at
    their frame-A spots. `orb` = orbital pose (hip circles). `cam` = per-movement camera yaw
    (default 40). Props use the same system as wk_tpl (ported 2026-08-12): points may be
    world `[xyz]`, joint names, `{j,o}`, `{m:[..],o}`; shapes `{l}`, `{c}` (+`f:1`),
    `{db:[P,P,r]}` dumbbell — joint-referenced props re-resolve every frame. Rendering
    is a pure `figMarkup` (above the `const layer=` slice line, so qa/geo/lint can eval
    it); `drawFig` is a thin DOM writer over it.
  - Build-time consts (flipped together by build.py's `trall=True` — daily-13 AND
    morning-flow since 2026-08-26):
    `TR_ALL` — a GET SET UP gap precedes EVERY movement (dur `m.tdur||10`), voiced
    "Next: <name>. <m.setup>", figure holds the upcoming A keyframe statically, wrap gets
    `.state-trans` (tan countdown, dimmed figure), gaps end with a 520 Hz 3-2-1 triple tick
    (work keeps the single 380 Hz tick at 3s). `PROPFIT` — fitOf includes prop extent in
    the camera frame (off for legacy apps so their framing never shifts).
  - Colors are STATIC identity roles: INK (right limbs, head, neck), LIMB_L (left limbs, lighter),
    TORSO (quad + belly). Hues are themed per app by build.py's swap tables (blue flow, rose
    prenatal-stretch, amber elsewhere) but roles never change within an app. No depth-based
    color changes — that was removed deliberately.
  - Belly: polygon that morphs full-circle (facing viewer) → half-disc flat on the trunk (profile),
    driven by the projected foreshortening of the trunk-front vector. Never re-add a hard mode switch;
    it pops mid-animation.
  - Bilateral moves mirror the figure at the halfway "switch sides" chime (layer transform).
  - Depth sorting = painter's algorithm on projected d (larger d = nearer = drawn later).
    World-fixed props paint first (behind everything — legacy framing); joint-ATTACHED
    props (held implements) join the sort floored just in front of the torso quad, so a
    dumbbell can never vanish behind the body (fixed 2026-08-12; qa/daily.js + qa/wk.js
    hard invariants, same rule in wk_tpl.js).
- `d_flow.js` / `d_stretch.js` / `d_birth.js` / `d_daily.js` — pose data per app.
- `x_*.js` — expandable cue text per movement (keys = movement names; a missing key is a
  runtime TypeError — smoke.js catches it).
- `app_head.html` — frozen page-template head (was bootstrapped from the built
  morning-movement.html until that app retired). `d_retired.js` — retired-movement
  archive, NOT built. `data2.js` + `mm_extra.js` — archived Morning Movement app, NOT built.
- `wk_head.html` + `wk_tpl.js` + `d_wka.js`/`d_wkb.js` — the strength reference app.
  wk_tpl's pure section (everything above the `// ---- DOM ----` marker) is what
  qa/wk.js evals — keep computation above that line. Its prop system extends the
  timer apps': points may be joint names (`'haL'`), `{j:'haR',o:[body-frame offset,
  rotated by pose yaw]}`, or `{m:['haL','haR'],o:...}` midpoints — joint-referenced
  props re-resolve every frame so implements can't drift out of the hands (qa/wk.js
  asserts it). New `{db:[P,P,r]}` primitive = handle line + filled end plates
  (dumbbell/barbell); `{c:[P,r],f:1}` = filled circle (plate). All cards share one
  rAF loop; only IntersectionObserver-visible cards redraw, but every card is
  painted once at load (blank-below-the-fold bug otherwise).

## Non-negotiable QA gauntlet (run before every commit)

    npm run gauntlet   # cues --check + smoke + lint + geo + wk (strength invariants) + daily (Daily 13
                       # form invariants: dips parallel stop, dead-bug flat back, bridge
                       # line, clamshell heels welded, side-plank line, bird-dog flat
                       # back, held dumbbells in front of torso, 715s) + flow (Morning
                       # Flow invariants: bend never moves a joint / zero bend = legacy
                       # polygon, cat rounds + cow arches, cobra 40s + arch, windmill
                       # both-hands-down crossover, hip circles alternate legs from the
                       # floor, chest opener behind the frontal plane, lateral reaches
                       # arc sideways at cyc 4.4, 15s ground gap, 805s) + Playwright:
                       # shots (incl. index),
                       # wkshots (strength cards + set checks), dailyshots (every Daily 13
                       # movement + transition), flowshots (every Morning Flow movement +
                       # the 15s ground transition), catchup, trans (legacy gaps on
                       # prenatal-stretch + TR_ALL blocks for flow/daily-13),
                       # breath tones, 2x toggle, auto-update freshness, voice
                       # (pre-generated cue clips: scheduling, decode, failure modes,
                       # all 5 apps, fake DOM + WebKit + Chromium; needs `npx playwright install webkit`)
    npm run cues       # after editing any spoken text: enumerate strings + generate missing clips
    node tools/dump.js && python3 tools/strips.py   # fallback PIL contact sheets (needs Pillow)
    python3 tools/ascii.py <app> "<movement>" 0,3    # text-mode pose render
    node tools/phases.js morning-flow "thread" [--ph=0,0.125,...]   # figure-only PNG strip per
                       # movement at phases 0/.25/.5/.75 -> qa/screenshots/phases/. THE look step
                       # for pose work: several Flow poses failed BETWEEN keyframes (2026-10-12)

Hard-won lessons encoded in these tools:
- Parse-only checks miss runtime ReferenceErrors → smoke.js is mandatory.
- Numeric invariants miss gestalt errors (feet never drawn, "alien" legs, belly-as-hips)
  → always LOOK at renders. In Claude Code, replace/augment strips with real Playwright
  screenshots of the served pages. Look at phases BETWEEN the keyframes too
  (tools/phases.js): a pose can be right at A and B and wrong in the blend (an FK arm
  sweeping under a quadruped shoulder passed through the floor mid-blend; an arm lerped
  through the camera axis looked retracted). Two keyframes with different IK/FK
  representations for the same limb do not blend at all (lerpT pins the IK one).
- Camera vs. read: a punch/reach that must read as LONG needs its direction near the
  screen plane — screen extent = sin(facing + 40°); with ±tw both ways the only symmetric
  choice is facing the camera (yaw −40). A 3/4 view foreshortens one side into the lens.
- Screen-space matters more than world-space for readability (clamshell swivel was tuned
  against projected knee motion, not world lift).
- Left/right swivel cones are asymmetric — never mirror a swivel by sign-flip; re-fit numerically.
- Movement fidelity is research-anchored: squats hit ankle 90°→65° with tibia∥torso,
  lunge front shin vertical + back knee hover, clamshell heels welded, 90/90 is a Z-sit, etc.
  The canonical form source for ALL movements (setup, sequence, direction, side protocol,
  anchors, faults, what the figure must show) is docs/movement-reference.md — check pose or
  cue edits against it first, keep it updated, then re-run the gauntlet.
- The global 13° camera pitch flattens any floor-plane spread to ~22% of its true angle on
  screen (learned fitting Prone Y raises: a wide Y reads as a shallow fork; the camera that
  shows the full Y loses the prone read). Pick per-movement `cam` for what must READ, not
  for anatomical truth — Y raises use cam:72 side-on; don't relitigate.
- build.py used to read its page template from the ALREADY-BUILT morning-movement.html
  (frozen to src/app_head.html when that app retired, 2026-08-26), so any literal-string
  replace of a stamped value goes silently stale the moment the baked value changes (the
  count badges + reset counts were wrong for months this way). New stamped values must
  still use regex replaces (`–/\d+` style). Bonus trap: app_tpl.js contains the
  6-char escape text `–`, not an en-dash — Python string literals decode, JS source
  doesn't. Messages embed via json.dumps(..., ensure_ascii=False) so typographic chars
  (’ —) land as literal UTF-8 — keep it that way.
- tools/geo.js evals the built script sliced at `const layer=document.getElementById`;
  tools/lint.js slices at `const $=id=>...`. Timer/segment code must stay after the
  `const $=` line in app_tpl.js or those tools break.

## Deployment

Built HTML at repo root for GitHub Pages. One commit per change set (stacked commits cancel
Pages deploys). Pages auto-update themselves on launch/foreground via BUILDV content-hash
stamps (written by build.py; rebuild.py also stamps index.html — so run rebuild after ANY
index.html edit). No manual refresh needed on the phone after the first relaunch.

One home-screen app: every page shares icon-app.png and web-app title "Movement";
index.html is the launcher. Never add per-app icons (Will's explicit choice).

## Voice ceiling (researched 2026-08-02, Apple-confirmed) — SUPERSEDED 2026-09-28 by pre-generated clips (see app_tpl.js notes); kept for the record

iOS never exposes downloaded Enhanced/Premium voices to web pages — only pre-installed
ones (Apple engineer, developer.apple.com/forums/thread/723503). Don't retry settings
tricks; the say() picker already re-picks per utterance and grabs the best available
(and would auto-benefit if Apple ever relents). Real upgrade paths: pre-generated TTS
audio cues baked into the builds, or a native WKWebView shell (AVSpeechSynthesizer can
use downloaded voices) — shell needs a Mac/CI + $99/yr, deferred.

## Copy voice (Will's explicit preferences)

Ending messages: short, positive, puns on the session's own movements ("Prone to
greatness", "Stretch goals: met", "You’re on the ball"). NO safety warnings in ending
messages, written or spoken — the persistent prenatal banner carries that. The finish
voice says only "Movement complete."

## Working style (agreed with Will, 2026-08-03)

For plan-sized changes in this repo, execute inline rather than fanning out one subagent
per task — the sources are small, the plan usually contains exact code, and per-task
subagent dispatch + review roughly tripled wall-clock on the transitions work. Reserve
multi-agent for genuinely parallel or risky work, and never put bottom-tier models on
character-precision edits (a one-character apostrophe fix took 3 review rounds that way).
One independent review at the end still pays for itself: it caught the stale count-badge
stamping bugs. Design docs/plans from past features live in docs/superpowers/.

## Backlog (agreed with Will, rough priority)

1. Session logging to localStorage (date/completions) + streaks.
2. PWA: manifest + service worker for full offline.
3. Polish: figure-4 knee flare, cobra asymmetric tempo, knee-circles readability.
4. DONE 2026-08-12 (Daily 10 work): joint-attached props + db primitive + arm swivels
   are ported into app_tpl.js and available to all timer apps. Existing movement data
   still uses fixed world-coordinate props; candidates that would read better
   joint-attached: doorway chest opener, kneeling lunge chair hand, supported deep
   squat counter.

Done: Playwright QA (qa/, `npm run gauntlet`), breath-tempo audio (br flag, qa/breath.js),
setup transitions (pos tags → derived 8s GET SET UP gaps, qa/trans.js), prone Y raises
(Morning Movement 8/13), punny ending messages, launcher times incl. setup gaps.
