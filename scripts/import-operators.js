import { promises as fs } from "fs";
import path from "path";

import cnCharacterTable from "./ArknightsGameData/zh_CN/gamedata/excel/character_table.json" assert { type: "json" };
import enCharacterTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/character_table.json" assert { type: "json" };
import krCharacterTable from "./ArknightsGameData_YoStar/ja_JP/gamedata/excel/character_table.json" assert { type: "json" };
import jpCharacterTable from "./ArknightsGameData_YoStar/ko_KR/gamedata/excel/character_table.json" assert { type: "json" };

import cnCharacterPatchTable from "./ArknightsGameData/zh_CN/gamedata/excel/char_patch_table.json" assert { type: "json" };
import enCharacterPatchTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/char_patch_table.json" assert { type: "json" };
import jpCharacterPatchTable from "./ArknightsGameData_YoStar/ja_JP/gamedata/excel/char_patch_table.json" assert { type: "json" };
import krCharacterPatchTable from "./ArknightsGameData_YoStar/ko_KR/gamedata/excel/char_patch_table.json" assert { type: "json" };

import cnSkillTable from "./ArknightsGameData/zh_CN/gamedata/excel/skill_table.json" assert { type: "json" };
import enSkillTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/skill_table.json" assert { type: "json" };
import jpSkillTable from "./ArknightsGameData_YoStar/ja_JP/gamedata/excel/skill_table.json" assert { type: "json" };
import krSkillTable from "./ArknightsGameData_YoStar/ko_KR/gamedata/excel/skill_table.json" assert { type: "json" };

import { charSkins as cnCharSkins } from "./ArknightsGameData/zh_CN/gamedata/excel/skin_table.json" assert { type: "json" };
import { charSkins as enCharSkins } from "./ArknightsGameData_YoStar/en_US/gamedata/excel/skin_table.json" assert { type: "json" };
import { charSkins as jpCharSkins } from "./ArknightsGameData_YoStar/ja_JP/gamedata/excel/skin_table.json" assert { type: "json" };
import { charSkins as krCharSkins } from "./ArknightsGameData_YoStar/ko_KR/gamedata/excel/skin_table.json" assert { type: "json" };

import rangeTable from "./ArknightsGameData/zh_CN/gamedata/excel/range_table.json" assert { type: "json" };
import { voiceLangDict as voiceTable } from "./ArknightsGameData/zh_CN/gamedata/excel/charword_table.json" assert { type: "json" };

import {
	getReleaseOrderAndLimitedLookup,
	getSkinObtainSourceAndCosts,
} from "./scrape-prts";
import {
	fetchJetroyzSkillTranslations,
	fetchJetroyzTalentTranslations,
} from "./fetch-jetroyz-translations";
import { getAlterMapping } from "./get-alters.js";
import { aggregateRiicData } from "./aggregate-riic-data";
import { aggregateModuleData } from "./aggregate-module-data";
import { fetchContentfulGraphQl } from "../src/utils/fetch";

const enPatchChars = enCharacterPatchTable.patchChars;
const cnPatchChars = cnCharacterPatchTable.patchChars;
const jpPatchChars = jpCharacterPatchTable.patchChars;
const krPatchChars = krCharacterPatchTable.patchChars;

/** @type {{ [characterId: string]: string }} */
const NAME_OVERRIDES = {
	char_376_therex: "Thermal-EX",
	char_4055_bgsnow: "Pozёmka",
};

const CHARACTER_LOCALES = {
	zh_CN: { ...cnCharacterTable, ...cnPatchChars },
	en_US: { ...enCharacterTable, ...enPatchChars },
	ja_JP: { ...jpCharacterTable, ...jpPatchChars },
	ko_KR: { ...krCharacterTable, ...krPatchChars },
};

const SKILL_LOCALES = {
	zh_CN: cnSkillTable,
	en_US: enSkillTable,
	ja_JP: jpSkillTable,
	ko_KR: krSkillTable,
};

const SKIN_LOCALES = {
	zh_CN: cnCharSkins,
	en_US: enCharSkins,
	ja_JP: jpCharSkins,
	ko_KR: krCharSkins,
};

/**
 * Creates `{dataDir}/operators.json`, Sanity;Gone's "gigafile" containing
 * - base operator data from character_table
 * - denormalized skill data from skill_table
 * - denormalized range data from range_table
 * - module data from uniequip_table and battle_equip_table
 * - this operator's summons from character_table
 *
 * @param {string} dataDir - output directory
 */
