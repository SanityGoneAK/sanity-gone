import { promises as fs } from "fs";
import path from "path";

import cnCharacterTable from "./ArknightsGameData/zh_CN/gamedata/excel/character_table.json" assert { type: "json" };
import enCharacterTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/character_table.json" assert { type: "json" };
import jpCharacterTable from "./ArknightsGameData_YoStar/ja_JP/gamedata/excel/character_table.json" assert { type: "json" };
import krCharacterTable from "./ArknightsGameData_YoStar/ko_KR/gamedata/excel/character_table.json" assert { type: "json" };

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

import { handbookDict as cnHandbookDict } from "./ArknightsGameData/zh_CN/gamedata/excel/handbook_info_table.json" assert { type: "json" };
import { handbookDict as enHandbookDict } from "./ArknightsGameData_YoStar/en_US/gamedata/excel/handbook_info_table.json" assert { type: "json" };
import { handbookDict as jpHandbookDict } from "./ArknightsGameData_YoStar/ja_JP/gamedata/excel/handbook_info_table.json" assert { type: "json" };
import { handbookDict as krHandbookDict } from "./ArknightsGameData_YoStar/ko_KR/gamedata/excel/handbook_info_table.json" assert { type: "json" };

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

const HANDBOOK_LOCALES = {
	zh_CN: cnHandbookDict,
	en_US: enHandbookDict,
	ja_JP: jpHandbookDict,
	ko_KR: krHandbookDict,
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
 * @param {"zh_CN" | "en_US" | "ja_JP" | "ko_KR"} locale - output locale
 */
export async function createOperatorsJson(dataDir, locale) {
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
		resultFetchContentfulGraphQl,
	] = await Promise.all([
		fetchJetroyzSkillTranslations(),
		fetchJetroyzTalentTranslations(),
		getSkinObtainSourceAndCosts(),
		getReleaseOrderAndLimitedLookup(),
		aggregateRiicData(locale),
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
		addTraits,
		addPotentialRanks,
		addSummons,

		// @TODO: Convert ricc min elite to number
		// @TODO: Figure out SpTypes and SkillTypes
		// All summon data for a specific character must be parsed at this point (e.g. Skills, Phases)

		filterSummons,
		addLoreDetails,
		addHasGuide,
		addModules,
		addRiicSkills,
		addAlterInformation,
		addReleaseOrderAndLimited,
		sortByRarityAndRelease,
	];

	const characters = transformations.reduce((acc, transformation) => {
		return transformation(acc, locale, {
			summonIdToOperatorId,
			jetSkillTranslations,
			jetTalentTranslations,
			skinSourceAndCostLookup,
			releaseOrderAndLimitedLookup,
			opToRiicSkillsMap,
			resultFetchContentfulGraphQl,
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

function localizeCharacterDetails(characters, locale) {
	return characters.map(([charId, character]) => {
		return [
			charId,
			{
				...character,
				charId,
				name: getLocalesForValue(charId, locale, "name"),
				description: getLocalesForValue(charId, locale, "description"),
				tagList: getLocalesForValue(charId, locale, "tagList"),
				itemUsage: getLocalesForValue(charId, locale, "itemUsage"),
				itemDesc: getLocalesForValue(charId, locale, "itemDesc"),
				itemObtainApproach: getLocalesForValue(
					charId,
					locale,
					"itemObtainApproach"
				),
				serverLocales: Object.keys(CHARACTER_LOCALES).filter(
					(locale) => CHARACTER_LOCALES[locale][charId]
				),
			},
		];
	});
}

function collectSummonData(characters, _, { summonIdToOperatorId }) {
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

function getLocalesForValue(charId, locale, value) {
	if (value === "name" && !CHARACTER_LOCALES[locale][charId]) {
		return CHARACTER_LOCALES.zh_CN[charId].appellation;
	}

	if (value === "name" && charId === "char_1001_amiya2") {
		return CHARACTER_LOCALES[locale][charId][value] + " (Guard)";
	}

	if (value === "name" && charId === "char_1037_amiya3") {
		return CHARACTER_LOCALES[locale][charId][value] + " (Medic)";
	}

	if (
		value === "name" &&
		charId === "char_4055_bgsnow" &&
		locale === "en_US"
	) {
		return "Pozёmka";
	}

	return CHARACTER_LOCALES[locale][charId]
		? CHARACTER_LOCALES[locale][charId][value]
		: CHARACTER_LOCALES.zh_CN[charId][value];
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

function addTalents(characters, locale, { jetTalentTranslations }) {
	return characters.map(([charId, character]) => {
		const talents = (character.talents || []).map((talent, talentIndex) => {
			const candidates = (talent.candidates || []).map(
				(candidate, phaseIndex) => {
					const baseCandidateObject = {
						...candidate,
						name: "",
						description: "",
						range: candidate.rangeId
							? rangeTable[candidate.rangeId]
							: null,
					};
					const characterLocale =
						CHARACTER_LOCALES[locale][charId] ??
						CHARACTER_LOCALES.zh_CN[charId];

					if (
						!CHARACTER_LOCALES[locale][charId] &&
						jetTalentTranslations[charId] &&
						character.profession !== "TOKEN" &&
						locale === "en_US"
					) {
						try {
							const talentTL =
								jetTalentTranslations[charId][talentIndex][
									phaseIndex
								];
							baseCandidateObject.name = talentTL.name;
							baseCandidateObject.description = talentTL.desc;
						} catch {
							console.warn(
								`No translation found for: character ${charId}, talent index ${talentIndex}, phase index ${phaseIndex} at local ${locale}`
							);
						}
						return baseCandidateObject;
					}

					baseCandidateObject.name =
						characterLocale["talents"][talentIndex]["candidates"][
							phaseIndex
						].name;
					baseCandidateObject.description =
						characterLocale["talents"][talentIndex]["candidates"][
							phaseIndex
						].description;

					console.warn(
						`No translation found for: character ${charId}, talent index ${talentIndex}, phase index ${phaseIndex} at local ${locale}`
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

function addSkins(characters, locale, { skinSourceAndCostLookup }) {
	return characters.map(([charId, character]) => {
		const skins = Object.values(SKIN_LOCALES.zh_CN)
			.filter((skin) => {
				// special case:
				// amiya's guard form shows up as a skin, so we should filter that out
				// if (skin.skinId === "char_1001_amiya2#2") return false;
				// if (skin.skinId === "char_1037_amiya3#2") return false;
				return (
					skin.tmplId === charId ||
					(skin.charId === charId && skin.tmplId === null)
				);
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
				let skinName = "";

				if (
					skinType === "skin" &&
					SKIN_LOCALES.zh_CN[cnSkin.skinId]
				) {
					skinName = SKIN_LOCALES[locale][cnSkin.skinId]
						? SKIN_LOCALES[locale][cnSkin.skinId].displaySkin
								.skinName
						: SKIN_LOCALES.zh_CN[cnSkin.skinId].displaySkin
								.skinName;
				}

				if (
					skinType === "elite-one-or-two" ||
					skinType === "elite-zero"
				) {
					skinName = `Elite ${elite ?? 0}`;
				}

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

function addSkills(characters, locale, { jetSkillTranslations }) {
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
						if (skillId === "skchr_zebra_1") {
							// SPECIAL CASES
							// - heavyrain s1 (skchr_zebra_1) interpolates "duration" but this value is missing from the blackboard;
							//   we have to append it to the blackboard manually
							baseSkillLevelObject.blackboard.push({
								key: "duration",
								value: baseSkillLevelObject.duration,
							});
						}

						if (character.profession !== "TOKEN") {
							baseSkillLevelObject.name = "";
							baseSkillLevelObject.description = "";
							const skillTL = jetSkillTranslations[skillId];

							const skillLocale =
								SKILL_LOCALES[locale][skillId] ??
								SKILL_LOCALES["zh_CN"][skillId];

							baseSkillLevelObject.name =
								skillLocale.levels[levelIndex].name;
							baseSkillLevelObject.description =
								skillLocale.levels[levelIndex].description;

							if (
								skillTL &&
								!SKILL_LOCALES[locale][skillId] &&
								locale === "en_US"
							) {
								baseSkillLevelObject.name = skillTL.name;
								baseSkillLevelObject.description =
									skillTL.desc[levelIndex];
							}

							console.warn(
								`No translation found for: skill ${skillId}, level index ${levelIndex} at locale ${locale}`
							);
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

function addTraits(characters, locale) {
	return characters.map(([charId, character]) => {
		if (character.trait === null) {
			return [charId, character];
		}

		const candidates = (character.trait.candidates ?? []).map(
			(candidate, candidateIndex) => {
				const characterLocale =
					CHARACTER_LOCALES[locale][charId] ??
					CHARACTER_LOCALES.zh_CN[charId];

				const overrideDescripton =
					characterLocale.trait.candidates[candidateIndex]
						.overrideDescripton;

				return {
					...candidate,
					overrideDescripton: overrideDescripton,
				};
			}
		);

		return [
			charId,
			{
				...character,
				trait: {
					candidates,
				},
			},
		];
	});
}

function addPotentialRanks(characters, locale) {
	return characters.map(([charId, character]) => {
		const potentialRanks = (character.potentialRanks ?? []).map(
			(pontentialRank, potentialRankIndex) => {
				const characterLocale =
					CHARACTER_LOCALES[locale][charId] ??
					CHARACTER_LOCALES.zh_CN[charId];

				const description =
					characterLocale.potentialRanks[potentialRankIndex]
						.description;

				return {
					...pontentialRank,
					description: description,
				};
			}
		);

		return [
			charId,
			{
				...character,
				potentialRanks: potentialRanks,
			},
		];
	});
}

function filterSummons(characters) {
	return characters.filter(
		([charId, character]) => character.profession !== "TOKEN"
	);
}

function addLoreDetails(characters, locale) {
	return characters.map(([charId, character]) => {
		const languageKeyMap = {
			en_US: {
				basicInfo: "Basic Info",
				physicalExam: "Physical Exam",
				profile: "Profile",
				clinicalAnalysis: "Clinical Analysis",
				archive1: "Archive File 1",
				archive2: "Archive File 2",
				archive3: "Archive File 3",
				archive4: "Archive File 4",
				promotionRecord: "Promotion Record",
				performanceReview: "Performance Review",
				classConversionRecord1: "Class Conversion Record 1",
				classConversionRecord2: "Class Conversion Record 2",
			},
			zh_CN: {
				basicInfo: "基础档案",
				physicalExam: "综合体检测试",
				profile: "客观履历",
				clinicalAnalysis: "临床诊断分析",
				archive1: "档案资料一",
				archive2: "档案资料二",
				archive3: "档案资料三",
				archive4: "档案资料四",
				promotionRecord: "晋升记录",
				performanceReview: "综合性能检测结果",
				classConversionRecord1: "升变档案一",
				classConversionRecord2: "升变档案二",
			},
			ja_JP: {
				basicInfo: "基礎情報",
				physicalExam: "能力測定",
				profile: "個人履歴",
				clinicalAnalysis: "健康診断",
				archive1: "第一資料",
				archive2: "第二資料",
				archive3: "第三資料",
				archive4: "第四資料",
				promotionRecord: "昇進記録",
				performanceReview: "総合性能",
				classConversionRecord1: "昇格資料一",
				classConversionRecord2: "昇格資料二",
			},
			ko_KR: {
				basicInfo: "기본정보",
				physicalExam: "종합검진",
				profile: "프로필",
				clinicalAnalysis: "임상 진단 분석",
				archive1: "파일 자료 1",
				archive2: "파일 자료 2",
				archive3: "파일 자료 3",
				archive4: "파일 자료 4",
				promotionRecord: "승진 기록",
				performanceReview: "종합 성능 테스트 결과",
				classConversionRecord1: "프로모션 파일 자료 1",
				classConversionRecord2: "프로모션 파일 자료 2",
			},
		};

		const charIdToUse = ["char_1001_amiya2", "char_1037_amiya3"].some(
			(id) => id === charId
		)
			? "char_002_amiya"
			: charId;

		const actualLocale = HANDBOOK_LOCALES[locale][charIdToUse]
			? locale
			: "zh_CN";

		const isRobot = character.tagList.some((tag) => ['Robot', 'ロボット', '로봇', '支援机械'].includes(tag));

		const basicInfo = parseStoryText(
			getStoryText(
				actualLocale,
				charIdToUse,
				languageKeyMap[actualLocale].basicInfo
			),
			actualLocale
		);
		const physicalExam = parseStoryText(
			getStoryText(
				actualLocale,
				charIdToUse,
				isRobot ? languageKeyMap[actualLocale].performanceReview : languageKeyMap[actualLocale].physicalExam
			),
			actualLocale
		);
		const profile = getStoryText(
			actualLocale,
			charIdToUse,
			languageKeyMap[actualLocale].profile
		);
		const clinicalAnalysis = getStoryText(
			actualLocale,
			charIdToUse,
			languageKeyMap[actualLocale].clinicalAnalysis
		);
		const promotionRecord = getStoryText(
			actualLocale,
			charIdToUse,
			languageKeyMap[actualLocale].promotionRecord
		);

		const archives = [1, 2, 3, 4]
			.map((archiveNumber) =>
				getStoryText(
					actualLocale,
					charIdToUse,
					languageKeyMap[actualLocale][`archive${archiveNumber}`]
				)
			)
			.filter((archive) => archive);

		const classConversionRecord = [1, 2]
			.map((recordNumber) =>
				getStoryText(
					actualLocale,
					charIdToUse,
					languageKeyMap[actualLocale][
						`classConversionRecord${recordNumber}`
					]
				)
			)
			.filter((archive) => archive);

		return [
			charId,
			{
				...character,
				handbook: {
					profile,
					basicInfo,
					physicalExam,
					clinicalAnalysis,
					promotionRecord,
					archives,
					classConversionRecord,
				},
			},
		];
	});
}

/**
 *
 * @param {string} locale
 * @param {string} charId
 * @param {string} storyTitle
 */
function getStoryText(locale, charId, storyTitle) {
	const storyData = HANDBOOK_LOCALES[locale][charId].storyTextAudio.find(
		(story) => story.storyTitle === storyTitle
	);
	return storyData?.stories[0]?.storyText ?? null;
}

/**
 * Parses the given text and converts it into an array of objects.
 *
 * @param {string} text
 * @returns {Array<{ title: string, value: string }>} - An array of objects with title and value properties.
 */
function parseStoryText(text, locale) {
	const lines = text ? text.split("\n") : "";
	const objects = [];

	let currentTitle = "";
	let currentValue = "";

	for (const line of lines) {
		const match =
			locale === "en_US" || locale === "ko_KR"
				? line.match(/^\[([\p{L}\p{N}\s]+)\](.*)$/u)
				: line.match(/^【([^【】]+)】(.*)$/);

		if (match) {
			if (currentTitle !== "") {
				objects.push({
					title: currentTitle.trim(),
					value: currentValue.trim(),
				});
			}

			currentTitle = match[1];
			currentValue = match[2];
		} else {
			currentValue += "\n" + line;
		}
	}

	if (currentTitle !== "") {
		objects.push({
			title: currentTitle.trim(),
			value: currentValue.trim(),
		});
	}

	return objects;
}

function addSummons(characters, _, { summonIdToOperatorId }) {
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
	_,
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

function addRiicSkills(characters, locale, { opToRiicSkillsMap }) {
	return characters.map(([charId, character]) => {
		return [
			charId,
			{
				...character,
				riicSkills: ["char_1001_amiya2", "char_1037_amiya3"].some(
					(id) => id === charId
				)
					? opToRiicSkillsMap["char_002_amiya"]
					: opToRiicSkillsMap[charId],
			},
		];
	});
}

function addModules(characters, locale) {
	const operatorModulesLookup = aggregateModuleData(locale);

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

function addHasGuide(characters, _, { resultFetchContentfulGraphQl }) {
	const { operatorAnalysisCollection } = resultFetchContentfulGraphQl;
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
				hasGuide: !!operatorsWithGuides[character.name],
			},
		];
	});
}

// createOperatorsJson(path.join(__dirname, "../data"))
