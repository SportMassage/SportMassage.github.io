const GA_ID = 'G-BDQZKYTE33';
const CONSENT_KEY = 'analytics_consent';
let analyticsLoaded = false;

function readConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
}

function storeConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* storage blocked: the choice lasts for this page view only */ }
}

// GA4 is loaded only after the visitor accepts (Consent Mode v2).
function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window['ga-disable-' + GA_ID] = false;
    gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
    });
    gtag('js', new Date());
    gtag('config', GA_ID);
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);
}

function clearAnalyticsCookies() {
    const host = location.hostname;
    const domains = ['', host, '.' + host, '.' + host.split('.').slice(-2).join('.')];
    document.cookie.split(';').forEach(c => {
        const name = c.split('=')[0].trim();
        if (name !== '_ga' && !name.startsWith('_ga_')) return;
        domains.forEach(d => {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
        });
    });
}

function setConsent(value) {
    storeConsent(value);
    const banner = document.getElementById('analytics-notice');
    if (banner) banner.hidden = true;
    if (value === 'granted') {
        loadAnalytics();
        return;
    }
    if (analyticsLoaded) {
        window['ga-disable-' + GA_ID] = true;
        gtag('consent', 'update', { analytics_storage: 'denied' });
        analyticsLoaded = false;
    }
    clearAnalyticsCookies();
}

function initConsent() {
    // Browser extensions and built-in cookie-dialog blockers (e.g. Opera) can hide or remove
    // these elements, so every lookup is optional. Without a banner no choice can be made,
    // and analytics simply stays off.
    const banner = document.getElementById('analytics-notice');
    const bind = (id, handler) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', handler);
    };
    bind('analytics-accept', () => setConsent('granted'));
    bind('analytics-reject', () => setConsent('denied'));
    bind('analytics-settings-btn', () => { if (banner) banner.hidden = false; });

    const saved = readConsent();
    if (saved === 'granted') loadAnalytics();
    else if (saved !== 'denied' && banner) banner.hidden = false;
}

// The Google Maps iframe is created only after a click, so Google gets nothing before that.
function initMapPlaceholder() {
    const btn = document.getElementById('map-load-btn');
    const box = document.getElementById('map-box');
    if (!btn || !box) return;
    btn.addEventListener('click', () => {
        const frame = document.createElement('iframe');
        frame.title = 'Google Maps Kazimierzowska 69 Warszawa';
        frame.src = 'https://maps.google.com/maps?q=Kazimierzowska+69,+Warszawa&hl=pl&z=15&output=embed';
        frame.className = 'w-full h-full border-0';
        frame.allowFullscreen = true;
        box.replaceChildren(frame);
    });
}

function trackEvent(eventName, params = {}) {
    if (analyticsLoaded && typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
    }
}

function getElementLocation(element) {
    const section = element.closest('section');
    if (section && section.id) return section.id;
    if (element.closest('header')) return 'header';
    if (element.closest('footer')) return 'footer';
    return 'page';
}

function setLanguage(lang) {
    if (typeof i18n === 'undefined') return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang] && i18n[lang][key]) {
            el.innerHTML = i18n[lang][key];
        }
    });

    // Pages other than the home page set data-title-key on <html> (e.g. privacy.html)
    const titleKey = document.documentElement.dataset.titleKey || 'page_title';
    if (i18n[lang] && i18n[lang][titleKey]) {
        document.title = i18n[lang][titleKey];
    }

    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById('btn-' + lang);
    if (activeBtn) activeBtn.classList.add('active');

    document.documentElement.lang = lang === 'ua' ? 'uk' : lang;
}

function changeLanguageManually(lang) {
    try { localStorage.setItem('preferred_lang', lang); } catch (e) { /* storage blocked */ }
    setLanguage(lang);
    
    trackEvent('change_language', {
        selected_language: lang
    });
}

function detectDefaultLanguage() {
    let savedLang = null;
    try { savedLang = localStorage.getItem('preferred_lang'); } catch (e) { /* storage blocked */ }
    if (savedLang && ['pl', 'ua', 'ru', 'en'].includes(savedLang)) {
        return savedLang;
    }

    const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage || ''];
    for (const raw of browserLangs) {
        if (!raw) continue;
        const l = raw.toLowerCase();
        if (l.startsWith('pl')) return 'pl';
        if (l.startsWith('uk')) return 'ua';
        if (l.startsWith('ru') || l.startsWith('be')) return 'ru';
        if (l.startsWith('en')) return 'en';
    }

    return 'pl';
}

document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.toggle('hidden');
            menuBtn.setAttribute('aria-expanded', String(!isHidden));
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href') || '';
        const location = getElementLocation(link);

        if (href.includes('wa.me')) {
            trackEvent('click_whatsapp', {
                location: location
            });
        }

        else if (href.includes('t.me/Dmitry_waw')) {
            trackEvent('click_telegram_dm', {
                location: location
            });
        }

        else if (href.includes('t.me/Massage_ww')) {
            trackEvent('click_telegram_channel', {
                location: location
            });
        }

        else if (href.startsWith('tel:')) {
            trackEvent('click_phone', {
                location: location
            });
        }
    });

    setLanguage(detectDefaultLanguage());
    initMapPlaceholder();
    initConsent();
});