export async function createOperatorsJson(dataDir) {
	console.log(`Creating ${path.join(dataDir, "operators.json")}...`);
	const contentfulQuery = `
	query {
		operatorAnalysisCollection {
		items {
			operator {
			name
			slug
			}
		}
		}
	}`;

	const [
		jetSkillTranslations,
		jetTalentTranslations,
		skinSourceAndCostLookup,
		releaseOrderAndLimitedLookup,
		opToRiicSkillsMap,
		resultFetchContentfulGraphQl
	] = await Promise.all([
		fetchJetroyzSkillTranslations(),
		fetchJetroyzTalentTranslations(),
		getSkinObtainSourceAndCosts(),
		getReleaseOrderAndLimitedLookup(),
		aggregateRiicData(),
		fetchContentfulGraphQl(contentfulQuery),
	]);

	const summonIdToOperatorId = {};
	const denormalizedCharacters = Object.entries(CHARACTER_LOCALES["zh_CN"]);

	const transformations = [
		filterPlaceableObjects,
		localizeCharacterDetails,
		collectSummonData,
		addPhases,
		addTalents,
		addSkills,
		addVoices,
		addSkins,
		convertRarityIndex,
		addSummons,

		// @TODO: Translate potential ranks
		// @TODO: Convert ricc min elite to number
		// @TODO: Figure out SpTypes and SkillTypes
		// All summon data for a specific character must be parsed at this point (e.g. Skills, Phases)

		filterSummons,
		addHasGuide,
		addModules,
		addRiicSkills,
		addAlterInformation,
		addReleaseOrderAndLimited,
		sortByRarityAndRelease,
	];

	const characters = transformations.reduce((acc, transformation) => {
		return transformation(acc, {
			summonIdToOperatorId,
			jetSkillTranslations,
			jetTalentTranslations,
			skinSourceAndCostLookup,
			releaseOrderAndLimitedLookup,
			opToRiicSkillsMap,
			resultFetchContentfulGraphQl
		});
	}, denormalizedCharacters);

	const operatorsJson = Object.fromEntries(characters);
	await fs.writeFile(
		path.join(dataDir, "operators.json"),
		JSON.stringify(operatorsJson, null, 2)
	);
}

function filterPlaceableObjects(characters) {
	return characters.filter(
		([charId, character]) =>
			character.profession !== "TRAP" &&
			!charId.startsWith("trap_") &&
			!character.isNotObtainable
	);
}

function localizeCharacterDetails(characters) {
	return characters.map(([charId, character]) => {
		return [
			charId,
			{
				...character,
				charId,
				name: getLocalesForValue(charId, "name"),
				description: getLocalesForValue(charId, "description"),
				tagList: getLocalesForValue(charId, "tagList"),
				itemUsage: getLocalesForValue(charId, "itemUsage"),
				itemDesc: getLocalesForValue(charId, "itemDesc"),
				itemObtainApproach: getLocalesForValue(
					charId,
					"itemObtainApproach"
				),
				serverLocales: Object.keys(CHARACTER_LOCALES).filter(
					(locale) => CHARACTER_LOCALES[locale][charId]
				),
			},
		];
	});
}

function collectSummonData(characters, { summonIdToOperatorId }) {
	characters.forEach(([charId, character]) => {
		character.skills
			.filter((skill) => skill.overrideTokenKey != null)
			.forEach((skill) => {
				summonIdToOperatorId[skill.overrideTokenKey] = charId;
			});
		if (character.displayTokenDict) {
			Object.keys(character.displayTokenDict).forEach(
				(summon) => (summonIdToOperatorId[summon] = charId)
			);
		}
	});

	return characters;
}

function getLocalesForValue(charId, value) {
	return Object.keys(CHARACTER_LOCALES).reduce((locales, locale) => {
		if (CHARACTER_LOCALES[locale][charId]) {
			locales[locale] = CHARACTER_LOCALES[locale][charId][value] ?? "";
		}

		if (value == "name" && !CHARACTER_LOCALES[locale][charId]) {
			locales[locale] = CHARACTER_LOCALES.zh_CN[charId].appellation;
		}

		if (value == "name" && charId == "char_1001_amiya2") {
			locales[locale] =
				CHARACTER_LOCALES[locale][charId][value] + " (Guard)";
		}

		if (
			value == "name" &&
			charId == "char_4055_bgsnow" &&
			locale == "en_US"
		) {
			locales[locale] = "Pozёmka";
		}

		return locales;
	}, {});
}

function addPhases(characters) {
	return characters.map(([charId, character]) => {
		const phases = character.phases.map((phase) => ({
			...phase,
			range: phase.rangeId ? rangeTable[phase.rangeId] : null,
		}));

		return [
			charId,
			{
				...character,
				phases: phases,
			},
		];
	});
}

