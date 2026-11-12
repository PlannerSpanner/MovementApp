# Design refresh: three directions

2026-11-12. Branch `design-refresh`. Prototypes: `node proto/design/build.js`, served at `/design/` by `proto/review/serve.js`. Research and the app comparison: `docs/design/research.md`.

All three run the shipped engine and figure (skin, hands, landmark feet). Only the inks are remapped. Each prototype walks home, transition poster, setup, work, finish and the seal sheet with three real movements, shortened.

## Short comparison (full notes and sources in `research.md`)

| App | What it does that this app does not | What the prototypes take from it |
|---|---|---|
| Gentler Streak | Counts rest as success and speaks in kind, plain sentences. | The seal sheet has no streak count; a missed day is an empty circle. |
| (Not Boring) Habits | Makes finishing feel physical (wind-up, sound, haptic) and never punishes a gap. | The seal stamp with its own low note and one heavy haptic. |
| Down Dog | Shows the whole session as a tappable strip and lets you choose how much the voice talks. | The row of ticks. Tap-to-jump and a voice level are not in the prototypes. |
| pliability | Long, unhurried holds under a calm voice, and a week of dots that fills in. | The week row of seals on home. |
| Apple Fitness+ | A human leads every change, and every number can be switched off. | Nothing on the work screen beyond time and next. |

Limits of the research: pliability's player could not be confirmed from any source (no timer, next-up or end screen was documented). Gentler Streak's haptics and sound are not confirmed. No chime or celebration was confirmed for any of the three session apps.

**Ravi Zupa.** The written sources confirm his processes (screen print and block print, made by hand), his papers, his stated influences and that text is a full partner of the image. They do not describe hatching, banners, borders or seals; no text source does. Those qualities come from the reference image you supplied, which I looked at: a flat vermilion field inside a black keyline on a cream margin, three inks, engraved hatching, condensed caps riding a cream band, a small round seal, distressed ink. The prototypes use that vocabulary and none of his subjects, compositions or lettering.

**Daily line.** Legge's 1891 translation is confirmed public domain. Eleven lines are in `tao-legge.json`, each checked character for character against Project Gutenberg and sacred-texts. The home screen shows one per day.

## What is the same in all three

- **Inks.** Vermilion `#d2432a`, ochre `#d99a2b`, black `#1b1814`, cream paper `#f3ead6`. Dark mode swaps paper and ink: cream ink `#efe5cf` on near-black paper `#151310`, with the two colours lifted slightly.
- **Phase colour lives on the frame.** The paper stage behind the figure never changes. Home: paper frame. Setup: ochre frame. Work: vermilion frame. Finish: ink frame round a vermilion poster.
- **Work screen word budget: five words**, besides the numerals: "Next" and the next movement's name, held to one line (a longer name is cut with an ellipsis in the prototype; the build needs short forms for long names). Two controls in the bottom thumb row, Pause and Skip, 58 px tall. A row of ticks shows progress without words. Form text is behind a tap on the figure and drops from the top, so it never covers the time.
- **Setup is never dimmed.** The preview is the figure at full ink, held still on the start position. Setup is signalled by the ochre frame, the movement name at the top, a smaller countdown in ink, an ochre "Get set" block carrying the setup cue, and stillness.
- **Texture** only on poster surfaces (transition and finish). None on the stage, the numerals or home. C's carved border shows only on home, transition, finish and the seal sheet.
- **The figure in ink.** Trunk, head and right limbs solid ink, with a hairline of paper where a right limb crosses the trunk. Left limb segments carry engraved hatching with an ink outline. Each segment has its own hatch, anchored to the limb and set 22° off square to the bone, so the lines ride with the limb and never run lengthwise. Left hands and feet are a solid mid tone (too small to hold a hatch). Below about 2.3 screen pixels per figure unit (a figure under roughly 230 px wide) the whole left side falls back to that tone, because a 1.5-unit hatch period would fall under 3.5 px and shimmer.
- **Finish.** The figure bounces with both arms up, the existing four-note chime plays with two added notes (a low 110 Hz thud and a high 1318 Hz ring) timed to the seal, and today's seal stamps onto the week row. History is a sheet of seals with no streak count.

## Where they differ

