// Generates the static site into _site/:
//   index.html, privacy.html          Polish (default)  ->  /, /privacy.html
//   {uk,ru,en}/index.html, privacy.html                 ->  /uk/, /ru/, /en/ (+ /privacy.html in each)
// Each page is a copy of the Polish template (index.html / privacy.html in the repo root) with
// the text taken from i18n/translations.js. Run `npm run build:css` first (npm run build does both).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_site');
const SITE = 'https://sportmassage.pl';

// `key` is the locale key used in translations.js and localStorage; `htmlLang` is the BCP 47 code
// for <html lang> and hreflang (Ukrainian is `ua` in the code but must be `uk` for search engines).
const LOCALES = [
    { key: 'pl', htmlLang: 'pl', prefix: '', ogLocale: 'pl_PL' },
    { key: 'ua', htmlLang: 'uk', prefix: '/uk', ogLocale: 'uk_UA' },
    { key: 'ru', htmlLang: 'ru', prefix: '/ru', ogLocale: 'ru_RU' },
    { key: 'en', htmlLang: 'en', prefix: '/en', ogLocale: 'en_US' }
];
const DEFAULT_LOCALE = LOCALES[0];

const PAGES = [
    { file: 'index.html', urlPath: '/', changefreq: 'weekly', priority: '1.0' },
    { file: 'privacy.html', urlPath: '/privacy.html', changefreq: 'yearly', priority: '0.2' }
];

// Keys used by the build or by app.js (the language suggestion), not by a data-i18n attribute.
const EXTRA_KEYS = ['lang_suggest_text', 'lang_suggest_go', 'lang_suggest_close'];

const pageUrl = (locale, page) => locale.prefix + page.urlPath;
const absUrl = (locale, page) => SITE + pageUrl(locale, page);
const normalize = (s) => s.replace(/\s+/g, ' ').trim();

const errors = [];
const warnings = [];

function loadTranslations() {
    const src = fs.readFileSync(path.join(ROOT, 'i18n', 'translations.js'), 'utf8');
    return vm.runInNewContext(src + '\ni18n');
}

function read(file) {
    return fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\r\n/g, '\n');
}

// Every i18n key a template asks for: data-i18n="key" and data-i18n-<attr>="key".
function templateKeys($) {
    const keys = new Set();
    $('*').each((_, el) => {
        for (const [name, value] of Object.entries(el.attribs || {})) {
            if (name === 'data-i18n' || name.startsWith('data-i18n-')) keys.add(value);
        }
    });
    return keys;
}

function validate(i18n, templates) {
    const used = new Set(EXTRA_KEYS);
    for (const { file, $ } of templates) {
        if ($('[data-i18n] [data-i18n]').length) errors.push(`${file}: nested data-i18n elements`);
        for (const k of templateKeys($)) used.add(k);
    }

    const plKeys = Object.keys(i18n[DEFAULT_LOCALE.key]);
    for (const locale of LOCALES) {
        const t = i18n[locale.key];
        if (!t) { errors.push(`translations.js has no "${locale.key}" block`); continue; }
        for (const k of used) {
            if (typeof t[k] !== 'string' || !t[k].trim()) errors.push(`${locale.key}: missing or empty key "${k}"`);
        }
        for (const k of plKeys) {
            if (!(k in t)) errors.push(`${locale.key}: key "${k}" exists in pl but not here`);
        }
        for (const k of Object.keys(t)) {
            if (!(k in i18n[DEFAULT_LOCALE.key])) warnings.push(`${locale.key}: key "${k}" does not exist in pl`);
        }
    }
    for (const k of plKeys) {
        if (!used.has(k)) warnings.push(`unused key "${k}" (no template or build step uses it)`);
    }

    // The template's inline text is the Polish fallback; warn when it drifts from pl.
    const pl = i18n[DEFAULT_LOCALE.key];
    for (const { file, $ } of templates) {
        $('[data-i18n]').each((_, el) => {
            const key = $(el).attr('data-i18n');
            if (typeof pl[key] !== 'string') return;
            const expected = normalize(cheerio.load(`<div>${pl[key]}</div>`)('div').text());
            if (normalize($(el).text()) !== expected) warnings.push(`${file}: inline text of "${key}" differs from pl`);
        });
    }
}

