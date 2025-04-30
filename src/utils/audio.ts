import type { Locale } from "~/i18n/languages";

const baseURL =
	"https://penguacestergonenemypresslabdbdareprts.sanitygone.help";

export const operatorVoiceLine = (
	locale: Locale | "custom",
	voiceAsset: string
): string => {
	const localeMap: Record<Locale | "custom", string> = {
		en: "voice_en",
		"zh-cn": "voice_cn",
		ja: "voice",
		ko: "voice_kr",
		custom: "voice_custom",
	};

	return `${baseURL}/cn/audio/sound_beta_2/${localeMap[locale]}/${voiceAsset}.mp3`;
};
