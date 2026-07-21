const savedLang = localStorage.getItem('lang');
window.LANG = savedLang === 'fr' ? window.LANG_FR : 
              savedLang === 'en' ? window.LANG_EN :
              navigator.language.startsWith('fr') ? window.LANG_FR : window.LANG_EN;