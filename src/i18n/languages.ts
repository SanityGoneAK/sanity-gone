export const allLanguages = {
	en: "English",
	"zh-cn": "简体中文",
	// "zh-tw": "正體中文",
	jp: "日本語",
	kr: "한국어",
} as const;

export interface LocalizedString {
	en_US: string;
	ja_JP: string;
	ko_KR: string;
	zh_CN: string;
}

export type Locale = "en" | "jp" | "kr" | "zh-cn";

export const localeToTag: {
	[index in Locale]: keyof LocalizedString;
} = {
	en: "en_US",
	"zh-cn": "zh_CN",
	jp: "ja_JP",
	kr: "ko_KR",
};

export const defaultLang = "en";
