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

// Мобильное меню и инициализация
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

    // Первичный запуск
    setLanguage(detectDefaultLanguage());
    if (window.lucide) {
        lucide.createIcons();
    }
});