function render(template, locale, page, i18n) {
    const t = i18n[locale.key];
    const $ = cheerio.load(template);

    // 1. Text: data-i18n="key" replaces the element's content.
    $('[data-i18n]').each((_, el) => {
        const $el = $(el);
        const value = t[$el.attr('data-i18n')];
        if (el.tagName === 'title') $el.text(value);
        else $el.html(value);
        $el.removeAttr('data-i18n');
    });

    // 2. Attributes: data-i18n-<name>="key" sets attribute <name> (alt, title, content, ...).
    $('*').each((_, el) => {
        for (const [name, value] of Object.entries(el.attribs || {})) {
            if (!name.startsWith('data-i18n-')) continue;
            $(el).attr(name.slice('data-i18n-'.length), t[value]).removeAttr(name);
        }
    });

    // 3. Document language, canonical URL and hreflang alternates.
    $('html').attr('lang', locale.htmlLang);
    $('link[rel="canonical"]').attr('href', absUrl(locale, page));
    $('meta[property="og:url"]').attr('content', absUrl(locale, page));
    $('meta[property="og:locale"]').attr('content', locale.ogLocale);

    const alternates = [
        ...LOCALES.map(l => `<link rel="alternate" hreflang="${l.htmlLang}" href="${absUrl(l, page)}">`),
        `<link rel="alternate" hreflang="x-default" href="${absUrl(DEFAULT_LOCALE, page)}">`
    ];
    $('link[rel="canonical"]').after('\n    ' + alternates.join('\n    '));
    $('meta[property="og:locale"]').after(LOCALES
        .filter(l => l !== locale)
        .map(l => `\n    <meta property="og:locale:alternate" content="${l.ogLocale}">`).join(''));

    // 4. JSON-LD: localized description and URL, plus the page language.
    $('script[type="application/ld+json"]').each((_, el) => {
        const data = JSON.parse($(el).text());
        const next = {};
        for (const [k, v] of Object.entries(data)) {
            next[k] = v;
            if (k === 'name') {
                next.description = t.meta_description;
                next.inLanguage = locale.htmlLang;
            }
        }
        next.url = absUrl(locale, page);
        $(el).text('\n' + JSON.stringify(next, null, 2).replace(/^/gm, '    ') + '\n    ');
    });

    // 5. Links: pages live in subfolders now, so asset paths must be root-relative, and
    //    the privacy / home links must stay inside the current language.
    $('[src],[href]').each((_, el) => {
        for (const attr of ['src', 'href']) {
            const v = el.attribs[attr];
            if (v === undefined) continue;
            if (v.startsWith('assets/')) $(el).attr(attr, '/' + v);
            else if (v === 'privacy.html') $(el).attr(attr, locale.prefix + '/privacy.html');
            else if (v === './') $(el).attr(attr, locale.prefix + '/');
        }
    });

    // 6. Language switcher: real links to the same page in each language.
    $('a[data-lang]').each((_, el) => {
        const target = LOCALES.find(l => l.key === $(el).attr('data-lang'));
        $(el).attr('href', pageUrl(target, page));
        if (target === locale) $(el).addClass('active').attr('aria-current', 'true');
    });

    // 7. Data for the language suggestion banner (assets/js/app.js reads it).
    const langData = {
        current: locale.key,
        langs: Object.fromEntries(LOCALES.map(l => [l.key, {
            htmlLang: l.htmlLang,
            url: pageUrl(l, page),
            text: i18n[l.key].lang_suggest_text,
            go: i18n[l.key].lang_suggest_go,
            close: i18n[l.key].lang_suggest_close
        }]))
    };
    $('script[src*="assets/js/app.js"]').first().before(
        `<script type="application/json" id="lang-data">${JSON.stringify(langData).replace(/</g, '\\u003c')}</script>\n    `);

    return $.html();
}

function buildSitemap() {
    const urls = [];
    for (const page of PAGES) {
        for (const locale of LOCALES) {
            const links = [
                ...LOCALES.map(l => `    <xhtml:link rel="alternate" hreflang="${l.htmlLang}" href="${absUrl(l, page)}"/>`),
                `    <xhtml:link rel="alternate" hreflang="x-default" href="${absUrl(DEFAULT_LOCALE, page)}"/>`
            ];
            urls.push([
                '  <url>',
                `    <loc>${absUrl(locale, page)}</loc>`,
                ...links,
                `    <changefreq>${page.changefreq}</changefreq>`,
                `    <priority>${page.priority}</priority>`,
                '  </url>'
            ].join('\n'));
        }
    }
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}

function main() {
    if (!fs.existsSync(path.join(ROOT, 'assets/css/tailwind.min.css'))) {
        console.error('assets/css/tailwind.min.css is missing: run `npm run build:css` (or `npm run build`).');
        process.exit(1);
    }

    const i18n = loadTranslations();
    const templates = PAGES.map(page => {
        const html = read(page.file);
        return { page, file: page.file, html, $: cheerio.load(html) };
    });
    validate(i18n, templates);

    warnings.forEach(w => console.warn('warning: ' + w));
    if (errors.length) {
        errors.forEach(e => console.error('error: ' + e));
        process.exit(1);
    }

    fs.rmSync(OUT, { recursive: true, force: true });
    fs.mkdirSync(OUT, { recursive: true });

    for (const { page, html } of templates) {
        for (const locale of LOCALES) {
            const rel = path.join(locale.prefix.replace(/^\//, ''), page.file);
            const dest = path.join(OUT, rel);
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.writeFileSync(dest, render(html, locale, page, i18n));
        }
    }

    fs.writeFileSync(path.join(OUT, 'sitemap.xml'), buildSitemap());
    for (const file of ['robots.txt', 'CNAME']) fs.copyFileSync(path.join(ROOT, file), path.join(OUT, file));
    // assets/css/style.css is the Tailwind input; only the compiled tailwind.min.css is published.
    fs.cpSync(path.join(ROOT, 'assets'), path.join(OUT, 'assets'), {
        recursive: true,
        filter: (src) => path.basename(src) !== 'style.css'
    });

    console.log(`Built ${PAGES.length * LOCALES.length} pages into _site/ (${LOCALES.map(l => l.prefix || '/').join(', ')})`);
}

main();