| | A · Letterpress | B · Broadside | C · Woodcut |
|---|---|---|---|
| Idea | One accent ink, thin rules, mostly paper | Two-colour job-printing poster | Full woodcut |
| Type | DIN Condensed | Futura Condensed ExtraBold | Rockwell with DIN numerals |
| Layout | Left-aligned | Centred, numerals between heavy rules | Centred |
| Frame | 12 px band | 16 px field with an inner keyline | 20 px field with a carved zigzag border on poster screens |
| Movement name | Caps over a rule | Reversed out of a black bar | Curved ribbon with folded ends |
| Poster moments | Flat vermilion | Flat vermilion with light grain | A fan of ochre rays from one corner, heavier grain |
| Ground under the figure | Hairline | Hairline | Cut ground with hatch strokes |
| Seal | Ring and disc | Disc with tick marks | Eleven-point burst |

All fonts named are installed on iOS, so the native build can use the same ones.

## The figure as a character

- **Idle** (home): the standing breath loop, slow.
- **Setup**: holds the start position, completely still.
- **Work**: the movement.
- **Finish**: a small bounce with both arms up, about one a second, on the poster.
- **Expressive moments, motion only, proposed for the build:** a settle (one slow exhale) when a session is paused; a look toward the next position during the last three seconds of work (head turn only); a single nod when a seal lands. None of these are in the prototypes yet.
- **Name: three proposals.** *Inky* (what it is made of). *Pu* (the Tao Te Ching's "uncarved block", fitting a woodcut figure and a beginner's mind). *Cricket* (small, cheerful, up at dawn). Your call, or none.

## Haptic spec for the native build

| Moment | Haptic | Notes |
|---|---|---|
| Session button tap | `UIImpactFeedbackGenerator(.light)` | On touch down |
| Setup countdown 3, 2, 1 | `.rigid` impact at intensity 0.5, one per second | Matches the three ticks |
| Work starts | `.medium` impact | With the start chime |
| Halfway, switch sides | Two `.light` impacts 280 ms apart | Matches the double chime |
| Last 3 seconds of work | `.soft` impact at intensity 0.4, one per second | Quieter than setup |
| Movement ends | `UINotificationFeedbackGenerator(.success)` | With the transition chime |
| Seal lands | Core Haptics: one transient, intensity 1.0, sharpness 0.3, then a 120 ms continuous decay from 0.5 | The one heavy moment of the day; timed to the 110 Hz note |
| Opening the seal sheet | none | |
| Pause | `.soft` impact | |

Rules: nothing during the work phase except the last three seconds; respect the system haptics setting; no haptic without its matching sound or visible change.

## Questions for Will

1. **Which limbs are hatched.** You wrote "far-side limbs". The prototypes hatch the figure's LEFT limbs, always, because the app's rule is that left and right keep a fixed identity and never change with depth. Hatching whichever limb is farther from the camera would make the hatch swap sides when limbs cross. Say if you want it by depth anyway.
2. **Trunk.** All three now use a solid ink trunk with a hairline of paper where a right limb crosses it. You rejected a keyline for the skin earlier; this one is 0.4 units and only on the right limbs. The alternative I tried, an ochre trunk, popped in and out as the trunk turned.
3. **The name.**

## Independent critique and what changed

A fresh reviewer drove all three in Chromium and WebKit, light and dark, at three pixel densities. Findings and the response:

| Finding | Response |
|---|---|
| Figure too small on work, dead gap above the numerals | Stage enlarged and centred in the free space. Wide, low movements (bird dog) still leave paper above and below: the engine fits the whole movement into a square. Fitting to the stage's real shape is build work. |
| Skip was 36 px tall in the top corner; no pause | Pause and Skip moved to a 58 px bottom row. |
| Fixed 38° hatch gave one leg two textures; hands and feet read as candy cane | Hatch is per segment, square to the bone; hands and feet in tone. |
| Ochre trunk appeared and vanished between movements | Solid ink trunk in all three. |
| Setup countdown in ochre on cream was about 2:1 | Countdown in ink; ochre carried by the frame and the "Get set" block. |
| A and B were one idea in two weights | A left-aligned with rules; B centred with a reversed bar and ruled numerals; C ribbon, cut ground, rays. They still share one skeleton by design: the work screen is meant to be the same quiet screen in each. |
| C's centred red disc with 16 rays read as a flag | Replaced by an off-centre fan of six uneven rays; the seal has eleven points. |
| C's grain bleached vermilion to salmon; rays ran behind the home figure | Grain now darkens instead of lightening; no rays on home. |
| Dark finish had a glaring cream frame | Black frame in dark mode. |
| Form sheet covered the numerals | It drops from the top. |

Not verified: the reviewer's machine and mine have none of the iOS fonts, so A and B both fell back to Arial Narrow in every screenshot. The type difference between A and B can only be judged on the phone. No hatch shimmer was found on the work screen at any density before the change; the per-segment hatch has been looked at in screenshots but not re-reviewed.