function addTalents(characters, { jetTalentTranslations }) {
	return characters.map(([charId, character]) => {
		const talents = (character.talents || []).map((talent, talentIndex) => {
			const candidates = (talent.candidates || []).map(
				(candidate, phaseIndex) => {
					const baseCandidateObject = {
						...candidate,
						name: {},
						description: {},
						range: candidate.rangeId
							? rangeTable[candidate.rangeId]
							: null,
					};

					const translations = Object.keys(CHARACTER_LOCALES).forEach(
						(locale) => {
							if (CHARACTER_LOCALES[locale][charId]) {
								baseCandidateObject.name[locale] =
									CHARACTER_LOCALES[locale][charId][
										"talents"
									][talentIndex]["candidates"][
										phaseIndex
									].name;
								baseCandidateObject.description[locale] =
									CHARACTER_LOCALES[locale][charId][
										"talents"
									][talentIndex]["candidates"][
										phaseIndex
									].description;
								return;
							}

							if (
								!CHARACTER_LOCALES[locale][charId] &&
								jetTalentTranslations[charId] &&
								character.profession !== "TOKEN" &&
								locale == "en_US"
							) {
								try {
									const talentTL =
										jetTalentTranslations[charId][
											talentIndex
										][phaseIndex];
									baseCandidateObject.name[locale] =
										talentTL.name;
									baseCandidateObject.description[locale] =
										talentTL.desc;
									return;
								} catch {
									console.warn(
										`No translation found for: character ${charId}, talent index ${talentIndex}, phase index ${phaseIndex} at local ${locale}`
									);
									return;
								}
							}

							console.warn(
								`No translation found for: character ${charId}, talent index ${talentIndex}, phase index ${phaseIndex} at local ${locale}`
							);
						}
					);

					return baseCandidateObject;
				}
			);
			return { ...talent, candidates };
		});

		return [
			charId,
			{
				...character,
				talents,
			},
		];
	});
}

function addVoices(characters) {
	return characters.map(([charId, character]) => {
		const voices = voiceTable[charId]
			? Object.values(voiceTable[charId].dict)
			: [];

		return [
			charId,
			{
				...character,
				voices,
			},
		];
	});
}

function addSkins(characters, { skinSourceAndCostLookup }) {
	return characters.map(([charId, character]) => {
		const skins = Object.values(SKIN_LOCALES.zh_CN)
			.filter((skin) => {
				// special case:
				// amiya's guard form shows up as a skin, so we should filter that out
				if (skin.skinId === "char_1001_amiya2#2") return false;
				return skin.charId === charId;
			})
			.map((cnSkin) => {
				let skinType = "elite-zero";
				let skinSourcesAndCosts = {};
				let elite;
				if (
					cnSkin.displaySkin.skinName == null &&
					(cnSkin.avatarId.endsWith("_1+") ||
						cnSkin.avatarId.endsWith("_2"))
				) {
					skinType = "elite-one-or-two";
					elite = cnSkin.avatarId.endsWith("_1+") ? 1 : 2;
				} else if (cnSkin.displaySkin.skinName != null) {
					// if this is a special skin (i.e. not just an operator's default e0/e1/e2 art),
					// look up the skin's obtain sources + cost
					skinType = "skin";
					skinSourcesAndCosts =
						skinSourceAndCostLookup[cnSkin.skinId];
					if (!skinSourcesAndCosts) {
						console.warn(
							`Couldn't find skin source / cost info for: ${cnSkin.skinId}`
						);
					}
				}
				// const enSkin = enSkinTable["charSkins"][cnSkin.skinId];
				let skinName = Object.keys(SKIN_LOCALES).reduce(
					(locales, locale) => {
						if (
							skinType === "skin" &&
							SKIN_LOCALES[locale][cnSkin.skinId]
						) {
							locales[locale] =
								SKIN_LOCALES[locale][
									cnSkin.skinId
								].displaySkin.skinName;
						} else {
							locales[locale] = `Elite ${elite ?? 0}`;
						}
						return locales;
					},
					{}
				);

				return {
					type: skinType,
					name: skinName,
					skinId: cnSkin.skinId,
					illustId: cnSkin.illustId,
					avatarId: cnSkin.avatarId,
					portraitId: cnSkin.portraitId,
					displaySkin: {
						modelName: cnSkin.displaySkin.modelName,
						drawerList: cnSkin.displaySkin.drawerList,
					},
					...skinSourcesAndCosts,
				};
			});

		return [
			charId,
			{
				...character,
				skins,
			},
		];
	});
}

