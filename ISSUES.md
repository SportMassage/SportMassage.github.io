# Site review: issues and required changes

Full re-audit on `main` (commit `1428a45`), 2026-11-16. Every file was read (templates, `app.js`, `style.css`, `tailwind.config.js`, `translations.js`, `build-site.mjs`, workflow, Dependabot config, `package.json`, `robots.txt`, `README.md`, this file). `npm run build` and `npm run check:i18n` were run (0 errors, 0 warnings), and all 8 generated pages and `sitemap.xml` were inspected with scripts: duplicate ids, dead anchors, missing local files, leftover `data-i18n` attributes, heading order, JSON-LD parse, hreflang and canonical per page, CSS class coverage, external requests. Behaviour was tested in headless Edge against `npx serve _site` (iframes at 320–1280px, scripted clicks) and the live site `https://sportmassage.pl/` was fetched and compared with the local build. Not checked: real devices, Lighthouse scores, screen readers, Search Console.

Priority: **P0** = fix now (trust, legal, broken), **P1** = important, **P2** = polish and maintenance (low risk each).

Result in one line: nothing is broken for most visitors; 0 `npm audit` vulnerabilities; the live site is byte-identical to the local build. Two P0 content items and the P1 items still need your decisions or material; the code-level findings are all P2, plus one legal P1 (privacy policy).

---

## Verified OK in this audit

