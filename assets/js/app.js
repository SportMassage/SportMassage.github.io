function trackEvent(eventName, params = {}) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
        console.log(`[GA4 Event]: ${eventName}`, params);
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

    if (i18n[lang] && i18n[lang].page_title) {
        document.title = i18n[lang].page_title;
    }

    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById('btn-' + lang);
    if (activeBtn) activeBtn.classList.add('active');

    document.documentElement.lang = lang === 'ua' ? 'uk' : lang;
}

function changeLanguageManually(lang) {
    localStorage.setItem('preferred_lang', lang);
    setLanguage(lang);
    
    trackEvent('change_language', {
        selected_language: lang
    });
}

function detectDefaultLanguage() {
    const savedLang = localStorage.getItem('preferred_lang');
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
            mobileMenu.classList.toggle('hidden');
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
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
    if (window.lucide) {
        lucide.createIcons();
    }
});