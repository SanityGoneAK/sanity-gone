import type { ui } from "./ui";

export type Locale = keyof typeof ui;

export const allLanguages: Record<Locale, string> = {
	en: "English",
	"zh-cn": "简体中文",
	// "zh-tw": "正體中文",
	ja: "日本語",
	ko: "한국어",
} as const;

export function getLocaleFromLanguage(
	languageName: string
): Locale | undefined {
	for (const [locale, name] of Object.entries(allLanguages)) {
		if (name === languageName) {
			return locale as Locale;
		}
	}
	return undefined; // not found
}

export const voiceLanguagesToLocaleKey = {
	CN_MANDARIN: "zh-cn",
	CN_TOPOLECT: "custom",
	JP: "ja",
	EN: "en",
	KR: "ko",
	ITA: "custom",
	GER: "custom",
	RUS: "custom",
	FRE: "custom",
} as const;

export interface LocalizedString {
	en_US: string;
	ja_JP: string;
	ko_KR: string;
	zh_CN: string;
}

export const localeToTag: {
	[index in Locale]: keyof LocalizedString;
} = {
	en: "en_US",
	"zh-cn": "zh_CN",
	ja: "ja_JP",
	ko: "ko_KR",
};

export const defaultLang = "en";