function addSkills(characters, { jetSkillTranslations }) {
	return characters.map(([charId, character]) => {
		const skillData = character.skills
			.filter((skill) => skill.skillId != null)
			.map((skill) => {
				const skillId = skill.skillId;
				const baseSkillObject = SKILL_LOCALES.zh_CN[skillId];

				const levels = baseSkillObject.levels.map(
					(skillAtLevel, levelIndex) => {
						const baseSkillLevelObject = {
							...skillAtLevel,
							range: skillAtLevel.rangeId
								? rangeTable[skillAtLevel.rangeId]
								: null,
						};

						// SPECIAL CASES
						// - heavyrain s1 (skchr_zebra_1) interpolates "duration" but this value is missing from the blackboard;
						//   we have to append it to the blackboard manually
						if (skillId === "skchr_zebra_1") {
							baseSkillLevelObject.blackboard.push({
								key: "duration",
								value: baseSkillLevelObject.duration,
							});
						}

						if (character.profession !== "TOKEN") {
							baseSkillLevelObject.name = {};
							baseSkillLevelObject.description = {};
							const skillTL = jetSkillTranslations[skillId];

							Object.keys(SKILL_LOCALES).forEach((locale) => {
								if (SKILL_LOCALES[locale][skillId]) {
									baseSkillLevelObject.name[locale] =
										SKILL_LOCALES[locale][skillId].levels[
											levelIndex
										].name;
									baseSkillLevelObject.description[locale] =
										SKILL_LOCALES[locale][skillId].levels[
											levelIndex
										].description;
									return;
								}

								if (
									skillTL &&
									!SKILL_LOCALES[locale][skillId] &&
									locale == "en_US"
								) {
									baseSkillLevelObject.name[locale] =
										skillTL.name;
									baseSkillLevelObject.description[locale] =
										skillTL.desc[levelIndex];
									return;
								}

								console.warn(
									`No translation found for: skill ${skillId}, level index ${levelIndex} at locale ${locale}`
								);
							});
						}
						return baseSkillLevelObject;
					}
				);
				return {
					...baseSkillObject,
					levels,
				};
			})
			.filter((skillData) => !!skillData);

		return [
			charId,
			{
				...character,
				skillData,
			},
		];
	});
}

function filterSummons(characters) {
	return characters.filter(
		([charId, character]) => character.profession !== "TOKEN"
	);
}

function addSummons(characters, { summonIdToOperatorId }) {
	const denormalizedSummonEntries = characters
		.filter(([charId, character]) => character.profession === "TOKEN")
		.map(([charId, summon]) => [
			summonIdToOperatorId[charId],
			{
				...summon,
				operatorId: summonIdToOperatorId[charId],
			},
		]);
	const denormalizedSummons = denormalizedSummonEntries.reduce(
		(acc, [operatorId, summon]) => {
			acc[operatorId] = [...(acc[operatorId] ?? []), summon];
			return acc;
		},
		{}
	);
	return characters.map(([charId, character]) => {
		return [
			charId,
			{
				...character,
				summons: denormalizedSummons[charId] ?? [],
			},
		];
	});
}

function addAlterInformation(characters) {
	const { alterIdToBaseOpId, baseOpIdToAlterId } = getAlterMapping();

	return characters.map(([charId, character]) => {
		return [
			charId,
			{
				...character,
				alterId: baseOpIdToAlterId[character.charId] ?? null,
				baseOperatorId: alterIdToBaseOpId[character.charId] ?? null,
			},
		];
	});
}

function addReleaseOrderAndLimited(
	characters,
	{ releaseOrderAndLimitedLookup }
) {
	return characters.map(([charId, character]) => {
		return [
			charId,
			{
				...character,
				...releaseOrderAndLimitedLookup[
					CHARACTER_LOCALES.zh_CN[charId].name
				],
			},
		];
	});
}

function addRiicSkills(characters, { opToRiicSkillsMap }) {
	return characters.map(([charId, character]) => {
		return [
			charId,
			{
				...character,
				riicSkills: opToRiicSkillsMap[charId],
			},
		];
	});
}

function addModules(characters) {
	const operatorModulesLookup = aggregateModuleData();

	return characters.map(([charId, character]) => {
		return [
			charId,
			{
				...character,
				modules: operatorModulesLookup[charId] ?? [],
			},
		];
	});
}

function convertRarityIndex(characters) {
	return characters.map(([charId, character]) => {
		return [
			charId,
			{
				...character,
				rarity: parseInt(character.rarity.replace("TIER_", "")),
			},
		];
	});
}

function sortByRarityAndRelease(characters) {
	return characters.sort(([_, charA], [__, charB]) => {
		return (
			charB.rarity - charA.rarity ||
			charB.releaseOrder - charA.releaseOrder
		);
	});
}

function addHasGuide(characters, { resultFetchContentfulGraphQl }){
	const {operatorAnalysisCollection} = resultFetchContentfulGraphQl
	const operatorsWithGuides = Object.fromEntries(
		operatorAnalysisCollection.items.map((item) => [
			item.operator.name,
			item.operator.slug,
		])
	);
	return characters.map(([charId, character]) => {
		return [
			charId,
			{
				...character,
				hasGuide: !!operatorsWithGuides[character.name.en_US],
			},
		];
	});
}

// createOperatorsJson(path.join(__dirname, "../data"))
