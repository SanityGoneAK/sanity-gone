import cnCharacterTable from "./ArknightsGameData/zh_CN/gamedata/excel/character_table.json" assert { type: "json" };

import cnBuildingData from "./ArknightsGameData/zh_CN/gamedata/excel/building_data.json" assert { type: "json" };
import enBuildingData from "./ArknightsGameData_YoStar/en_US/gamedata/excel/building_data.json" assert { type: "json" };
import jpBuildingData from "./ArknightsGameData_YoStar/ja_JP/gamedata/excel/building_data.json" assert { type: "json" };
import krBuildingData from "./ArknightsGameData_YoStar/ko_KR/gamedata/excel/building_data.json" assert { type: "json" };

import { fetchJetroyzRiicTranslations } from "./fetch-jetroyz-translations";

import type * as GameDataTypes from "../src/types/gamedata-types";

export interface RiicSkill {
	stages: Array<{
		buffId: string;
		name: string;
		description: string;
		skillIcon: string;
		minElite: string;
		minLevel: number;
	}>;
}

const BUILDING_LOCALES = {
	zh_CN: cnBuildingData,
	en_US: enBuildingData,
	ja_JP: jpBuildingData,
	ko_KR: krBuildingData,
};

/**
 * Aggregates RIIC skill data from building_data.json, and for operators not yet released in EN,
 * apply Jetroyz's unofficial translations to their RIIC skills.
 */
export async function aggregateRiicData(
	locale: "zh_CN" | "en_US" | "ja_JP" | "ko_KR"
) {
	const jetRiicTranslations = await fetchJetroyzRiicTranslations();

	const opToRiicSkills: { [operatorId: string]: RiicSkill[] } = {};
	Object.values(BUILDING_LOCALES.zh_CN.chars)
		.filter((buffChar) => {
			const { charId } = buffChar;
			const char = cnCharacterTable[
				charId as keyof typeof cnCharacterTable
			] as GameDataTypes.Character;
			return (
				char.profession !== "TOKEN" &&
				char.profession !== "TRAP" &&
				!char.isNotObtainable
			);
		})
		.forEach((cnCharRiicData) => {
			const { charId } = cnCharRiicData;
			const enCharRiicData =
				BUILDING_LOCALES.en_US.chars[
					charId as keyof typeof BUILDING_LOCALES.en_US.chars
				];

			const charBuffs = cnCharRiicData.buffChar.map(
				({ buffData }, skillIndex) => {
					const buffStages = buffData.map(
						(cnBuff, skillLevelIndex) => {
							let requiresJetTL = false;
							const { buffId } = cnBuff;
							const baseBuffStage = {
								buffId,
								minElite: cnBuff.cond.phase,
								minLevel: cnBuff.cond.level,
							};

							if (enCharRiicData != null) {
								const enBuff =
									enCharRiicData.buffChar[skillIndex]
										.buffData[skillLevelIndex];
								if (cnBuff.buffId !== enBuff.buffId) {
									console.warn(
										`Mismatch: CN buffId ${cnBuff.buffId} does not match EN buffId ${enBuff.buffId}; adding to forced Jet TL list`
									);
									requiresJetTL = true;
								}
							}

							let name = "";
							let description = "";
							const jetTL = jetRiicTranslations[buffId];

							const buffs = BUILDING_LOCALES[locale]["buffs"];
							const buffData =
								BUILDING_LOCALES[locale]["buffs"][
									buffId as keyof typeof buffs
								] ??
								BUILDING_LOCALES.zh_CN["buffs"][
									buffId as keyof typeof buffs
								];

							if (buffData) {
								name = buffData.buffName;
								description = buffData.description;
							}

							if (
								(requiresJetTL || buffData == null) &&
								jetTL &&
								locale == "en_US"
							) {
								name = jetTL.name;
								description = jetTL.description;
							}

							console.warn(
								"No translation available for buff: " +
									buffId +
									" in locale: " +
									locale
							);

							return {
								...baseBuffStage,
								name,
								description,
								skillIcon:
									BUILDING_LOCALES.zh_CN.buffs[
										buffId as keyof typeof BUILDING_LOCALES.zh_CN.buffs
									].skillIcon,
							};
						}
					);

					return {
						stages: buffStages,
					};
				}
			);
			opToRiicSkills[charId] = charBuffs;
		});

	return opToRiicSkills;
}

// FIXME DEBUG
aggregateRiicData("en_US");
