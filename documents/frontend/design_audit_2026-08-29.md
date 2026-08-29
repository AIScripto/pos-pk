# Frontend Design Audit — Enterprise POS
**Date:** 2026-08-29 · **Target:** `frontend/src` · **Mode:** Operate (task completion) · **Stack:** React 18 + Vite 5 + Tailwind 3.4 + shadcn/ui

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2/4 | 194 text nodes at ≤11px; card-as-`div[role=button]` with Enter-only keyboard; reduced-motion block covers only dead classes |
| 2 | Performance | 1/4 | 1.70 MB single JS chunk — all 24 routes statically imported; 4 webfont families loaded on every page |
| 3 | Responsive Design | 2/4 | Cart + quick actions are `hidden lg:flex`; primary "add" affordance is hover-only on a touch device |
| 4 | Theming | 1/4 | 3,819 hard-coded palette utilities across 102 of 192 files; two conflicting token systems |
| 5 | Implementation Integrity | 1/4 | ~415 lines of design-system CSS shipped and used by 1 component; ~50 utility classes emit no CSS at all |
| **Total** | | **7/20** | **Poor — major overhaul of the foundation** |

---

## Implementation Integrity Verdict — FAIL

The project ships a documented design system that the product does not use.

**Evidence (verified against the built bundle `dist/assets/index-nAsvyLNS.css`):**

1. **Two design systems collide silently.** `styles/pos.css` and `styles/pos-theme.css` both define `.pos-btn-primary`, `.pos-btn-secondary`, `.pos-btn-success`, and `.pos-card` in `@layer components`. `pos-theme.css` is imported second, so it wins on every collision. The shipped `.pos-card` rule is literally `.pos-card{transition-property:none}` — the reduced-motion override is the only surviving declaration; the entire card design (border, radius, hover lift, aspect-ratio image) never reaches the browser.

2. **The system is dead code.** Across 192 `.tsx` files, `.pos-card` is used 0 times, `.pos-btn-primary` 0 times, `.pos-btn-success` 0 times, `.pos-category` 0 times, `.pos-price` 0 times. Only `.pos-btn-secondary` appears, in a single file. The 48px minimum touch target defined on `.pos-btn` — the one rule that matters most on a POS terminal — reaches nothing.

