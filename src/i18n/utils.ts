import { useCallback } from "react";
import { defaultLang } from "./languages";
import { ui } from "./ui";

export function getLangFromUrl(url: URL) {
	const [, lang] = url.pathname.split("/");
	if (lang in ui) return lang as keyof typeof ui;
	return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
	const t = useCallback(
		(key: keyof (typeof ui)[typeof defaultLang]) => {
			return ui[lang][key] || ui[defaultLang][key];
		},
		[lang]
	);
	return t;
}

export const stripLangFromUrl = (url: URL) =>
	url.pathname.split("/").slice(2).join("/");
