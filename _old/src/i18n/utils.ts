import { defaultLang, type Locale } from "./languages";
import { ui } from "./ui";

export function getLangFromUrl(url: URL) {
	const [, lang] = url.pathname.split("/");
	if (lang in ui) return lang as Locale;
	return defaultLang;
}

export function useTranslations(lang: Locale) {
	return function t(key: keyof (typeof ui)[typeof defaultLang]) {
		return ui[lang][key] || ui[defaultLang][key];
	};
}

export const stripLangFromUrl = (url: URL) =>
	url.pathname.split("/").slice(2).join("/");