3. **Tokens are overridden by a stale file.** `tokens.css` sets `--pos-success: 158 75% 38%` (emerald 600). `pos-theme.css` overrides it to `120 56% 18%` (#005A1F, a near-black green). The 10 components using `text-pos-success` / `bg-pos-success` render the stale value, not the designed one.

4. **A token's comment contradicts its value.** `--pos-primary: 30 100% 54%; /* #0052CC - Blue */` — hue 30 is orange. The stated contrast ratios in that file's footer were computed against a colour the file does not contain.

5. **The real UI bypasses the system entirely.** 3,819 raw Tailwind palette utilities (`bg-slate-900`, `text-blue-600`, `border-emerald-500/25`…) across 102 files, each hand-paired with a `dark:` twin. `ManagerCommon.tsx` alone has 187. This is why theming cannot be changed centrally: the theme lives in the markup.

**Conclusion:** the structure is interchangeable with any generated admin template. The `.pos-*` layer is a design system on paper only.

---

## Detailed Findings

### P0 — Blocking

**[P0-1] ~50 utility classes emit no CSS (Tailwind v4 syntax in a v3.4 project)**
- **Location:** 40+ files. `shadow-xs` ×28, `backdrop-blur-xs` ×4, `blur-xs` ×4, `h-4.5`/`w-4.5` ×11, `h-5.5`/`w-5.5`, `py-0.2` ×10
- **Category:** Implementation Integrity
- **Verified:** `grep '\.shadow-xs' dist/assets/*.css` → 0 matches. The classes ship in the HTML and style nothing.
- **Impact:** Elevation, badge sizing, and blur backdrops silently fall back to nothing. `ProductCard`'s SKU badge, `Toaster`'s status icons, and every `shadow-xs` surface render flat. Developers believe these are styled; they never were.
- **Recommendation:** Extend the v3 theme with `xs` shadow/blur steps and the 4.5/5.5 spacing steps so existing usage becomes real; fix `py-0.2` (not a scale value at any version).

**[P0-2] Conflicting design-system layers**
- **Location:** `styles/pos.css`, `styles/pos-theme.css`, `styles/tokens.css`
- **Category:** Theming / Implementation Integrity
- **Impact:** See Integrity Verdict 1–4. Any future use of `.pos-card` or `.pos-btn-*` gets a random winner.
- **Recommendation:** Delete `pos-theme.css`; make `tokens.css` the single token authority and `pos.css` the single POS component layer.

**[P0-3] No route-level code splitting**
- **Location:** `src/App.tsx` — all 24 route components statically imported
- **Category:** Performance
- **Verified:** `dist/assets/index-C-ljFISD.js` = 1,704,314 bytes. Only `ManagerReportPanel` is lazy (4 KB).
- **Impact:** A cashier opening `/login` downloads the entire admin suite, Recharts, Stripe, and the reports assistant before the password field is interactive. On a shop-floor tablet over retail wifi this is a multi-second cold start on the most time-critical screen in the building.
- **Recommendation:** `React.lazy` every route; split `/admin/*`, `/kitchen`, `/customer-display`, and reports into their own chunks.

### P1 — Major

**[P1-1] Reduced-motion support covers only dead classes**
- **Location:** `styles/pos-theme.css` (only `prefers-reduced-motion` block in the codebase)
- **Category:** Accessibility · **WCAG 2.3.3 (AAA), 2.2.2**
- **Impact:** The block disables transitions on `.pos-btn-*` / `.pos-card`, which nothing uses. The animations that actually run — `animate-fade-in` on every product tile, `hover:-translate-y-0.5`, `active:scale-[0.98]`, `group-hover:scale-105` image zoom, `animate-slide-up`, `animate-scale-in` — are entirely unguarded.
- **Recommendation:** Guard the live keyframe utilities and transform-based hovers; preserve state change, remove travel.

**[P1-2] Text below the legibility floor for a counter-service terminal**
- **Location:** 194 instances — `text-[10px]` ×99, `text-[11px]` ×44, `text-[9px]` ×33, `text-[8px]` ×18
- **Category:** Accessibility · **WCAG 1.4.4**
- **Impact:** `ProductCard` renders the SKU at 8px and the LOW/SALE badges at 8px. A POS is read at arm's length, often at an angle, under mixed lighting, at speed. 8–9px is a decorative-density choice imported from dashboard design and is wrong for this use scene.
- **Recommendation:** Floor of 11px for incidental metadata and 13px for anything a cashier reads to make a decision; raise the whole POS scale one step.

**[P1-3] Primary "add to order" affordance is hover-only**
- **Location:** `components/pos/ProductGrid/ProductCard.tsx:63-71`
- **Category:** Responsive / Accessibility
- **Impact:** The circular `+` overlay is `opacity-0 group-hover:opacity-100`. On the touch terminal this app targets, hover never fires — the affordance never appears. The card is still tappable, but the design's own signal for "this adds an item" is invisible on the primary device.
- **Recommendation:** Make the add affordance persistent (or touch-state driven), and treat hover as enhancement.

**[P1-4] Product tile is a `div` with `role="button"`, Enter-only**
- **Location:** `ProductCard.tsx:25-38`
- **Category:** Accessibility · **WCAG 2.1.1**
- **Impact:** Space does not activate the tile (`onKeyDown={(e) => e.key === 'Enter' && ...}`). Native button semantics, form behaviour, and the browser's own focus handling are all reimplemented partially.
- **Recommendation:** Use a real `<button type="button">`.

**[P1-5] i18n regression on the POS shell**
- **Location:** `pages/POSPage.tsx:213-260` and `ProductCard.tsx:28`
- **Category:** Implementation Integrity
- **Impact:** After a repo-wide multilingual conversion, `POSPage` still emits English literals to the user: `'Item added to order'`, `'New order started'`, `'Cart cleared for next customer.'`, `'Add items before parking order.'`, and `ProductCard`'s `aria-label` is `Add ${name} to order`. In Arabic or Urdu the toast and the screen-reader label are the only English on screen.

**[P1-6] Keyboard shortcuts depend on English DOM text**
- **Location:** `pages/POSPage.tsx:137-140`
- **Category:** Implementation Integrity
- **Impact:** F1 focuses search via `document.querySelector('input[placeholder*="Search"]')`. In Arabic the placeholder is not "Search", so **F1 silently stops working**. F5 does the same with `button[data-category="deals"]` plus a synthetic `.click()`.
- **Recommendation:** Route through refs/state, not DOM string matching.

**[P1-7] Toast status icons are wrong and inverted**
- **Location:** `components/ui/toaster.tsx:18-20`
- **Category:** Theming / Accessibility
- **Impact:** Success uses `text-blue-400 dark:text-blue-600` — blue for success, and *darker* in dark mode (backwards). The error icon is `text-rose-200`, a 200-weight tint used as a foreground. Both sit at `h-4.5 w-4.5`, which emits no size at all (P0-1), so the icons render at intrinsic 24px, larger than the 12px title beside them.

**[P1-8] Touch targets below 44px throughout**
- **Location:** `components/ui/button.tsx` — `default: h-10` (40px), `sm: h-9` (36px), `icon: h-10 w-10`
- **Category:** Accessibility · **WCAG 2.5.8 (AA, 24px min) / 2.5.5 (AAA, 44px)**
- **Impact:** These are the sizes used across every admin table row action and dialog footer. The `.pos-btn` rule that set `min-h-[48px]` is dead code (P0-2).

**[P1-9] Shipped `index.html` is unbranded scaffolding**
- **Location:** `frontend/index.html`
- **Impact:** Two `<!-- TODO: -->` comments in production HTML, `og:image` points at `https://lovable.dev/opengraph-image-p98pqg.png`, `twitter:site` is `@Lovable`, description is "POS Generated Project", `<meta name="author" content="">`. Anyone sharing a link to this POS shares Lovable's branding.

**[P1-10] Four webfont families on every route**
- **Location:** `index.html` — Barlow Condensed (18 weights incl. italics), Plus Jakarta Sans (variable + italics), Inter (6), Roboto (18 incl. italics)
- **Impact:** Barlow Condensed is not referenced anywhere in `tailwind.config.ts` or the source — it is downloaded and never used. Roboto is mapped to `font-display`, i.e. the app's display voice is the default Android system face.
- **Recommendation:** Drop Barlow Condensed and Inter, self-host, and give `font-display` a face with actual character.

### P2 — Minor

- **[P2-1]** 96 lines apply `text-slate-900` / `bg-slate-800`-class colours with no `dark:` counterpart on the same line — dark-mode contrast is unverified in those spots.
- **[P2-2]** 28 `outline-none` usages with no sibling focus ring on the same element.
- **[P2-3]** 13 `size="icon"` buttons with no `aria-label`.
- **[P2-4]** 5 `<img>` without `alt`; 0 of 8 `<img>` use `loading="lazy"`.
- **[P2-5]** `.text-gradient-primary` (gradient text) and `.glow-primary` / `.glow-success` (zero-offset colour halos) are defined in `utilities.css`; both are decoration standing in for hierarchy. Currently unused — delete rather than adopt.
- **[P2-6]** `ProductCard` image is a fixed `h-20` regardless of column width — aspect ratio distorts as the grid widens.
- **[P2-7]** POS cart and quick actions are `hidden lg:flex`. On tablet portrait (768–1023px) — a very common POS form factor — the cart is only reachable through a modal.

### P3 — Polish

- **[P3-1]** `html { scroll-behavior: smooth }` is global and unguarded by reduced-motion.
- **[P3-2]** `Button` variants are named for actions (`create`, `edit`, `view`, `delete`) rather than appearance, and hard-code emerald/amber/slate/red outside the token system.
- **[P3-3]** No themed selection colour beyond `::selection`, no themed caret, no themed scrollbar outside `.pos-scrollbar`.

---

## Patterns & Systemic Issues

1. **The theme lives in the markup, not the tokens.** 3,819 palette utilities in 102 files. Every colour decision is duplicated once per `dark:` variant, by hand. Rebranding requires a 102-file edit.
2. **Design-system files are written but never adopted.** Three separate `.pos-*` component layers were authored across three dates; component authors reached for raw Tailwind each time. Writing more CSS will not fix this — the layer has to be adopted or deleted.
3. **Tailwind v4 syntax leaked into a v3.4 project** and nothing caught it, because invalid Tailwind classes fail silently. There is no lint rule guarding this.
4. **Density was tuned for a desktop dashboard, not a counter terminal.** 8–11px type, hover-revealed primary actions, 36–40px targets, `lg:`-gated cart.
5. **Accessibility work is present but aimed at the wrong targets** — the reduced-motion block, the high-contrast block, and the documented contrast ratios all describe classes and colours the app does not render.

## Positive Findings

- **Token architecture is correct where it is used.** `tokens.css` is a complete, well-organised HSL-channel system wired properly through `tailwind.config.ts`. The foundation is sound; adoption is the gap.
- **Component decomposition is genuinely good.** `POSHeader`, `CartPanel`, `ProductGrid` are split into focused files with clear props — this is what makes a token refactor tractable.
- **Keyboard shortcuts (F1–F7) with visible key hints** on the action bar is a real POS affordance, not decoration, and it is well presented.
- **`.pos-scrollbar` themes a browser surface** most projects leave default.
- **RTL and multilingual work is broad and recent** — the gaps found are a handful of misses in a large, otherwise complete conversion.
- **`admin.css` component layer *is* adopted** (`.admin-sidebar-item`, `.admin-page-header`, `.admin-table`), and it is token-driven. It proves the pattern works in this codebase.

## Recommended Actions

1. **[P0] `/impeccable harden`** — collapse the three `.pos-*` layers into one, make `tokens.css` authoritative, fix the v4-syntax classes, fix the i18n and DOM-scraping regressions.
2. **[P0] `/impeccable optimize`** — route-level code splitting; font diet.
3. **[P1] `/impeccable adapt`** — POS density for touch: type floor, 44px targets, persistent add affordance, tablet-portrait cart.
4. **[P1] `/impeccable colorize`** — migrate the 3,819 palette utilities onto tokens, surface by surface, highest-traffic first.
5. **[P2] `/impeccable polish`** — focus rings, alt text, icon labels, browser surfaces.

---

# Remediation — applied 2026-08-29

38 files changed, 394 insertions, 622 deletions. `npm run typecheck` clean, `npm run build` green, `npm run lint` unchanged from baseline (117 pre-existing problems, 0 new).

## P0 — closed

**P0-1 — dead utility classes.** `tailwind.config.ts` now defines the `xs` step for `boxShadow`, `blur`, and `backdropBlur`, and the `4.5 / 5.5 / 6.5 / 7.5` spacing steps. Verified in the built CSS: `h-4\.5{height:1.125rem}` now emits, as do `.shadow-xs` and `.backdrop-blur-xs`. The 10 `py-0.2` uses — invalid at any Tailwind version — were corrected to `py-0.5`.

**P0-2 — conflicting design systems.** `styles/pos-theme.css` deleted (297 lines, entirely unused except for the overrides it was silently winning). `tokens.css` is now the sole token authority, so `--pos-success` resolves to the emerald it was designed as rather than the near-black `#005A1F` the stale file forced. `pos.css` was rewritten as one token-driven layer: every colour goes through a token, the 48px touch floor on `.pos-btn` is live, and the dead decorative classes (`.pos-category`, `.pos-cart`, `.pos-deal-badge`, gradient buttons) are gone. `.text-gradient-primary`, `.glow-primary`, `.glow-success` removed from `utilities.css` — decoration standing in for hierarchy, and unused.

**P0-3 — bundle.** All 21 non-critical routes converted to `React.lazy`; `POSPage` and `LoginPage` stay eager as the critical path. The four heaviest POS modals (`PaymentModal` and its Stripe SDK, `ProductManagementPanel`, `TillCloseoutModal`, `ThermalReceiptModal`) are lazy behind a `Suspense` boundary. New `RouteFallback` holds its indicator invisible for 250ms so fast chunks don't flash a spinner.

| | Before | After |
|---|---|---|
| Entry chunk | 1,704 KB | **753 KB** (gzip 220 KB) |
| Recharts / reports | in entry | 456 KB, report routes only |
| Stripe | in entry | 24 KB, card payment only |
| Admin suite | in entry | 6–60 KB per route |

## P1 — closed

- **P1-1** — `styles/motion.css` added. Under `prefers-reduced-motion` entrances resolve at their final position (still fading, so arrival is visible), travel and zoom transforms are dropped, and colour/shadow/opacity transitions are kept so hover, focus and press feedback all still read. `scroll-behavior` also drops to `auto`.
- **P1-3, P1-4** — `ProductCard` is now a real `<button>` (Space and Enter both work, native disabled semantics), the add affordance is persistent rather than `group-hover:opacity-100`, the image is `aspect-[5/3]` rather than a fixed `h-20`, and it is `loading="lazy" decoding="async"` with the name carried by the button's own label instead of duplicated in `alt`.
- **P1-2 (POS tiles)** — tile type raised off the 8–9px floor: name to `text-sm`, price to `text-base`, SKU and stock badges to 11px. The `.stock-badge` family now carries the floor.
- **P1-5, P1-6** — every hard-coded English toast on `POSPage` routed through `t.*`; nine new keys added across `en` / `ar` / `ur`. F1 now targets `input[data-pos-search]` instead of `input[placeholder*="Search"]`, so it no longer breaks in Arabic and Urdu. `ProductCard`'s `aria-label` is translated. `InvoicePreview`'s action bar (Close / Print / Confirm & Send to Kitchen) was untranslated and is now wired to `useTranslation`.
- **P1-7** — toast icons fixed: success is the success token instead of blue, error uses `destructive-foreground` instead of a 200-weight tint, and both now have a real size.
- **P1-8** — `Button` sizes raised to `h-11` / `h-12` (`sm` also 44px), with a new `compact` size as the explicit opt-out for dense desktop-only admin tables. `create` / `edit` / `view` / `delete` now resolve through tokens instead of hard-coded emerald / amber / slate / red. Press feedback (`active:scale-[0.98]`) and `touch-manipulation` added.
- **P1-9** — `index.html` rewritten: Lovable's `og:image` and `@Lovable` Twitter handle removed, both `TODO` comments gone, real description, `theme-color` for both schemes, `viewport-fit=cover`.
- **P1-10** — font payload cut from four families / ~50 faces to four families / far fewer faces: Barlow Condensed trimmed from 18 weights-with-italics to the 4 actually used, Inter and Roboto dropped, **Archivo** added as the display voice (Roboto — the Android system face — was standing in for it), and **Noto Sans Arabic** added, which the app never loaded despite shipping Arabic and Urdu.

## Also fixed (found during remediation, not in the original scan)

- **52 inline `style={{ fontFamily }}` overrides** across 8 files put Barlow Condensed, Barlow (a face that was never loaded at all), and Roboto outside the theme entirely — no theme change could ever have reached them. All converted to a `font-condensed` / `font-display` token class plus a Tailwind weight class.
- **The toast surface was inverted**: `bg-slate-950 text-slate-100` in light mode and `dark:bg-white` in dark. The one surface in the app that fought its own theme. Now `bg-popover`, with the `border-l-4` side-tab removed and `shadow-2xl backdrop-blur-md` calmed to `shadow-lg`.
- **The toast dismiss button was `opacity-0 group-hover:opacity-100`** — unreachable on a touch terminal. Now always visible, 32px, tokenized, with an `sr-only` label.
- **`AppConfigContext`'s boot splash was `bg-slate-950`** — the app flashed near-black on every cold start in light mode. Now `bg-background` with the app's `Loader2`, `role="status"`.
- **`InvoicePreview`'s "Confirm & Send to Kitchen"** — the most consequential button in the flow — carried an inline orange gradient off-palette from the app's blue/emerald system, plus `font-800`, which is not a class at any Tailwind version. Now `.pos-btn-success`.
- Two ad-hoc `border-b-2` CSS spinners replaced with the `Loader2` the rest of the app uses.
- `animate-bounce` replaced with `animate-pulse` in 4 places; the unused `bounce-subtle` keyframe deleted.
- The purple→indigo gradient on "Mark dispatched" flattened to the solid purple that already means *dispatched* everywhere else.

## Still open — deliberately not done in this pass

**The 3,819 → 3,758 hard-coded palette utilities across ~100 files.** This is the one systemic issue the foundation work does not close, and it is not a mechanical find-and-replace: each `bg-slate-100 dark:bg-slate-800` pair has to be read to decide whether it means `muted`, `secondary`, `card`, or `accent`. Doing it blind would flatten real distinctions. Recommended order, highest traffic first:

1. `components/pos/CartPanel/*` (88 + 141 in `CartItemRow`) — every transaction passes through it
2. `components/pos/ActiveOrdersPanel` (146) and `POSHeader` (75)
3. `pages/KitchenPage` + `components/kitchen/KitchenOrderCard` (157)
4. `components/admin/manager/ManagerCommon.tsx` (187) — one file, and it feeds the whole manager panel
5. `pages/admin/*` — lowest traffic, and `admin.css` already gives them a token-driven component layer to move onto

Two smaller items travel with that work: **96 lines set a `text-slate-700+` colour with no `dark:` counterpart** (unverified dark-mode contrast — `ClosingSummaryCard.tsx:102` is a confirmed example, `text-slate-500` on `bg-slate-800` ≈ 3.4:1), and **the remaining ~180 sub-11px type sites** outside the POS tiles.

**Other open items:**
- The POS cart and quick actions are still `hidden lg:flex` (P2-7). Tablet portrait is a common POS form factor; this needs a layout decision, not a class change.
- 13 `size="icon"` buttons without `aria-label`, 5 `<img>` without `alt` (P2-3, P2-4).
- The `stripe` package (the **server** SDK, v20.4.1) is in `frontend/package.json` dependencies and imported nowhere — only `@stripe/stripe-js` and `@stripe/react-stripe-js` are used. Safe to remove.
- Language selection uses flag emoji (`🇸🇦` for Arabic, `🇵🇰` for Urdu). Flags denote countries, not languages — Arabic is not Saudi — and emoji standing in for an icon system renders differently on every terminal OS.
- Nothing guards against the P0-1 class of bug recurring. `eslint-plugin-tailwindcss`'s `no-custom-classname` rule would catch an invalid utility at lint time; worth adding.

## Detector state

`impeccable detect src/` — 53 findings before, **40 after**. All 40 remaining are the `gray-on-color` rule, and all of the ones spot-checked are false positives: the rule matches `text-slate-*` and `bg-*` on the same source line where they belong to different ternary branches or hover states (verified in `CartItemRow.tsx:62`, `ClosingSummaryCard.tsx:102`, `SuggestionPanel.tsx:44`, `KitchenPage.tsx:303`). The two `overused-font` hits are Plus Jakarta Sans as the body face and Arial inside the PDF export stylesheet.

---

# Phase 2 — the token migration, completed 2026-08-29

The item I had deferred is done. **128 files changed, 2,206 insertions, 2,243 deletions.** `npm run verify` (typecheck + build + class check) green; `npm run lint` unchanged from baseline (117 pre-existing, 0 new).

| | Before | After |
|---|---|---|
| Hard-coded palette utilities | 3,819 | **0** |
| Hard-coded hex colours in `.tsx` | 50 | **1** (a brand record's stored default — data, not theme) |
| Inline `style={{ fontFamily }}` | 52 | **0** |
| Text below 11px | 194 | **8** (thermal receipt preview only — faithful to 80mm paper) |
| Impeccable detector findings | 53 | **2** |
| Entry chunk | 1,704 KB | **748 KB** |

## The token vocabulary this needed

A migration only works if there is somewhere honest to migrate *to*. Three groups were added to `tokens.css` and `tailwind.config.ts`:

**A semantic status scale** — `success` / `warning` / `danger` / `info` / `special`, each with `DEFAULT` (solid fill), `foreground` (text on that fill), `text` (the reading colour on a page ground), `subtle` (badge/row fill) and `border`. A status badge is now `bg-success-subtle text-success-text border-success-border` in both themes, with no `dark:` twin to keep in sync by hand. `special` exists because "dispatched" has no natural place on the success–warning–danger axis.

**A fixed-dark `screen` scale** — the kitchen display, customer-facing screen, admin sign-in and payment modal are dark in both themes by design (read across a room, or a deliberately focused full-screen moment). Its steps are pinned to the exact slate values those screens already used, so naming them changed nothing on screen; it only made the choice one a theme can reach.

**Brand marks** — `brand` (orange, the terminal) and `brand-admin` (teal, the back-office). Staff tell the two apps apart by that colour, so it is real product information, not decoration. This is the one gradient in the system that keeps its gradient.

## How it was done

Five passes, each verified by typecheck + build before the next:

1. **Light/dark pairs.** A `bg-white dark:bg-slate-900` pair names its own semantic unambiguously — that pair is `bg-card`, and nothing else. 186 pair rules, applied to parsed class lists rather than raw text so that `hover:`, `group-hover:` and `dark:hover:` prefixes matched up instead of leaving orphaned twins behind. Template literals were walked recursively so conditional classes inside `${...}` were converted too.
2. **Fixed-dark surfaces** onto the `screen` scale, 1:1 by colour value.
3. **Unpaired neutrals, fill-aware.** A bare `text-slate-900` means "the page's reading colour" on a card but "the readable colour on *this* fill" when it shares a class string with a saturated background. Each was resolved against the fill beside it; 46 that stayed genuinely ambiguous were left for the hand pass rather than guessed at.
4. **Orphaned `dark:` variants** whose light twin had become a token — 169 removed. A token already resolves in both themes; a leftover `dark:bg-slate-800` beside `bg-secondary` can only fight it.
5. **Alpha tints and the long tail** — `border-amber-500/30` is the same semantic as its solid counterpart, so 374 tinted utilities folded onto `token/alpha`.

## Bugs the migration surfaced

Converting the colours meant reading every surface, which turned up defects the first audit had not reached:

- **The till dialogs were built dark-only and never checked in light mode.** `OpenTillDialog` and `CloseTillDialog` sit inside shadcn's `DialogContent`, which is `bg-background` — white in light mode. Inside, they hard-coded `bg-slate-800/60` panels, `bg-slate-950` inputs and `text-white`. In light mode they rendered dark blocks and near-black input fields on a white sheet. Same for `TillCloseoutModal` and `ThermalReceiptModal`. All four now follow the dialog they live in.
- **Three chart surfaces hard-coded a dark-only palette** — `#0F172A` tooltips, `#1E293B` grid lines, `#475569` axis ticks — so charts stayed dark in light mode. Recharts needs concrete colour values rather than utility classes, which is how it happened; CSS custom properties *do* resolve in SVG attributes, so a new `src/lib/chartTheme.ts` routes them through the tokens without giving up the Recharts API.
- **More silently-dead classes**, all verified absent from the built CSS: `font-600` / `font-700` / `font-900` (numeric weights are not Tailwind classes) across 4 files, `slate-850` ×14, `slate-750` ×2, `slate-350`, `h-18`, `duration-250`, `text-3.5xl`, `origin-top-center`, `shadow-2xs` ×6, and `animate-caret-blink` (shadcn's OTP caret never blinked because the keyframe was never defined).
- **A brand-inconsistent primary action.** `InvoicePreview`'s "Confirm & Send to Kitchen" — the most consequential button in the flow — carried an inline orange gradient off-palette from the app's blue/emerald system, plus `font-800`, which is not a class at any Tailwind version.
- **A button that changed hue between themes**: `from-blue-600 to-indigo-600 dark:from-orange-500 dark:to-amber-500`.

## Also closed in this phase

- **27 decorative button gradients flattened** to solid token fills. They were a different visual language from every other button in the system. The two brand marks keep their gradient; the image scrim keeps its own.
- **A guard so the dead-class bug cannot recur.** `scripts/check-classes.mjs` compares every literal class in `src/` against the selectors actually emitted in the built stylesheet and fails on any that style nothing. Wired up as `npm run check:classes`, and `npm run verify` now runs typecheck + build + the class check in one command. (`eslint-plugin-tailwindcss` was tried first and could not resolve a TypeScript Tailwind config; the direct check is more precise anyway, since it tests the real build output.)
- **11 icon-only buttons labelled.** *Correction to the first audit:* the "5 images without alt" finding was wrong — it came from a line-based grep over multi-line JSX. Every `<img>` in the codebase has an `alt`.
- **Type floor raised.** 138 instances of 8/9/10px type moved to a named `text-2xs` step (11px). The thermal receipt preview keeps its own sizes — it is a picture of 80mm paper, not a screen.
- **The cart reaches tablet portrait.** It was `hidden lg:flex`, so between 768px and 1023px — a very common POS form factor — the running order was only reachable through a modal. It now holds from 768px at a narrower width, with the product grid dropping a column to match.
- **Flag emoji removed from the language switcher.** A flag names a country, not a language — Arabic is not Saudi — and flag emoji render differently on every terminal OS this runs on. Replaced with the language's own tag plus its native name, with a `lang` attribute so screen readers switch voice.

## Corrections to the first audit

- **`stripe` is not an unused dependency.** I removed it and the build caught me: `vite.config.ts` imports it for a dev-server mock payment-intent endpoint. Restored. It is correct that it never reaches the client bundle.
- **All images have `alt`** — see above.
- **F5 (deals) was never broken by localisation.** It targets `button[data-category="deals"]`, which is locale-independent. Only F1 was affected.

## Still open

- **117 pre-existing lint problems**, mostly `@typescript-eslint/no-explicit-any` in `vite.config.ts` and `src/sync/`. Untouched — outside a design audit's scope, and worth a separate pass.
- **Verification is build-level, not visual.** Typecheck, build, the class check and the detector all pass, but there is no browser in this environment, so nothing here has been *seen* rendered. The colour mappings are value-preserving by construction and I checked for the one failure mode that would hide a state — conditional branches collapsing to identical classes (1 found, in my own edit, fixed) — but the till dialogs, the charts and the tablet-portrait cart are the three places where a real look at the screen is most worth doing.

---

# Phase 3 — remaining items, 2026-08-29

**Stripe was left alone.** `frontend/vite.config.ts` is untouched (0 lines changed) and `package.json`'s stripe entries are byte-identical to the original. Two lint findings that live in Stripe files — 10 `no-explicit-any` in `vite.config.ts` and one `exhaustive-deps` in `PaymentModal` — were deliberately skipped for that reason.

## Lint: 117 → 39

| Rule | Before | After |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | 83 | **10** (all in `vite.config.ts` — Stripe, skipped) |
| `react-hooks/exhaustive-deps` | 5 | **1** (in `PaymentModal` — Stripe, skipped) |
| `no-control-regex` | 1 | **0** |
| `react-refresh/only-export-components` | 28 | 28 (left deliberately — see below) |

The 73 `any`s that were fixed were not fixed by casting them away. In every case the correct type already existed and simply was not being used:

- **The config sections** (`Tax`, `Profile`, `Receipt`, `Currency`, `Loyalty`, `Discounts`) each held `useState<any>({})` and `mutationFn: (data: any)` while `admin-config.api.ts` right beside them exported `OrgConfig`, `TaxConfig`, `DiscountPreset` and `LoyaltyConfig`. Wiring those up, plus a `Pick<>` form type per section and a generic `set<K extends keyof T>`, removed 30 of them.
- **The manager tabs** declared 24 `any` props restating a shape the `useManagerPanelState` hook already produces. They now derive from `Pick<ManagerPanelState, …>`, so a change to the hook reaches them as a type error instead of drifting.
- **`ConfigFormPrimitives.Select`** is now generic over the union its value actually holds, so a tax mode or discount type keeps its type from the option list through to the mutation payload. The one cast that remains is at the DOM boundary, where `e.target.value` genuinely is a string — which is exactly where a cast belongs and reads as documentation.
- **`no-control-regex`** in `sanitizeString` is a false positive: stripping control characters is what that function is *for*. It got a disable with the reason, not a changed regex.

## Bugs the type work surfaced

- **`TaxConfig` was missing `paymentMethod`.** The component reads and writes it, the backend stores and queries on it (`where: { orgId, isActive: true, paymentMethod }`) — the frontend interface just never declared it. Added, along with proper unions for `mode`, `appliesTo` and `type` in place of bare `string`.
- **`AdminOrganisation`'s error handler was dead code.** It read `err?.response?.data?.message` — an axios shape — but the API client throws its own `ApiError`, so that branch never matched and every save error fell through to the generic fallback. Now reads `ApiError.message` directly.
- **The offline sync queue ignored `Retry-After`.** `src/sync/queue.ts` parses the header, computes a delay, attaches it to the error as `retryAfterMs` — and nothing read it back. Rate limits were being ignored and the queue kept retrying on its own fixed 1s/3s/5s cadence. `handleItemFailure` now honours it. On a POS that syncs offline transactions when the connection returns, this is the difference between backing off and hammering.
- **`TillContext` cast its denominations through `any`** on both open and close. That was hiding a mismatch between the client's `DenominationEntry` (`{value,label,count,total}`) and the API type's `{denomination,count}`. Checked against the backend: its Zod schema accepts *either* field name and passes extra keys through, so there was no runtime bug — the frontend's type was simply wrong. Corrected, and both casts are gone.
- **`AdminProducts` filtered on a value outside its dependency list.** `getCategoryName` closed over `categories` but was recreated every render and left out of the `useMemo` deps. Wrapped in `useCallback` and declared honestly.
- **`AdminOrganisation` populated its form through a stale closure.** The "populate once" effect read `form` without depending on it. Replaced with a ref, which says "once" directly instead of relying on a guard the dependency array doesn't know about.

## Emoji replaced with drawn icons

35 emoji were doing the job of an icon system. That matters more here than it usually would: this POS runs on mixed Windows, Android and iOS terminals, and each ships **different artwork for the same emoji** — so the category tabs looked like a different product depending on the till. Emoji also ignore `currentColor`, so they stayed full-colour against a selected tab's inverted text.

All now come from lucide, at one stroke weight, inheriting the tab's own colour: category icons (`Beef`, `Sandwich`, `Drumstick`, `Popcorn`, `CupSoda`, `Pizza`, `IceCreamCone`, `Salad`, `Utensils`), plus `PartyPopper`, `Lightbulb`, `CreditCard`, `Banknote`, `StickyNote`, `Store`, `Sparkles`, `CheckCircle2` and `AlertTriangle` for the chrome that had been using `💡 💳 💵 📝 🍔 ★ ✓ ⚠`.

The identical category-to-emoji map had also been **copy-pasted into both `CategoryTabs` and `DealCategoryFilter`**, so a category added to one silently kept the fallback in the other. It is now one `categoryIcons.ts` used by both.

`Enter ↵` in the checkout button keeps its glyph — that is the actual Return symbol on a keyboard, not an icon standing in for one.

## Left deliberately

**28 `react-refresh/only-export-components` warnings.** These are the standard React context pattern (`export const XProvider` alongside `export function useX`) across 13 context files, and shadcn's `export { Button, buttonVariants }` across 6 primitives. Both are correct, idiomatic patterns. "Fixing" them means splitting 21 files in two purely to satisfy a fast-refresh heuristic — real churn, zero user benefit, and it would make the codebase worse to read. They are warnings, and they should stay warnings.

## What still has not been *seen*

Unchanged from Phase 2, and worth repeating: typecheck, build, the class check, the detector and lint all pass, but there is no browser in this environment. The highest-value places for a human to actually look are still the till dialogs, the charts, and the tablet-portrait cart — and now the category tabs, where the icons changed shape.
