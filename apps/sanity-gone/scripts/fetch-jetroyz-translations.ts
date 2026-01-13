import axios from "./axios";

import { fixJetSkillDescriptionTags } from "./fix-jet-skill-descs";

const jetroyzSkillsTranslationsUrl =
	"https://raw.githubusercontent.com/Aceship/AN-EN-Tags/master/json/ace/tl-skills.json";
const jetroyzTalentsTranslationsUrl =
	"https://raw.githubusercontent.com/Aceship/AN-EN-Tags/master/json/ace/tl-talents.json";
const jetroytzRiicTranslationsUrl =
	"https://raw.githubusercontent.com/Aceship/AN-EN-Tags/master/json/ace/riic.json";

interface SkillTranslations {
	[skillId: string]: {
		name: string;
		/** indexed by rank; up to length 10 (where last 3 are masteries) */
		desc: string[];
	};
}

interface TalentTranslations {
	/**
	 * outer array is indexed by talent slot;
	 * inner array is phaseIndex (`talents[i].candidates` in character_table)
	 */
	[operatorId: string]: Array<
		Array<{
			name: string;
			desc: string;
		}>
	>;
}

interface RiicTranslations {
	[riicSkillId: string]: {
		name: string;
		/** Plaintext RIIC skill description with no formatting markers, e.g. `+10` */
		desc: string;
		/** RIIC skill description with formatting markers, e.g. `<@cc.vup>+10</>` */
		descformat: string;
	};
}

export async function fetchJetroyzTalentTranslations() {
	const jetTalentTranslations = (
		await axios.get<TalentTranslations>(jetroyzTalentsTranslationsUrl)
	).data;
	return jetTalentTranslations;
}

export async function fetchJetroyzSkillTranslations() {
	const rawSkillsTranslations = (
		await axios.get<SkillTranslations>(jetroyzSkillsTranslationsUrl)
	).data;
	const jetSkillTranslations: SkillTranslations = Object.fromEntries(
		Object.entries(rawSkillsTranslations).map(
			([skillId, { name, desc: rawDescriptions }]) => [
				skillId,
				{
					name,
					desc: rawDescriptions.map((rawDesc) =>
						fixJetSkillDescriptionTags(rawDesc)
					),
				},
			]
		)
	);
	return jetSkillTranslations;
}

export async function fetchJetroyzRiicTranslations() {
	const rawRiicTranslations = (
		await axios.get<RiicTranslations>(jetroytzRiicTranslationsUrl)
	).data;
	/**
	 * We really don't care about the `desc` property, only `descformat`, since that's what matches
	 * the ingame building_data.json `description`. So, discard `desc` and rename `descformat`
	 * to `description`.
	 */
	const jetRiicTranslations = Object.fromEntries(
		Object.entries(rawRiicTranslations).map(
			([riicSkillId, { name, descformat }]) => [
				riicSkillId,
				{
					name,
					description: descformat,
				},
			]
		)
	);
	return jetRiicTranslations;
}
