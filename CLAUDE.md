# Movement App — stick-figure exercise timers

Four single-file HTML exercise timer apps with animated 3D stick-figure demonstrations,
deployed to GitHub Pages at https://plannerspanner.github.io/MovementApp/
(repo `PlannerSpanner/MovementApp` — username lowercase in URL, repo capitalized).
Built for iPhone Safari (wake lock + Add to Home Screen require Safari, not Chrome).

Apps: `morning-flow` (Morning Flow — 13-move qi gong warmup: 8 standing + 5-move ground
finish, TR_ALL authored transitions incl. an explicit 5s "get on the ground" gap, 815s),
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
(exception: it shares the voice path rules below and got the 2026-09-24 speech-priming fix inline).
Morning Movement RETIRED 2026-08-26: its movements were redistributed (5 → Flow's ground
block, 3 → Daily 13); the rest are archived — NOTHING deleted — in `src/d_retired.js`
(+ `data2.js`/`mm_extra.js` kept intact) and documented in docs/movement-reference.md
under "Retired — available for future versions".

## Build

    python3 src/rebuild.py     # stamps all four timer apps + strength + the daily-10
                               # redirect stub from src/ into the output dir

Everything is inlined: engine + template + data + cues → one self-contained HTML per app.
Edit sources, never the built HTML. `rebuild.py` holds per-app themes (hex swap tables),
intros, and movement counts. Adjust its output path for this repo (was /mnt/user-data/outputs).

## Source map (src/)

- `eng2.js` — 3D skeleton solver. Pose schema: `{p:[x,y,z], yaw, tw, sl, s:[s0,s1], hf,
  aL/aR:[flex,abd,flex,abd] (absolute angles), lL/lR (legs, same), ikL/ikR (arm IK: {k:'jointName'}
  or {w:[x,y,z]}), ikFL/ikFR (foot IK world targets), swL/swR (knee swivel deg about hip→ankle axis)}`.
  Coordinates: y DOWN, floor at y=93, canvas 0–100. Limb segments 19 (leg) / 13 (arm/spine),
  foot 6.4. `sl` = lateral spine bend. Feet: sagittal-plane perpendicular + floor clamp
  (flat when planted, trails shin when kneeling).
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
  - iOS SAFARI AUDIO CONSTRAINT (platform gotcha, not a code bug): every Web Speech
    (`speechSynthesis.speak`) and Web Audio (AudioContext creation, `resume()`) call
    must be rooted in a user gesture. Calls made from a setTimeout, a rAF callback, or
    any other deferred context are silently dropped: no error, no console warning,
    nothing happens. Older iOS tolerated deferred speech, so this surfaces as a
    regression on a device upgrade rather than as a bug in new code (voice went dead
    on a new iPhone 2026-09-24 while chimes kept working).
    The pattern that works: prime BOTH APIs inside the Start/Resume tap handler —
    `primeSpeech()` (silent utterance) plus `ac()`/`resume()` — each wrapped in
    try/catch so a missing or failing audio API can never block the timer. All later
    cues then fire normally from their setTimeouts. `say()` re-picks the voice per
    utterance, leaves `u.voice` unset (system default) when the list is empty or has
    no English match, and logs `[voice] …` console warnings once rather than failing
    silently. Same rules inline in hip-activation.html.
    Diagnostic: chimes work but speech is silent → the AudioContext has gesture
    coverage and speech does not. Both silent → suspect the hardware mute switch /
    Action button before the code.
    RULE FOR FUTURE FEATURES: anything that plays a sound or speaks must be traceable
    back to a user gesture, or it needs a priming call added to the Start handler.
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

    npm run gauntlet   # smoke + lint + geo + wk (strength invariants) + daily (Daily 13
                       # form invariants: dips parallel stop, dead-bug flat back, bridge
                       # line, clamshell heels welded, side-plank line, bird-dog flat
                       # back, held dumbbells in front of torso, 715s) + Playwright:
                       # shots (incl. index),
                       # wkshots (strength cards + set checks), dailyshots (every Daily 13
                       # movement + transition), flowshots (every Morning Flow movement +
                       # the 5s ground transition), catchup, trans (legacy gaps on
                       # prenatal-stretch + TR_ALL blocks for flow/daily-13),
                       # breath tones, 2x toggle, auto-update freshness, voice
                       # (gesture-primed speech, empty-voice fallback, all 5 apps,
                       # fake DOM + WebKit + Chromium; needs `npx playwright install webkit`)
    node tools/dump.js && python3 tools/strips.py   # fallback PIL contact sheets (needs Pillow)
    python3 tools/ascii.py <app> "<movement>" 0,3    # text-mode pose render

Hard-won lessons encoded in these tools:
- Parse-only checks miss runtime ReferenceErrors → smoke.js is mandatory.
- Numeric invariants miss gestalt errors (feet never drawn, "alien" legs, belly-as-hips)
  → always LOOK at renders. In Claude Code, replace/augment strips with real Playwright
  screenshots of the served pages.
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

## Voice ceiling (researched 2026-08-02, Apple-confirmed)

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
