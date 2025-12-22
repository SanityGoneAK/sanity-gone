import { promises as fs } from "fs";
import path from "path";

import { Combination } from "js-combinatorics";

import { professionToClass } from "../src/utils/classes";
import { toTitleCase } from "../src/utils/strings";
import cnCharacterTable from "./data/cn/gamedata/excel/character_table.json" assert { type: "json" };
import cnGachaTable from "./data/cn/gamedata/excel/gacha_table.json";
import enCharacterTable from "./data/en/gamedata/excel/character_table.json" assert { type: "json" };
import enGachaTable from "./data/en/gamedata/excel/gacha_table.json";
import jpCharacterTable from "./data/jp/gamedata/excel/character_table.json" assert { type: "json" };
import jpGachaTable from "./data/jp/gamedata/excel/gacha_table.json";
import krCharacterTable from "./data/kr/gamedata/excel/character_table.json" assert { type: "json" };
import krGachaTable from "./data/kr/gamedata/excel/gacha_table.json";
import twCharacterTable from "./data/tw/gamedata/excel/character_table.json" assert { type: "json" };
import twGachaTable from "./data/tw/gamedata/excel/gacha_table.json";

const GACHA_LOCALES = {
	zh_CN: cnGachaTable,
	en_US: enGachaTable,
	ja_JP: jpGachaTable,
	ko_KR: krGachaTable,
	zh_TW: twGachaTable,
};

const CHARACTER_LOCALES = {
	zh_CN: cnCharacterTable,
	en_US: enCharacterTable,
	ja_JP: jpCharacterTable,
	ko_KR: krCharacterTable,
	zh_TW: twCharacterTable,
};

const nameOverrides = {
	"THRM-EX": "Thermal-EX",
	"Justice Knight": "'Justice Knight'",
};

const recruitableNameToIdOverride = {
	"Justice Knight": "char_4000_jnight",
	샤미르: "char_254_vodfox",
	奧斯塔: 'char_346_aosta'
};

export async function createRecruitmentJson(dataDir, locale) {
	console.log(`Creating ${path.join(dataDir, "recruitment.json")}...`);

	const RECRUITMENT_TAGS = getRecruitmentTags(locale);
	const recruitableOperators = getRecruitableOperators(locale);
	const operatorNameToCharId = getOperatorNameToCharIdMap(locale);

	const recruitment = recruitableOperators.flatMap((opNames, r) =>
		opNames
			.filter((name) => !!name)
			.map((opName) => {
				const rarity = r + 1;
				const charId =
					recruitableNameToIdOverride[opName] ??
					operatorNameToCharId[opName];
				const opData = CHARACTER_LOCALES[locale][charId];
				const tags = [
					...(opData.tagList ?? []),
					toTitleCase(opData.position),
					professionToClass(opData.profession),
				];
				if (rarity === 1) {
					tags.push("Robot");
				} else if (rarity === 6) {
					tags.push("Top Operator");
				}
				if (rarity >= 5) {
					tags.push("Senior Operator");
				}
				return {
					id: charId,
					name: nameOverrides[opName] ?? opName,
					rarity,
					tags: convertRecruitmentTagNamesToId(locale, tags),
				};
			})
	);

	const tagSets = Array(3)
		.fill(0)
		.flatMap((_, i) => [...new Combination(RECRUITMENT_TAGS, i + 1)]);

	const recruitmentResults = Object.fromEntries(
		tagSets
			.map((tagSet) => ({
				tags: tagSet.sort(),
				operators: recruitment
					.filter((recruitable) =>
						tagSet.every(
							(tag) =>
								recruitable.tags.includes(tag) &&
								(recruitable.rarity < 6 || tagSet.includes(11))
						)
					)
					.sort((op1, op2) => op2.rarity - op1.rarity),
			}))
			.filter((recruitData) => recruitData.operators.length > 0)
			.map((result) => {
				// for guaranteed tags, we only care about 1*, 4*, 5*, and 6*.
				// we include 1* if
				// - the otherwise highest rarity is 5 (1* and 5* can't coexist), or
				// - the Robot tag is available
				const lowestRarity = Math.min(
					...result.operators
						.map((op) => op.rarity)
						.filter((rarity) => rarity > 1)
				);
				if (lowestRarity > 1 && lowestRarity < 4) {
					return [
						result.tags,
						{
							...result,
							guarantees: [],
						},
					];
				}

				const guarantees = Number.isFinite(lowestRarity)
					? [lowestRarity]
					: [];
				if (
					(result.operators.find((op) => op.rarity === 1) &&
						lowestRarity >= 5) ||
					result.tags.includes(28)
				) {
					guarantees.push(1);
				}
				return [
					result.tags.sort(),
					{
						...result,
						guarantees,
					},
				];
			})
	);

	await fs.writeFile(
		path.join(dataDir, "recruitment.json"),
		JSON.stringify(recruitmentResults, null, 2)
	);

	await fs.writeFile(
		path.join(dataDir, "recruitment-tags.json"),
		JSON.stringify(GACHA_LOCALES[locale].gachaTags, null, 2)
	);
}

function getRecruitmentTags(locale) {
	return GACHA_LOCALES[locale].gachaTags
		.filter((tag) => tag.tagId !== 1012 || tag.tagId !== 1013)
		.map((tag) => tag.tagId);
}

function getOperatorNameToCharIdMap(locale) {
	return Object.fromEntries(
		Object.entries(CHARACTER_LOCALES[locale])
			.filter(
				([charId, character]) =>
					character.profession !== "TRAP" &&
					!charId.startsWith("trap_") &&
					!character.isNotObtainable
			)
			.map(([charId, { name }]) => [name, charId])
	);
}

function getRecruitableOperators(locale) {
	const recruitDetail = GACHA_LOCALES[locale].recruitDetail;

	let recruitmentStrings = recruitDetail
		.replace(/\\r\\n|\\n|\\r/g, "\n")
		.split(/★+/)
		.slice(1);
	if (locale === "ja_JP") {
		recruitmentStrings = recruitmentStrings.slice(2);
	}

	return recruitmentStrings.map((line) =>
		line
			.replace(/\n|-{2,}/g, "")
			.split(/\s*\/\s*|<@rc\.eml>([^/]+)<\/>/)
			.filter((item) => !!item && item.trim())
			.map((item) => item.trim())
	);
}

function convertRecruitmentTagNamesToId(locale, tags) {
	return tags.map((tag) => {
		let tagId = GACHA_LOCALES[locale].gachaTags.find(
			(t) => t.tagName === tag
		)?.tagId;

		if (!tagId) {
			tagId = GACHA_LOCALES.en_US.gachaTags.find(
				(t) => t.tagName === tag
			)?.tagId;
		}

		if (!tagId) {
			throw new Error(
				`Tag ${tag} not found in ${locale} or English Locale`
			);
		}
		return tagId;
	});
}
