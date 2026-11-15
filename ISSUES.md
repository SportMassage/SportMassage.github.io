# Site review: issues and required changes

Re-checked on `main` on 2026-11-16 (P0 #4 and P1 #12 fixed on branch `fix/privacy-consent`). The page text and both photos were reviewed, and the i18n keys were compared against `index.html` with a script. The layout was checked in headless Edge at 320–1440px. Not checked: real-device behaviour, Lighthouse scores, colour contrast ratios, and the GitHub Actions deploy (it hasn't been run yet).

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
- Kinesiotaping: HTML says **15–20 minut**, but all translations say **30–45** (the JS overrides the HTML, so visitors see 30–45).
- Children's massage: the card says **45 min**, but the pricing card says "Masaż do wyboru, 60 minut".
- Name: "Dmitry" (brand) vs "Dzmitry" (About text) vs "Дмитро" (UA).

**Change:** decide the real values and use one source of truth (`translations.js`).

---

## P1: important

### 6. Trust content is missing
- No photo of the masseur.
- "Certyfikaty" is claimed, but no certificate or qualification is shown.
- No reviews or testimonials, no opening hours, no FAQ, no cancellation policy, no contraindications note.
- "Setki zadowolonych osób" appears in the HTML fallback but not in `pl`. Don't publish claims you can't back up.

### 7. Photos
- `workplace.jpg`: portrait phone shot with harsh ceiling lights, a visible bin and a bare couch, then cropped to landscape (`object-cover`). Retake it in natural light, tidy, ideally with a landscape crop.
- Both `<img>` tags lack `width`/`height` (layout shift). Neither uses WebP/AVIF. `entrance.jpg` is not `loading="lazy"`.
- Alt text is Polish-only and not translated.

### 8. Translations: fallback HTML and `pl` disagree
Because the JS overwrites the HTML, no-JS visitors and crawlers that don't run JS see the fallback text. Differences:

| key | HTML fallback | `pl` |
|---|---|---|
| `final_btn` | "Записаться" (Russian!) | "Zapisz się" |
| `final_title` | "Chcesz zadbać o swoje ciało?" | "Gotowy, aby zadbać…" |
| `adv_2_d` | "Setki zadowolonych osób" | "Doświadczenie w zawodzie" |
| `nav_process` | "Jak wygląda wizyta" | "Przebieg wizyty" |
| `p3_time` | "15–20 minut" | "30–45 minut" |
| `s3_desc`, `s5_desc` | longer text | shorter text |
| `btn_book_sm` | "Zapisz się →" | "Zapisz się" |

**Change:** make the HTML fallback identical to `pl`.

### 9. Hardcoded, untranslated strings
`60 min • 200 zł` (×3), `45 min • 200 zł`, `Centrum Masażu • Mokotów` (hero label), `Centrum Masażu (Mokotów) • Metro Racławicka`, and the footer line. Add `data-i18n` keys for them.

### 10. Dead translation keys (all four locales)
`about_quote`, `btn_book`, `btn_services`, `trust_1`, `trust_2`, `trust_3`, `price_tag`, `price_note`. Note that `price_note` ("cash or BLIK") is never shown on the page, even though it's useful. Either show it or delete the keys.

### 11. Only Polish is indexable
The other languages are swapped in with JS on one URL, so Google never sees them, there is no `hreflang`, and non-Polish visitors get a flash of Polish text.

**Change:** generate `/en/`, `/ua/` and `/ru/` pages at build time (the Actions workflow is already there) with `hreflang` links, or accept Polish-only SEO.

### 12. ~~`unpkg.com/lucide@latest`~~ (fixed)
Replaced with inline SVGs for the 10 icons used (copied from Lucide, ISC licence); the script and `lucide.createIcons()` are gone. Fixed together with P0 #4.

### 13. Fixed header covers anchor targets
Jumping to `#services` etc. hides the top of the section heading under the 64px header (confirmed in a screenshot).

**Change:** add `scroll-mt-20` to each `<section id="…">`.

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

- **Heading order:** the process section jumps from `h2` straight to `h4`; use `h3`.
- **Language buttons** use inline `onclick`; move to `addEventListener` in `app.js`. Add `aria-pressed` or `aria-current` to the active language.
- **Skip link** and visible `:focus-visible` styles. The ✓ marks are plain text characters; mark them `aria-hidden` or use list semantics.
- **Check colour contrast** of `text-theme-muted` (#94A3B8) on `bg-theme-card` / `bg-theme-surface` with a tool. I haven't measured it.
- **`.gitignore`** is a Visual Studio / .NET template; trim it to what this repo uses.
- **Line endings:** Git warns about LF→CRLF on every commit. Add a `.gitattributes` (`* text=auto`) to settle it.
- **CI not yet exercised:** run the workflow once after switching **Settings → Pages → Source** to **GitHub Actions**, and confirm that `https://sportmassage.pl/` loads with styles. Also consider pinning Node and using Dependabot for `tailwindcss` and the actions.
- **i18n drift check:** add a tiny script (`npm run check:i18n`) that fails if a `data-i18n` key is missing in any locale or the fallback differs from `pl`. The script I used for this review can be the starting point.
- **`sitemap.xml`** has no `lastmod`; add it once the real domain is set.
- **Cache-buster:** `?v=1.1` on the stylesheet is now unnecessary under CI. Either drop it or have the build stamp it.

---

## Suggested order

1. P0 #1, #3, #5 (small edits, no decisions needed except the real durations and name)
2. P0 #2 and P1 #6, #7 (needs your photos and facts)
3. ~~P0 #4 (consent and self-hosted fonts)~~ done
4. P1 #8–#10, #13, #15 (code cleanups, one commit each)
5. P1 #11, #14 (SEO structure) and the P2 list
