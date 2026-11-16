# Site review: issues and required changes

Re-checked on `main` on 2026-11-16 (P0 #4 and P1 #12 fixed on branch `fix/privacy-consent`, P1 #8–#10 on `fix/translation-fallbacks`, P1 #13 on `fix/anchor-scroll-offset`; the P2 items on the branches listed under "P2" below, each one branch per item, not yet merged). The page text and both photos were reviewed, and the i18n keys were compared against `index.html` with a script. The layout was checked in headless Edge at 320–1440px. Colour contrast was measured with a script (WCAG formula, see P2). Not checked: real-device behaviour, Lighthouse scores, and the GitHub Actions deploy (it hasn't been run yet).

Priority: **P0** = fix now (trust, legal, broken), **P1** = important, **P2** = polish.

---

## Done since the first review

- [x] Reproducible Tailwind build (`package.json`, `npm run build` / `watch`); the CSS is built in CI and no longer committed
- [x] Colour tokens (`theme.*`) used instead of repeated hex values
- [x] No text below 14px (0 `text-xs` / `text-[10px]` left)
- [x] 44px touch targets on buttons and links; burger menu has `aria-expanded`
- [x] `<main>` landmark added
- [x] `console.log` removed from `trackEvent`
- [x] Manual-only Pages deploy workflow, README, `.gitignore` updated
- [x] P0 #1 domain mismatch: canonical, `robots.txt` sitemap URL, `sitemap.xml` `<loc>`, `og:image` and JSON-LD `image` now use `https://sportmassage.pl/…` (absolute); added `og:url`, `og:locale`, Twitter card and JSON-LD `url`. Still to do by hand: confirm "Enforce HTTPS" is on in Settings → Pages.
- [x] P0 #3 missing `proc_title`: added to `pl`, `ua`, `ru` and `en` in `translations.js`
- [x] P0 #4 consent and third-party requests: cookie banner with Consent Mode v2 (GA4 loads only after "Akceptuję"), Manrope self-hosted in `assets/fonts/`, Google Maps loads only after a click, `privacy.html` added (4 languages), footer "Ustawienia cookies" button to change or withdraw consent. Also removed `unpkg.com/lucide@latest` by inlining the icons as SVG, which fixes P1 #12.
- [x] P1 #8–#10 translations: the HTML fallback text now equals `pl` for every `data-i18n` element (checked with a script, 0 differences). The hero label, the four "time • price" lines, the address note and the footer line got keys (`hero_label`, `s1_time`, `s3_time`, `s4_time`, `s5_time`, `loc_address_note`, `footer_text`) in all four locales. Removed the unused keys `about_quote`, `btn_book`, `btn_services`, `trust_1`–`trust_3` and `price_tag`; `price_note` ("cash or BLIK") is now shown under the price cards. `translations.js` cache-buster bumped to `?v=3`.
- [x] P2 items (heading order, language buttons, skip link and focus styles, colour contrast, `.gitignore`, `.gitattributes`, i18n check, `sitemap.xml` `lastmod`, cache-buster, Node pin and Dependabot): see the P2 section. Only the first workflow run is still open (the Pages source is already set to GitHub Actions).

---

## P0: fix first

### 1. ~~Domain mismatch: `sportmassage.pl` vs `sportmassage.github.io`~~ (fixed)
Fixed in code, see "Done since the first review". Remaining manual step: check that Pages has "Enforce HTTPS" enabled for the custom domain.

### 2. Phone number and brand on the entrance photo contradict the site
`assets/img/entrance.jpg` shows the sign "Centrum Masażu i Refleksologii" with phone **506 008 206**. The site says **+48 731 532 331** and uses the brand "Dmitry". The sign also advertises "fizjoterapia, bańki lekarskie", which aren't offered here.

**Change:** explain it on the page ("Gabinet w Centrum Masażu i Refleksologii, szyld: …") or retake or crop the photo. Make sure the number you want customers to use is the one on the site.

### 3. ~~Missing translation key `proc_title`~~ (fixed)
Fixed in `assets/js/translations.js`, see "Done since the first review". The `#process` heading now translates for all four locales (EN: "What to expect", UA: "Чого очікувати", RU: "Чего ожидать").

### 4. ~~Analytics and third-party requests without consent (Poland/EU)~~ (fixed)
Fixed in code, see "Done since the first review". On first load the page now makes no request to Google or any other third party (checked in headless Edge: 0 external requests, banner shown). Remaining manual steps:

- Have the privacy policy checked, and add the full business name, NIP and an email address to `priv_1_p` if you want them there. It currently names only "Dmitry", the address and the phone number.
- Optional, in GA4: turn off Google signals and set event data retention to the shortest value (Admin → Data collection and modification).
- Visitors who accept are counted; those who reject or ignore the banner are not, so expect lower GA4 numbers.

### 5. Contradictory durations and text
- Kinesiotaping: the HTML fallback used to say 15–20 minut; it now matches the translations (**30–45**), but that is still the unconfirmed value: check the real duration.
- Children's massage: the card says **45 min**, but the pricing card says "Masaż do wyboru, 60 minut".
- Name: "Dmitry" (brand) vs "Dzmitry" (About text) vs "Дмитро" (UA).

**Change:** decide the real values and use one source of truth (`translations.js`).

---

## P1: important

### 6. Trust content is missing
- No photo of the masseur.
- "Certyfikaty" is claimed, but no certificate or qualification is shown.
- No reviews or testimonials, no opening hours, no FAQ, no cancellation policy, no contraindications note.
- Don't publish claims you can't back up. ("Setki zadowolonych osób" was removed from the HTML fallback in #8; the "5+ lat" and "certyfikowany" claims still need evidence.)

### 7. Photos
- `workplace.jpg`: portrait phone shot with harsh ceiling lights, a visible bin and a bare couch, then cropped to landscape (`object-cover`). Retake it in natural light, tidy, ideally with a landscape crop.
- Both `<img>` tags lack `width`/`height` (layout shift). Neither uses WebP/AVIF. `entrance.jpg` is not `loading="lazy"`.
- Alt text is Polish-only and not translated.

### 8. ~~Translations: fallback HTML and `pl` disagree~~ (fixed)
The HTML fallback is now identical to `pl` for every `data-i18n` element (the Russian "Записаться" on the final button, `final_title`, `adv_2_d`, `nav_process`, `p3_time`, `s3_desc`, `s5_desc`, and the "→" in `btn_book_sm`; the arrow was never visible at runtime). If a differing fallback is ever added again, the i18n drift check in P2 would catch it.

### 9. ~~Hardcoded, untranslated strings~~ (fixed)
Added keys `hero_label`, `s1_time`, `s3_time`, `s4_time`, `s5_time`, `loc_address_note` and `footer_text` in `pl`, `ua`, `ru` and `en`. Each price line has its own key so durations can change independently (see #5, children's massage 45 vs 60 min).

### 10. ~~Dead translation keys~~ (fixed)
Deleted `about_quote`, `btn_book`, `btn_services`, `trust_1`–`trust_3` and `price_tag` from all four locales. `price_note` is now displayed under the price cards. Remove that `<p>` and the key if you don't want to promise "cash or BLIK".

### 11. ~~Only Polish is indexable~~ (fixed)
`npm run build` now generates `/` (pl), `/uk/`, `/ru/` and `/en/` from the Polish templates (`scripts/build-site.mjs`), each with its own `privacy.html`. Every page has a translated title, description, Open Graph/Twitter tags and JSON-LD, a self-referencing `canonical`, and `hreflang` links for all four languages plus `x-default` (Polish). `sitemap.xml` is generated with the alternates. The language buttons are real links, there is no flash of Polish, and the old auto-detect was replaced by a dismissible suggestion banner (no redirects).

Still to do by hand: have the `ru` / `uk` meta descriptions read by a native speaker, add the new URLs in Google Search Console, and resubmit the sitemap.

### 12. ~~`unpkg.com/lucide@latest`~~ (fixed)
Replaced with inline SVGs for the 10 icons used (copied from Lucide, ISC licence); the script and `lucide.createIcons()` are gone. Fixed together with P0 #4.

### 13. ~~Fixed header covers anchor targets~~ (fixed)
The original claim was overstated. Measured in headless Edge at 1280px (after an anchor jump, with smooth scroll off): the 65px header never hid a heading, because the sections have 80px of top padding (`py-20`). Headings landed at 80–81px (about, services, pricing, contacts). Only `#process` (`py-16`) sat flush against the header (65px, no clearance).

Fixed by adding `scroll-mt-4` to `#process`, so it now lands at 81px like the others. `scroll-mt-20` on every section, as first suggested, would have pushed the headings to about 160px, so it was not used. If a section is added later, give it enough `scroll-mt-*` + padding to clear the 65px header.

### 14. Local SEO and structured data
- JSON-LD lacks `url`, `openingHours`, `sameAs` (Telegram) and `hasMap`.
- The H1 doesn't contain "Warszawa / Mokotów" (only the badge does).
- Create a **Google Business Profile** and link it. For a local one-room business this has the largest effect on traffic.
- `<meta keywords>` has a typo ("teypowanie"). Google ignores that tag anyway, so you can delete it.

### 15. Booking is messenger-only
WhatsApp links have no prefilled text, so you can't tell which service was wanted.

**Change:** `https://wa.me/48731532331?text=…` per service (and track by service in GA4). Consider an online-booking link (Booksy or a calendar) next to the messengers.

---

## P2: polish and maintenance

Each item below was done on its own branch from `main` (not merged yet; the branches don't conflict with each other).

- [x] ~~**Heading order**~~ (fixed, branch `fix/process-heading-order`): the four process steps are `h3` now, so the outline is h1 → h2 → h3 everywhere.
- [x] ~~**Language buttons**~~ (already fixed by the multilingual pages, no extra branch): the buttons are real `<a href>` links without inline `onclick`; the click listener in `app.js` is delegated (`a[data-lang]`), and the build marks the current language with `aria-current="true"` and `.active`. `aria-pressed` would be wrong for links, `aria-current` is the right one.
- [x] ~~**Skip link and focus**~~ (fixed, branch `feature/skip-link-focus-styles`): a "Skip to content" link (key `skip_link`, 4 locales) is the first focusable element on both pages and targets `<main id="main">`; a global `:focus-visible` outline in teal; the ✓ marks in the service and price lists are `aria-hidden`.
- [x] ~~**Colour contrast**~~ (measured, no change needed): WCAG contrast ratios of the theme tokens. `text-theme-muted` (#94A3B8) on `bg-theme-base` 7.38:1, `surface` 6.89:1, `card` 6.48:1, `card-hover` 5.88:1, all at least AA (4.5:1). The other text colours (white, ink, teal, sky, sand) are 7:1 or more on every background, and the dark text on the teal and sand buttons and badges is 7.25–10.07:1. The lowest pair is 5.77:1 (teal-dark on card-hover, only a hover colour). Not measured: text over the hero photos or gradients, and anything on a real device.
- [x] ~~**`.gitignore`**~~ (fixed, branch `chore/trim-gitignore`): the Visual Studio / .NET / NuGet entries are gone; it keeps Node, the generated CSS and `_site/`, editor and OS files, and the Claude Code files.
- [x] ~~**Line endings**~~ (fixed, branch `chore/gitattributes`): `.gitattributes` with `* text=auto`. No file changes (the index already stores LF). If the "LF will be replaced by CRLF" warning still shows for files an editor saved with LF, use `* text=auto eol=lf` instead, which keeps LF in the working tree too.
- [ ] **CI not yet exercised** (partly done, branch `chore/ci-pin-node-dependabot`): Node is pinned in `.nvmrc` (22, read by the workflow via `node-version-file`; `engines` in `package.json`), and `.github/dependabot.yml` updates npm and the GitHub Actions monthly (Tailwind major bumps are ignored, v4 would need a config migration). **Settings → Pages → Source** is already set to GitHub Actions. Still to do by hand: run the workflow once (Actions → Deploy to GitHub Pages → Run workflow) and confirm that `https://sportmassage.pl/` loads with styles.
- [x] ~~**i18n drift check**~~ (fixed, branch `feature/check-i18n-script`): `npm run check:i18n` (= `node scripts/build-site.mjs --check`) runs the build's validation without building anything. It fails when a `data-i18n` key is missing or empty in any locale and when a template's inline Polish text differs from `pl`; the normal build still only warns about the latter. Checked by breaking a key and a fallback on purpose.
- [x] ~~**`sitemap.xml` `lastmod`**~~ (fixed, branch `feature/sitemap-lastmod`): every URL has `<lastmod>` = date of the last git commit that touched its template or `translations.js`. The deploy workflow checks out with `fetch-depth: 0` so that the dates are real (a shallow clone would give every page the latest commit's date).
- [x] ~~**Cache-buster**~~ (fixed, branch `chore/stamp-asset-versions`): the manual `?v=1.1` / `?v=3` are removed from the templates; the build adds `?v=<8-char content hash>` to the `tailwind.min.css` and `app.js` links of every generated page.

---

## Suggested order

1. P0 #1, #3, #5 (small edits, no decisions needed except the real durations and name)
2. P0 #2 and P1 #6, #7 (needs your photos and facts)
3. ~~P0 #4 (consent and self-hosted fonts)~~ done
4. ~~P1 #8–#10~~ done; ~~P1 #13~~ done; P1 #15 (code cleanup)
5. P1 #14 (SEO structure); ~~P1 #11~~ done; the P2 list is done except the first CI run (manual)
