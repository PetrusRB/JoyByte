import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from '../../public/locales/en/common.json';
import translationPT from '../../public/locales/pt-br/common.json';

const resources = {
    "en": translationEN,
    "pt-br": translationPT,
}

i18n
    .use(initReactI18next) // Passes i18n down to react-i18next
    .init({
        resources,
        lng: navigator.language, // Default language
        interpolation: {
            escapeValue: false, // React already does escaping
        },
    });

export default i18n