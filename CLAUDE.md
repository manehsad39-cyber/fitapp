# CLAUDE.md: Personal Nutrition + Gym app (PWA)

## What this is
A single-user, mobile-first web app that I install on my Android phone (Add to Home Screen). It has two modes I switch between:
- **Nutrition** (green theme): fast food logging, macros and key micros, stats.
- **Gym** (red theme): lift logging, estimated 1RM, weight suggestions, PR badges, treadmill running.

The two modes must feel instantly different (colors, backgrounds, accents) so I always know where I am.

About me (for default values only): male, 22, 91 kg, 190 cm, goal is building muscle. English UI, metric units (kg, g, km).

## Hard constraints
- **Free.** No paid services, no backend, no accounts, no AI API inside the app.
- **Data stays on the phone** (IndexedDB). Provide JSON export/import as backup.
- **Offline-capable, installable PWA**, tested for Android Chrome.
- **Simple.** Do not add features that are not listed here. Put ideas in `IDEAS.md` instead. If something is ambiguous, pick the simplest reasonable option and record it in `README.md` under "Decisions".
- **No verdicts in nutrition.** The app states facts only. Never label a day or nutrient as good or bad, never color anything as success/failure. Green and red are theme colors, not signals.

## Stack
- Vite + React + TypeScript
- `react-router` with **HashRouter** (needed for GitHub Pages)
- Dexie (IndexedDB)
- `vite-plugin-pwa`
- Vitest for unit tests
- Plain CSS with CSS variables (no UI framework). Charts as small hand-written SVG components (no chart library).
- Deploy: GitHub Pages via GitHub Actions. Set Vite `base` to the repo name. Explain every step I must do on GitHub in the README.

Suggested structure:
```
src/lib/        pure logic + tests (e1rm, pr, suggestion, nutritionDay, conversions, totals)
src/db/         Dexie schema, seed, export/import
src/shell/      app shell, mode switch, theming
src/nutrition/  screens + components
src/gym/        screens + components
```

## App shell and theming
- A mode switch (segmented control: Nutrition | Gym) is always visible at the top. Remember the last used mode.
- Theme is driven by `data-mode="nutrition|gym"` on the root element using CSS variables. It changes background, surfaces, accent, buttons, nav highlight and the browser `theme-color` meta tag.
  - Nutrition: dark green-black background (about `#0b1a12`), accent emerald (about `#34d399`).
  - Gym: dark red-black background (about `#1a0b0b`), accent red (about `#ef4444`).
- Each mode has its own bottom navigation. Settings is a gear icon in the top bar.
- Tap targets at least 44px, font size at least 16px in inputs (prevents mobile zoom), numeric inputs use `inputmode="decimal"`.

## NUTRITION MODE

### Day definition
A nutrition day runs from **04:00 to 04:00 local time**. `nutritionDay(timestamp)` = calendar date of `(timestamp - 4h)`. Unit test the boundary.

### Today screen
- Calories: eaten / target, plus remaining as a plain statement, e.g. "1,000 kcal left" or "200 kcal over target".
- Protein, carbs, fat: eaten / target in grams and % of target (neutral progress bars in the theme accent).
- Micros (collapsible): amount and % of target for each tracked micro.
- Journal: chronological list "Meal 1, Meal 2, ..." with time, items, kcal and macros. No meal slots (no breakfast/lunch labels). Tap a meal to edit items, quantities, time, or delete it.
- Day picker to view and edit past days, and to log for a past day.

### Add flow (search based)
1. Tap **Add** -> search bar is focused.
2. Typing "egg" shows all matches (case and accent insensitive, substring match): e.g. Egg, Egg whites, plus custom foods and saved meals. With an empty search, show recent and frequent items.
3. Tap a result -> quantity sheet:
   - number input
   - unit toggle: **g** or **pieces** (only for foods with a piece weight, default unit is pieces for those foods, I can switch to g)
   - **raw / cooked toggle** for foods that have a cooked ratio (default **raw**)
   - live preview of kcal and macros
4. The item goes into the current meal basket. I can add more items, then press **Log meal**, which saves them as the next "Meal N" of the day (with an editable time and date).
5. Choosing a **saved meal** adds its items to the basket with a **multiplier** field (default 1, e.g. 1.5).
6. In the basket there is **Save as meal** (asks for a name, e.g. `lunch_1`).

