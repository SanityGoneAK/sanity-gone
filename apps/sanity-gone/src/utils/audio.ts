import type { Locale } from "~/i18n/languages";

const baseURL =
	"https://penguacestergonenemypresslabdbdareprts.sanitygone.help";

export const operatorVoiceLine = (
	locale: Locale | "custom",
	voiceAsset: string
): string[] => {
	const transformedVoiceAssetPath =
		voiceAsset.split("/")[0].toLocaleLowerCase() +
		"/" +
		voiceAsset.split("/")[1];
	const localeMap: Record<Locale | "custom", string[]> = {
		en: [`${baseURL}/en/audio/sound_beta_2/voice_en/${voiceAsset}.mp3`],
		"zh-cn": [
			`${baseURL}/cn/audio/sound_beta_2/voice_cn/${voiceAsset}.mp3`,
		],
		ja: [`${baseURL}/cn/audio/sound_beta_2/voice/${voiceAsset}.mp3`],
		ko: [`${baseURL}/kr/audio/sound_beta_2/voice_kr/${voiceAsset}.mp3`],
		custom: [
			`${baseURL}/en/audio/sound_beta_2/voice_custom/${transformedVoiceAssetPath}.mp3`,
			`${baseURL}/cn/audio/sound_beta_2/voice_custom/${transformedVoiceAssetPath}.mp3`,
		],
	};

	return localeMap[locale];
};
