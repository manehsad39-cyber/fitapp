# Seed food values: sources and doubts

All values are per 100 g in the food's base state. The built-in foods are in `src/db/seedFoods.ts`. You can edit any of them in the app (Foods → tap the food).

## How the values were collected

The values come from **USDA FoodData Central (SR Legacy)**, read through the public FDC API on 2026-11-18. The shared `DEMO_KEY` hit its rate limit partway through the fetch, so:

- **USDA (fetched):** these values were read from the USDA record.
- **Estimate:** the USDA record could not be read in full. These values come from my knowledge of the same USDA records and were not checked against the API. Please verify them.

To verify, search https://fdc.nal.usda.gov/ for the fdcId.

**Omega-3** = ALA + EPA + DPA + DHA added together. When USDA lists no ALA (nutrient 851), the 18:3 total (nutrient 619) is used instead.

## Per food

| Food | Source (fdcId, USDA description) | Fetched | Estimated / unsure |
|---|---|---|---|
| Egg (whole) | 171287 "Egg, whole, raw, fresh" | everything | none |
| Egg whites | 172183 "Egg, white, raw, fresh" | everything | omega-3 = 0 (USDA has no ALA value) |
| Chicken breast (skinless) | 171077 "Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw" | calcium, iron | kcal 120, protein 22.5, fat 2.62, zinc, magnesium, potassium, B12, vitamin D 0.1, omega-3 0.03, selenium, sodium |
| Rice (white) | 169756 "Rice, white, long-grain, regular, raw, unenriched" | everything | omega-3 uses nutrient 619 |
| Pasta | 169736 "Pasta, dry, enriched" | kcal, carbs, fat, minerals, B12, omega-3 | protein 13, fiber 3.2, vitamin D 0 |
| Whole grain pasta | 168915 "Pasta, whole grain, 51% whole wheat, remaining unenriched semolina, dry" | everything except B12 and D | B12 0, D 0. USDA also has 169738 "Pasta, whole-wheat, dry" (100% whole wheat), which was not read |
| Potatoes | 170026 "Potatoes, flesh and skin, raw" | everything | omega-3 uses nutrient 619 |
| Minced beef 5% fat | 171790 "Beef, ground, 95% lean meat / 5% fat, raw" | everything | many USDA values are regression-derived |
| Minced beef 10% fat | "Beef, ground, 90% lean meat / 10% fat, raw" (fdcId not confirmed) | nothing (rate-limited) | **all values estimated** |
| Minced beef 20% fat | "Beef, ground, 80% lean meat / 20% fat, raw" (fdcId not confirmed) | nothing (rate-limited) | **all values estimated** |
| Salmon fillet | 175167 "Fish, salmon, Atlantic, farmed, raw" | everything except carbs and fiber | carbs 0, fiber 0. Vitamin D 11 µg is USDA-derived. Wild salmon has less fat and omega-3 |
| Sardines canned in water (drained) | **No USDA entry for water-packed sardines.** The closest is 175139 "Fish, sardine, Atlantic, canned in oil, drained solids with bone" (208 kcal, 11.4 g fat) | nothing used directly | **all values estimated** for water-packed: less fat than oil-packed. Calcium assumes the bones are eaten. Check against the label on your can or CIQUAL |
| Onion | 170000 "Onions, raw" | kcal, macros, zinc, potassium, calcium, selenium, omega-3 | fiber 1.7, magnesium 10, iron 0.21, sodium 4 |
| Bell pepper | 170108 "Peppers, sweet, red, raw" | kcal, protein, carbs, fiber, magnesium, iron, sodium, omega-3 | fat 0.3, zinc 0.25, potassium 211, calcium 7, selenium 0.1. Uses red; green is lower in kcal |

## Piece weights and cooked ratios

These come from CLAUDE.md as given: egg 50 g, egg white 33 g, sardine can 90 g drained, onion 110 g, bell pepper 150 g. They are typical sizes, not USDA values. The cooked ratios are also from CLAUDE.md. All of them can be edited per food.