### Raw vs cooked
- All food values are stored **per 100 g in the base state** (raw for rice, pasta, chicken, beef, salmon, potatoes, onions, peppers).
- A food may have `cookedRatio` = cooked grams per 1 g raw. If I log cooked grams, convert: `rawGrams = cookedGrams / cookedRatio`, then use the raw macros and micros.
- Store the canonical `rawGrams` on the entry, plus the input (`inputQty`, `inputUnit`, `inputState`) so the journal shows what I typed, e.g. "250 g cooked rice (= 89 g raw)".
- `cookedRatio` is editable per food.

### Foods
Built-in foods (values per 100 g, base state). Use USDA FoodData Central or CIQUAL reference values. If web access is available, fetch them. Otherwise use best knowledge. Either way, write `SEED_NOTES.md` listing the source of each food and any value you are not sure about, so I can verify.

| Food | Base state | Piece weight | Default cookedRatio (cooked g per raw g, editable) |
|---|---|---|---|
| Egg (whole) | raw | 50 g | none |
| Egg whites | raw | 33 g | none |
| Chicken breast (skinless) | raw | none | 0.75 |
| Rice (white) | dry | none | 2.8 |
| Pasta (all shapes) | dry | none | 2.3 |
| Whole grain pasta | dry | none | 2.3 |
| Potatoes | raw | none | 1.0 |
| Minced beef 5% fat | raw | none | 0.72 |
| Minced beef 10% fat | raw | none | 0.72 |
| Minced beef 20% fat | raw | none | 0.72 |
| Salmon fillet | raw | none | 0.80 |
| Sardines canned in water (drained) | as is | 1 can drained, about 90 g | none |
| Onion | raw | about 110 g | none |
| Bell pepper | raw | about 150 g | none |

Tracked values per food: kcal, protein, carbs, fat, plus micros: fiber, zinc, magnesium, iron, potassium, calcium, vitamin B12, vitamin D, omega-3, selenium, sodium.

Food management screen:
- Add a **custom food**: name, per-100 g kcal/protein/carbs/fat (required), micros (optional), optional piece weight, optional cookedRatio. Custom foods appear in search from then on.
- Edit any food's values (including built-in ones). Foods in use cannot be deleted, only archived.
- If an entry uses a food with missing micro data, show a small note on the micro totals ("some items have no micro data").
- Past logs read food values live (editing a food updates history). Note this in the README.

### Saved meals
Create, rename, edit items and grams, delete. Logging one uses a multiplier. They show up in search next to foods.

### Targets (Settings, all editable)
Initial macro targets: **3000 kcal, protein 180 g, carbs 390 g, fat 80 g**.
Initial micro targets (adult male reference, all editable):
fiber 38 g, zinc 11 mg, magnesium 400 mg, iron 8 mg, potassium 3400 mg, calcium 1000 mg, vitamin B12 2.4 ug, vitamin D 15 ug, omega-3 1.6 g, selenium 55 ug, sodium 2300 mg (reference value, shown neutrally like the others).

### Stats screen
Tabs: **Day**, **7 days**, **30 days**.
- Average per day of kcal, protein, carbs, fat, and amount + % of target for each micro. Micros matter as averages over the period, since 0% one day and 200% the next evens out.
- Averages only count days that have at least one logged meal. Always show "N of M days logged".
- A per-day kcal bar chart with a target line.
- Facts only: numbers and percentages, no good/bad coloring, no advice text.

## GYM MODE

### Exercises (seed)
Each has: name, type (barbell / dumbbell per hand / machine / cable), weight increment, rep range (hypertrophy defaults), all editable.

| Exercise | Type | Increment | Rep range |
|---|---|---|---|
| Bench press | barbell | 2.5 kg | 6-10 |
| Dumbbell bench press | dumbbell (kg per single dumbbell) | 2 kg | 8-12 |
| Lat pulldown | machine/cable | 5 kg | 8-12 |
| Leg press | machine | 5 kg | 8-12 |
| Lateral raises | dumbbell (kg per single dumbbell) | 2 kg | 12-20 |
| Military press | barbell | 2.5 kg | 6-10 |
| Bicep curls | dumbbell (kg per single dumbbell) | 2 kg | 8-12 |
| Barbell row | barbell | 2.5 kg | 8-12 |
| Triceps pushdown | cable | 2.5 kg | 10-15 |
| Leg curl | machine | 5 kg | 10-15 |
| Treadmill run | cardio | n/a | n/a |