- Build: 4 locales x 2 templates = 8 pages, no missing keys, no unused keys, no template/`pl` drift. Generated pages have no duplicate ids, no dead `#anchors`, no missing local files, no leftover `data-i18n*` attributes, valid JSON-LD, 5 `hreflang` links, a self-referencing `canonical` and a translated title on every page. Headings are h1 > h2 > h3 with no gaps.
- No request to a third party on page load: the only external URLs in the HTML are the `wa.me` and `t.me` links; GA4 and the map load only after consent / click (tested: consent banner shown first, no `googletagmanager` script before "Akceptuję", map iframe created only on click).
- Consent flow: accept loads GA4, reject sets `denied` and clears `_ga*` cookies, the footer button reopens the banner (tested).
- GA4 click events fire with the documented names for `wa.me`, `t.me/Dmitry_waw`, `t.me/Massage_ww` and `tel:` links.
- No text below 14px at 320, 360, 390, 768, 1024 and 1280px, on all 8 pages.
- No horizontal page overflow at 320px (only the language banner issue in #18).
- Colour contrast numbers from the old review were recomputed and match (muted text 7.38 / 6.89 / 6.48 / 5.88:1, dark text on teal 8.94:1, on teal-dark 7.25:1, on sand 10.07:1).
- Live site: `https://` and `/uk/`, `/ru/`, `/en/`, both privacy pages, `sitemap.xml`, `robots.txt` return 200; `http://` redirects (301) to `https://`; the HTML of `/`, `/uk/`, `/privacy.html`, `/en/privacy.html` and `sitemap.xml` is identical to a fresh local build (same CSS hash `ce82d4fa`, same `app.js` hash `9aed967e`). So the first deploy has run, and "Enforce HTTPS" is working.

---

## P0: fix first

### 2. Phone number and brand on the entrance photo contradict the site (still open, re-verified)
`assets/img/entrance.jpg` (shown in the contacts section) still shows the sign "Centrum Masażu i Refleksologii" with phone **506 008 206** on the door and the wall sign, plus "fizjoterapia, bańki lekarskie" and "Leczymy i relaksujemy". The site says **+48 731 532 331** and the brand "Dmitry"; physiotherapy and cupping are not offered here.

**Change:** explain it on the page (e.g. a caption "Gabinet w Centrum Masażu i Refleksologii, szyld po lewej") or retake or crop the photo so no foreign phone number is visible. Make sure the number customers should use is the one on the site.

### 5. Contradictory durations and name (still open, re-verified in the output)
- Children's massage: card says **45 min** (`s5_time`), the pricing card "Masaż do wyboru" (which lists "dziecięcy") says **60 minut** (`time_60`).
- Kinesiotaping: **30–45 minut** is now the same in the HTML and all locales, but it is still an unconfirmed value. The service card (`s2_time`) shows only "Aplikacja • 100 zł".
- Name: "Dmitry" (brand, title, header), "Dzmitry" (Polish About text and `meta_description`), "Дмитро" / "Дмитрий" (UA / RU).

**Change:** decide the real values and edit them once in `translations.js` (all four locales). Use one spelling in the PL About text and meta description.

---

## P1: important

### 6. Trust content and claims (still open)
- No photo of the masseur. "Certyfikaty" / "Certyfikowany masażysta" / "5+ lat praktyki" are claimed but no certificate, school or year is shown.
- No reviews, no opening hours (not on the page and not in JSON-LD), no FAQ, no cancellation policy, no contraindications note.
- Health-claim wording to review: "likwidacja bólu pleców" (hero), "pomoc przy skoliozie", "redukuje obrzęki", "Wsparcie stawów i drenaż 24/7" (and its translations). Prefer "łagodzi / pomaga przy" and remove "24/7".

**Change:** add what you can prove (certificate names and years, link or photo), a short "godziny pracy" line, and soften the claims above. Don't publish claims you can't back up.

### 7. Photos (workplace photo fixed; entrance photo and image markup still open)
Fixed (workplace photo): a new landscape photo in natural light, tidy room, replaces the old portrait shot. The full-resolution originals (4608x3456) are kept in `source-photos/` (outside `assets/`, so the build does not publish them). Generated from `workplace_new_2.jpg`: `assets/img/workplace-hero.jpg` (1600x1200, 158 KB) is the hero image, and `assets/img/workplace-og.jpg` (1200x630, 85 KB) is used for `og:image`, `twitter:image` and the JSON-LD `image`, with `og:image:width` / `og:image:height` added. The old `workplace.jpg` is no longer referenced (still in `assets/img/` and still published; delete it when you no longer need it).

Still open:
- `entrance.jpg` is a small portrait phone shot (508x998), shown as a landscape crop, so it is upscaled and soft on 2x/3x screens. See #2 for its content.
- The hero `<img>` has no `width` / `height` (layout shift) and neither image has WebP/AVIF; `entrance.jpg` has no `loading="lazy"`.
- Optional: `srcset` for the hero (e.g. 800 / 1600 / full-resolution) so phones don't download more than they need; the full-resolution file is not on the page now.
- Alt text is translated (`alt_workplace`, `alt_entrance` exist in all four locales).

**Change:** retake `entrance.jpg` in landscape (about 1200–1600px wide), export WebP with a JPEG fallback, add `width`/`height`, `loading="lazy"` on the entrance photo.

### 14. Local SEO and structured data (mostly fixed; Google Business Profile work remains)
Fixed: JSON-LD `name` is the GBP title "Dmitry — Masaż Sportowy" in every language (keywords stay in the localized `description`); added `@id` (`/#business`), `openingHoursSpecification` (daily 10:00–20:30), `hasMap` and `sameAs` (GBP + Telegram channel); `geo` is now 52.206381, 21.013183 (from the GBP pin); the H1 contains "Warszawa / Mokotów" in all four locales; `<meta name="keywords">` and the `meta_keywords` keys are gone; the contacts card shows the opening hours and links to the Google Maps / GBP listing, and that link is tracked as the GA4 event `click_maps` (matcher on `maps.app.goo.gl` in `app.js`, listed in CLAUDE.md).
Still open: keep the GBP listing complete (photos, services, hours, reviews) and keep the hours in `index.html` JSON-LD, `loc_hours*` and the GBP in sync when they change.

### 15. Booking is messenger-only (still open, re-verified)
All 13 `wa.me` links are the bare `https://wa.me/48731532331`, with no prefilled text, so you can't tell which service was wanted. Nine of them say only "Zapisz się" / "Book Now" (screen-reader users hear "Zapisz się" nine times, WCAG 2.4.4).

**Change:** `https://wa.me/48731532331?text=<urlencoded text>` per service (e.g. "Dzień dobry, chcę się umówić na masaż sportowy"), per-language text from `translations.js`, plus `aria-label="Zapisz się: Masaż Sportowy"` on the service buttons. Consider an online-booking link (Booksy or a calendar) next to the messengers. See #21 for tracking by service.

### 16. Privacy policy is not complete under RODO Art. 13 (new; extends the manual step in the old #4)
`priv_1_p` names only "Dmitry", the address and the phone number. Missing: the full business name and NIP (or confirmation that a natural person is the controller), an email, retention periods (how long messages and phone numbers are kept, how long GA4 data is kept), recipients (Google, Meta/WhatsApp, Telegram, GitHub), the legal basis for the transfer to the USA (e.g. EU-US Data Privacy Framework), and whether giving the data is voluntary.
**Change:** have the policy checked by someone qualified and add the items above to `priv_1_p` … `priv_7_p` in all four locales. Optional, in GA4: turn off Google signals and set event data retention to the shortest value.

---

## P2: polish and maintenance

### 17. Language banner covers the section headings after an anchor jump (new, measured)
`#lang-suggest` is `fixed top-16` and occupies y = 72–134px at 1280px and 72–190px at 375px (measured with `preferred_lang=ru`). After clicking a nav link the section headings land at y = 80–109px (about 109, services 80, process 81, pricing 80, contacts 109), i.e. **under** the banner until it is dismissed. Same on mobile, where the banner is 118px tall.

**Change (pick one):** show it at the bottom instead (stacked with the consent banner, and show only one banner at a time: consent first, language after the choice); or make the banner part of the fixed `<header>` so the header grows and use `scroll-padding-top` / larger `scroll-mt-*` to match; or hide it on the first anchor click or scroll.

### 18. Language banner: close button is off-screen on very narrow phones (new, measured)
At a 320px viewport the close button's right edge is at 335px (15px beyond the screen) when the suggested language is Russian, Ukrainian or English from the Polish page (long label, `shrink-0` on the link and the button, `px-4` x 2). The banner can't be dismissed there. At 360px it fits (right edge 335 of 360).

**Change:** in `index.html` / `privacy.html` (`#lang-suggest`) add `flex-wrap`, `min-w-0` on the text, remove `shrink-0` from `#lang-suggest-go`, or put the close button in the top right corner with `absolute`.

### 19. Touch targets below 44px (new; the "Done" claim was too broad)
Measured heights: header logo link 24–28px, `tel:` links 20px (contacts block and footer), desktop nav links 20px (xl only). They break the project rule (`min-h-11`) and, for the phone links and nav, the WCAG 2.5.8 minimum of 24px.

**Change:** add `inline-flex items-center min-h-11` to the logo link, both `tel:` links and the five desktop nav links. Inline links inside sentences (e.g. "Polityka prywatności" in the consent text) can stay.

### 20. Re-accepting analytics loads gtag.js twice (new, tested)
Accept, then "Ustawienia cookies" > Odrzucam, then accept again in the same page view: `app.js` (`setConsent`, `loadAnalytics`) resets `analyticsLoaded` to `false` on reject, so the second accept appends a **second** `<script src=…googletagmanager…>` (2 scripts in the DOM, measured) and runs `gtag('js')` + `gtag('config')` again, which can send a second `page_view`.

**Change:** keep the script element (or a `gtagScriptAdded` flag) and add it only once; on re-grant send only `gtag('consent','update',…)`, and call `config` only the first time.

### 21. GA4 `location` is too coarse (new, tested)
`getElementLocation()` uses the closest `section` **id**. The hero and the final CTA sections have no id, so both report `location: "page"`; the 5 service buttons all report `services`, the 3 price buttons `pricing`. You can't tell hero from final CTA or which service was clicked.

**Change:** give those two sections ids (`hero`, `final-cta`), add `data-service="sport|kinesio|classic|aesthetic|kids|combo"` on the booking links and pass it as an event parameter. Also: `const location` inside the click handler shadows `window.location` (harmless, rename to `where`).

### 22. Mobile menu: Escape and outside click do nothing (new, tested)
`Escape` leaves the menu open (`aria-expanded` stays `true`); a click outside does not close it either. The menu is 370px tall at 375px wide.

**Change:** in `app.js` add `keydown` (Escape) and outside-click handlers that close the menu and return focus to `#mobile-menu-btn`.

### 23. Keyboard users reach the consent banner last (new)
`#analytics-notice` is the last element in the DOM, so Tab goes through the whole page first. (The language banner is early in the DOM and is fine.)

**Change:** move the banner markup right after the skip link in both templates (it is `fixed`, the visual position does not change), or move focus to its first button when it is shown. Add `aria-live` / `role="region"` if you want screen readers to hear it.

### 24. No `prefers-reduced-motion` handling (new, verified: 0 matches in the compiled CSS)
`<html class="scroll-smooth">`, `.card-hover` (lift), `group-hover:scale-105 duration-500` on the entrance photo and `hover:-translate-y-0.5` on the final button all animate regardless of the OS setting.

**Change:** add to `assets/css/style.css`: `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto !important; } *, ::before, ::after { transition: none !important; } }` (or use Tailwind's `motion-safe:` / `motion-reduce:` variants).

### 25. Strings still hardcoded in the templates (new, verified in the output)
- Header logo suffix "• MASAŻ" is Polish on `/uk/`, `/ru/`, `/en/` (the only leftover Polish word in the Cyrillic pages, apart from "Racławicka" and "zł", which are fine).
- `aria-label="Menu"` on the burger button, the map iframe title `'Google Maps Kazimierzowska 69 Warszawa'` in `app.js`, the footer "Telegram: @Dmitry_waw".

**Change:** keys `logo_suffix`, `menu_label` (and e.g. `data-i18n-aria-label`; the build already handles any `data-i18n-<attr>`), and `map_title` (embed it in `#lang-data`-style JSON or a `data-title` attribute on `#map-box`).

### 26. No custom 404 page (new, verified on the live site)
`https://sportmassage.pl/nonexistent` returns the generic GitHub 404 (9379 bytes) with no navigation and no link back.

**Change:** add `404.html` to the page list in `scripts/build-site.mjs` (Polish, with links to `/`, `/uk/`, `/ru/`, `/en/`, `<meta name="robots" content="noindex">`); GitHub Pages serves it automatically from the site root.

### 27. Favicon, theme colour and icons (new)
The only favicon is an emoji inside a `data:` SVG. Google Search does not use `data:` icons, so the site shows no favicon in search results; there is also no `apple-touch-icon` and no `<meta name="theme-color">`.

**Change:** add `/favicon.ico` (and an SVG or PNG at least 48x48), `apple-touch-icon.png` (180x180) and `<meta name="theme-color" content="#08111F">` to both templates.

### 28. `check:i18n` does not compare attribute fallbacks (new)
`validate()` in `scripts/build-site.mjs` compares only the text of `data-i18n` elements. The fallbacks in `data-i18n-content` / `-alt` / `-title` are not compared, which is why the stale `teypowanie` in the `meta keywords` fallback (vs. `tejpowanie` in `pl`) went unnoticed. Impact is low because the build always ships the `pl` value.

**Change:** in `validate()`, also loop over `data-i18n-<attr>` and compare `$(el).attr(attr)` with `pl[key]` (same normalisation).

### 29. Workflow hardening (new; replaces the old "CI not yet exercised" item)
- The first deploy has run: the live pages match the local build, HTTPS redirect works. That item is **closed**.
- `.github/workflows/deploy.yml` is `workflow_dispatch` only: nothing builds or checks pull requests or pushes. A broken translation would only be caught when you click "Run workflow".
- `concurrency: cancel-in-progress: true` can cancel a deploy that is already running. GitHub's own Pages template uses `false`.
- The remote branch `origin/dependabot/github_actions/actions-1c46b08abf` (commit `9c66e33`, 2026-11-16) bumps `checkout` v4 > v7, `setup-node` v4 > v7, `upload-pages-artifact` v3 > v5 and `deploy-pages` v4 > v5. Not merged yet.

**Change:** add a small `ci.yml` (`on: pull_request` and push to non-main branches: `npm ci && npm run check:i18n && npm run build`); set `cancel-in-progress: false`; review the Dependabot bump (look at the release notes of the four actions) and merge it, then run the workflow once and check the log for Node deprecation warnings.

### 30. Translation meaning drifts and awkward words (new; extends #11, needs a native speaker)
- `hero_title`: UA "перезавантаження вашого тіла" and RU "перезагрузка вашего тела" read as "reboot", PL/EN say "regeneracja / recovery".
- RU `loc_title` "Запись на сеанс" (booking) vs PL "Zapraszam do gabinetu" (a contact/location heading).
- `p2_f2`: PL "odciążenie powięzi" (fascia), UA "підтримка м'язів і зв'язок", RU "разгрузка связок и суставов", EN "tendon & muscle offloading": four different claims.
- Prices stay as Latin "zł" in UA/RU (fine for Polish prices, consider "злотих / PLN" once).

**Change:** have a native reader check the `ua` and `ru` blocks, and align the meaning with `pl`.

### 31. Footer year is hardcoded (new, low)
`footer_text` says "© 2026" in all four locales; it will be wrong from 1 January 2027.

**Change:** drop the year or let the build replace a `{{year}}` token with `new Date().getFullYear()`.

### 32. Font preload is Latin-only on Cyrillic pages (new, low)
Both templates preload `manrope-latin-wght-normal.woff2`; on `/uk/` and `/ru/` the text is Cyrillic, so the font that is actually needed (`manrope-cyrillic-…`) is not preloaded and the text may flash in the fallback font first.

**Change:** in `scripts/build-site.mjs` add a second preload for the Cyrillic subset on the `ua` / `ru` locales.

### 33. Repo housekeeping (new, low)
- All 18 local and remote feature branches are merged into `main`; delete them (`git branch -d`, `git push origin --delete …`).
- `CLAUDE.md` is listed in `.gitignore`, so it is not in the repository or in clones. If you want it shared, remove it from `.gitignore` and commit it.
- `npm run build:css` prints "caniuse-lite is outdated": run `npx update-browserslist-db@latest` once.
- `sitemap.xml`: `<changefreq>` and `<priority>` are ignored by Google (harmless). The privacy pages take their `<lastmod>` from `translations.js`, so any copy change also bumps them.

---

## Done (verified again in this audit)

- [x] Reproducible Tailwind build, colour tokens (`theme.*`), no text below 14px, `<main>` landmark, burger menu `aria-expanded`, no `console.log` in `trackEvent`, manual-only Pages deploy, README, `.gitignore`.
- [x] P0 #1 domain: `https://sportmassage.pl/…` in canonical, `og:url`, `og:image`, JSON-LD, `robots.txt`, `sitemap.xml`; HTTPS redirect confirmed on the live site.
- [x] P0 #3 `proc_title` exists in all four locales (`i18n/translations.js`; the old note named `assets/js/translations.js`, which no longer exists).
- [x] P0 #4 consent and third parties: Consent Mode v2 defaults, GA4 only after "Akceptuję", self-hosted Manrope, click-to-load map, `privacy.html` in 4 languages, "Ustawienia cookies" button. 0 third-party requests on load. Open parts are in #16.
- [x] P1 #8 / #9 / #10 translations: fallback text equals `pl` (`npm run check:i18n` passes); `hero_label`, `s1_time`, `s3_time`, `s4_time`, `s5_time`, `loc_address_note`, `footer_text` have keys; no unused keys (the build prints no warnings). Small leftovers are in #25.
- [x] P1 #11 four indexable language versions (`/`, `/uk/`, `/ru/`, `/en/`) with translated meta, JSON-LD, `canonical`, `hreflang` + `x-default`, a generated sitemap, real language links, a suggestion banner instead of auto-redirect. Still to do by hand: native-speaker check of `ru` / `uk` meta descriptions, add the new URLs in Search Console and resubmit the sitemap (not checked here).
- [x] P1 #12 `unpkg.com/lucide@latest` removed; inline SVG icons.
- [x] P1 #13 anchor offset: `#process` has `scroll-mt-4`; measured heading positions after an anchor jump: 80–81px (about and contacts 109px because of the small tag above the heading). Still affected by the language banner, see #17.
- [x] P2 heading order (h1 > h2 > h3), language buttons are real links with `aria-current`, skip link and `:focus-visible` outline, colour contrast (numbers re-computed), `.gitignore`, `.gitattributes`, `check:i18n`, `sitemap.xml` `<lastmod>` (live sitemap shows 2026-11-16), content-hash `?v=` cache-buster (live pages carry `?v=ce82d4fa` / `?v=9aed967e`), Node pinned in `.nvmrc`, Dependabot config. All of these branches are merged into `main`; the older note "not merged yet" is obsolete.
- [x] P1 #7 (workplace photo only): new landscape hero photo, 1200x630 social image with width/height meta, originals kept in `source-photos/`. The rest of #7 is open.
- [x] 44px touch targets: done for buttons and for the links in sections, **not** for the logo link, the `tel:` links and the desktop nav (see #19).

---

## Suggested order

1. P0 #2 and #5 (need your decisions: real durations, name spelling, how to handle the entrance photo).
2. P1 #16 (privacy policy), #6 and #7 (need your facts, certificates and new photos), #14 (SEO structure, Google Business Profile), #15 (prefilled WhatsApp text).
3. P2 quick code fixes, one small branch each: #17 + #18 (language banner), #19 (touch targets), #20 (double gtag), #22 + #23 (menu and banner keyboard), #24 (reduced motion), #25 (hardcoded strings), #28 (check:i18n for attributes).
4. P2 build and infra: #26 (404.html), #27 (favicons), #29 (CI check and Dependabot merge), #31, #32.
5. Content review by a native speaker: #30. Housekeeping: #33.