I can add custom exercises (name, type, increment, rep range) and archive any exercise.
For dumbbell exercises the logged weight is always kg per single dumbbell, and the UI labels it clearly.

### Workout session flow
- **Start workout** (empty, or from a routine). Add exercises via search.
- Per exercise: show last session's sets, the suggested weight (with a one-line reason), and a set input: weight and reps, button **Log set**. Sets are listed and can be edited or deleted. No warm-up sets, no RPE, no notes.
- **Finish workout** -> summary: exercises, number of sets, PRs achieved.
- **Rest timer**: a setting to enable or disable (default on) and a duration (default 90 s). Starts when a set is logged, shows a countdown, vibrates at the end, with +30 s and skip buttons. When disabled, nothing appears. Keep the screen awake during an active workout (Wake Lock API where supported).
- **Routines**: create a named, ordered list of exercises (e.g. "Push day"), start a workout from it, edit or delete it.

### Estimated 1RM
- Epley: `e1RM = weight * (1 + reps / 30)`, and for 1 rep `e1RM = weight`.
- If reps > 12, mark the value as rough (show "~").
- Keep the formula in one function with a formula id stored per exercise (default `epley`) so I can switch formula per exercise later without refactoring.
- For dumbbell exercises, e1RM is per single dumbbell.

### PR badge (best e1RM only)
- A set is a **PR** if its e1RM is strictly greater than every earlier e1RM for that exercise (earlier sessions and earlier sets in the same session).
- The very first log of an exercise is labeled "Baseline", not a PR.
- Show a clear badge (star or trophy) on the set when it happens, plus a short highlight animation, and repeat it in the workout summary and in history.

### Suggested weight (hypertrophy, double progression)
Using the most recent session of that exercise, its rep range `[lo, hi]`, and its increment:
1. If **all sets** reached `hi` reps or more: suggest `lastWeight + increment`. Reason text, e.g. "All sets at 12+ reps, go up."
2. Else if any set is below `lo` reps: suggest the weight `e1RM / (1 + midReps / 30)` where `midReps = round((lo + hi) / 2)`, rounded to the nearest increment, never higher than last weight. Reason text, e.g. "Below 8 reps, go down slightly."
3. Else: same weight, aim for more reps. Reason text, e.g. "In range, beat last reps."
4. No history: no suggestion.
Required test case: 15 reps at 10 kg dumbbell curl (range 8-12, increment 2 kg) -> suggests 12 kg.

### Treadmill run
Fields: duration, distance (km), incline (%). Computed: average speed (km/h) and pace (min/km). PR badges for **longest distance** and **best pace** (pace PR only for runs of 1 km or more).

### Progress and history
- History: list of sessions by date with exercises and sets.
- Per exercise screen: current best e1RM, date of PR, line chart (SVG) of best e1RM per session, recent sessions table.
- Running: charts for distance and pace over time.

## Settings and data
- Edit macro and micro targets, rest timer on/off and duration.
- **Export** all data to a JSON file, **Import** from JSON (replace, with confirmation). Show "last backup" date.
- Call `navigator.storage.persist()` to reduce the risk of the browser clearing data.

## Quality bar
- Pure logic lives in `src/lib` with Vitest tests: e1RM, PR detection, suggestion cases (include the curl example), `nutritionDay` boundary at 04:00, cooked -> raw conversion, daily and period totals and averages.
- `npm run build` and `npm test` must pass before every commit.
- Commit after each phase with a clear message.
- After each phase, give me a short manual test checklist to run on my phone.
- No console errors, no dead buttons, no placeholder screens.

## Working agreement
- Build in phases (scaffold + shell + theming + storage + deploy first, then Nutrition, then Gym) and stop after each phase for me to test.
- Keep code simple and readable. Small files, no clever abstractions.
- Ask me before changing anything in this file or adding scope.
