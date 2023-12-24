import { promises as fs } from "fs";
import path from "path";

import enUniequipTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/uniequip_table.json";
import enCharacterTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/character_table.json";

import krUniequipTable from "./ArknightsGameData_YoStar/ko_KR/gamedata/excel/uniequip_table.json";
import krCharacterTable from "./ArknightsGameData_YoStar/ko_KR/gamedata/excel/character_table.json";

import jpUniequipTable from "./ArknightsGameData_YoStar/ja_JP/gamedata/excel/uniequip_table.json";
import jpCharacterTable from "./ArknightsGameData_YoStar/ja_JP/gamedata/excel/character_table.json";

import cnUniequipTable from "./ArknightsGameData/zh_CN/gamedata/excel/uniequip_table.json";
import cnCharacterTable from "./ArknightsGameData/zh_CN/gamedata/excel/character_table.json";

import { professionToClass } from "../src/utils/classes";
import { descriptionToHtml } from "../src/utils/description-parser";
import jetTraitTranslations from "./translations/jet/traits.json";
import { fixJetSkillDescriptionTags } from "./fix-jet-skill-descs";

const EXCLUDED_BRANCHES = new Set(["notchar1", "notchar2", "none1", "none2"]);

const BRANCH_LOCALES = {
	zh_CN: cnUniequipTable.subProfDict,
	en_US: enUniequipTable.subProfDict,
	ja_JP: jpUniequipTable.subProfDict,
	ko_KR: krUniequipTable.subProfDict,
};

const CHARACTER_LOCALES = {
	zh_CN: cnCharacterTable,
	en_US: enCharacterTable,
	ja_JP: jpCharacterTable,
	ko_KR: krCharacterTable,
};

// These are translations of the branches in CN that are out, but are not yet added to EN.
// @TODO: Automate this with some sort of Machine Translation OpenAI Json mode probably works.
const CN_BRANCH_TLS = {
	ritualist: {
		en_US: "Ritualist",
		ja_JP: "儀式師",
		ko_KR: "의식술사",
	},
	hunter: {
		en_US: "Hunter",
		ja_JP: "ハンター",
		ko_KR: "사냥꾼",
	},
	primcaster: {
		en_US: "Primcaster",
		ja_JP: "プリムキャスター",
		ko_KR: "프림캐스터",
	},
	loopshooter: {
		en_US: "Loopshooter",
		ja_JP: "ループシューター",
		ko_KR: "루프슈터",
	},
};

// Separate EN overrides.
// Kept separate from the above overrides for the sake of clarity.
// Notably, these overrides are SUBPROFESSION IDs (to stay consistent with the above).
const BRANCH_NAME_OVERRIDES = {
	physician: "Single-target",
};

const TRAIT_OVERRIDES = {
	musha: "Can't be healed by other units. Recovers <@ba.kw>30/50/70</> (scales with elite promotion) self HP every time this operator attacks an enemy",
	chain: 'Attacks deal <@ba.kw>Arts damage</> and jump between <@ba.kw>3</> (<@ba.kw>4</> at Elite 2) enemies (jump range is <@ba.kw>1.7</> tiles). Each jump deals 15% less damage and inflicts an <@ba.kw>80%</> <span class="skill-tooltip">Slow</span> for <@ba.kw>0.5</> seconds',
	phalanx:
		"Normally <@ba.kw>does not attack</>, but has <@ba.kw>+200%</> DEF and <@ba.kw>+20</> RES; When skill is active, attacks deal <@ba.kw>AoE Arts damage</>",
	geek: "Continually loses <@ba.kw>3%</> max HP per second",
	wandermedic:
		"Restores the HP of allies\nRecovers <@ba.dt.element>Elemental damage</> equal to <@ba.kw>{ep_heal_ratio:0%}</> of Attack Power</br>(Can heal <@ba.dt.element>Elemental damage</> of unhurt units)",
	slower: 'Deals <@ba.kw>Arts damage</> and <span class="skill-tooltip">Slows</span> the target by <@ba.kw>80%</> for <@ba.kw>0.8</> seconds',
	splashcaster:
		"Deals <@ba.kw>AOE Arts damage</> with a splash radius of <@ba.kw>1.1</> tiles",
	bombarder:
		"Attacks deal <@ba.kw>two instances</> of Physical damage to <@ba.kw>ground</> enemies in a <@ba.kw>0.9</> tile area (The second instance is a shockwave that has half the normal ATK)",
	aoesniper:
		"Deals <@ba.kw>AOE Physical damage</> with a splash radius of <@ba.kw>1.0</> tile",
	fortress:
		"Prioritize <@ba.kw>Long range splash attack</> (splash radius of <@ba.kw>1.0</> tiles) when not blocking",
	funnel: "Controls a <@ba.kw>Drone</> that deals <@ba.kw>Arts damage</>; When the Drone continuously attacks the same enemy, its damage will increase (from 20% up to 110% of the operator's ATK, linearly)",
};

/**
 * Unofficial translations of CN traits. These are only used if the official translation is missing
 * (because an operator with that trait hasn't been released on EN yet).
 */
const CN_TRAIT_TLS = {
	ritualist: {
		en_US: "Deal <@ba.kw>arts damage</>, can inflict <@ba.kw>elemental damage</>",
		ja_JP: "アーツダメージを与え、<@ba.kw>元素ダメージ</>を与えることができます",
		ko_KR: "아츠 피해를 입히며, <@ba.kw>원소 피해</>를 입힐 수 있습니다",
		zh_CN: "攻击造成<@ba.kw>法术伤害</>，可以造成<@ba.kw>元素损伤</>",
	},
	hunter: {
		en_US: "Consumes bullets for attacks, increases attack power to <@ba.kw>120%</>. Slowly reloads bullets when not attacking (up to 8 bullets)",
		ja_JP: "攻撃には弾薬を消費し、攻撃力が<@ba.kw>120%</>に増加します。攻撃していないときに弾薬をゆっくりと補充します（最大8発）",
		ko_KR: "공격 시 총알을 소비하며, 공격력이 <@ba.kw>120%</>으로 증가합니다. 공격하지 않을 때 천천히 총알을 재충전합니다 (최대 8발)",
		zh_CN: "攻击时需要消耗子弹且攻击力提升至<@ba.kw>120%</>，不攻击时会缓慢地装填子弹（最多8发）",
	},
	primcaster: {
		en_US: "Deal <@ba.kw>arts damage</>, can inflict <@ba.kw>elemental damage</>",
		ja_JP: "アーツダメージを与え、<@ba.kw>元素ダメージ</>を与えることができます",
		ko_KR: "아츠 피해를 입히며, <@ba.kw>원소 피해</>를 입힐 수 있습니다",
		zh_CN: "攻击造成<@ba.kw>法术伤害</>，可以造成<@ba.kw>元素伤害</>",
	},
	loopshooter: {
		en_US: "Can only attack when holding <@ba.kw>boomerangs</> (boomerangs take time to return)",
		ja_JP: "ブーメランを持っているときだけ攻撃できます（ブーメランは戻るのに時間がかかります）",
		ko_KR: "프리즈비를 들고 있을 때만 공격할 수 있습니다 (프리즈비는 돌아오는 데 시간이 걸립니다)",
		zh_CN: "持有<@ba.kw>回旋投射物</>时才能够攻击（投射物需要时间回收）",
	},
};

/**
 * Creates `{dataDir}/branches.json`, a map of `subProfessionId` to branch name, trait description, and class.
 *
 * @param {string} dataDir - output directory
 */
export async function createBranchesJson(dataDir) {
	console.log(`Creating ${path.join(dataDir, "branches.json")}...`);

	const transformations = [
		removeExcludedBranches,
		getLocalizedName,
		getLocalizedTraitsAndClass,
	];

	const branches = transformations.reduce((acc, transformation) => {
		return transformation(acc);
	}, Object.keys(BRANCH_LOCALES.zh_CN));

	await fs.writeFile(
		path.join(dataDir, "branches.json"),
		JSON.stringify(Object.fromEntries(branches), null, 2)
	);
}

/**
 * @param {array} branches - Current list of Sub Classes
 */
function removeExcludedBranches(branches) {
	return branches.filter((name) => !EXCLUDED_BRANCHES.has(name));
}

/**
 * @param {array} branches - Current list of Sub Classes
 */
function getLocalizedName(branches) {
	return branches.map((branch) => {
		return [
			branch,
			{
				branchName: getLocalesForBranchName(
					branch,
					"subProfessionName"
				),
			},
		];
	});
}

/**
 * @param {array} branches - Current list of Sub Classes
 */
function getLocalizedTraitsAndClass(branches) {
	return branches.map(([branchId, branch]) => {
		return [
			branchId,
			{
				...branch,
				class: getLocalesForBranchTraits(branchId, "class"),
				trait: getLocalesForBranchTraits(branchId, "trait"),
			},
		];
	});
}

/**
 * @param {string} branchId - Single id of a branch
 * @param {string} value - Defines which value it should grab from the JSON files
 */
function getLocalesForBranchName(branchId, value) {
	return Object.keys(BRANCH_LOCALES).reduce((locales, locale) => {
		// Use overrides until they are outdated
		if (CN_BRANCH_TLS[branchId] && locale != "zh_CN") {
			locales[locale] = CN_BRANCH_TLS[branchId][locale];
		}

		// Always use the official translations
		if (BRANCH_LOCALES[locale][branchId]) {
			locales[locale] = BRANCH_LOCALES[locale][branchId][value] ?? "";
		}

		// Only override when we absolutely need to
		if (BRANCH_NAME_OVERRIDES[branchId] && locale == "en_US") {
			locales[locale] = BRANCH_NAME_OVERRIDES[branchId];
		}

		return locales;
	}, {});
}

/**
 * @param {string} branchId - Single id of a branch
 * @param {string} target - Defines which value it should return from the locales
 */
function getLocalesForBranchTraits(branchId, target) {
	return Object.keys(CHARACTER_LOCALES).reduce((locales, locale) => {
		let fallback = false;
		let firstOp = Object.values(CHARACTER_LOCALES[locale]).find(
			(op) =>
				op.subProfessionId === branchId &&
				(op.rarity != "TIER_1" || op.rarity != "TIER_2")
		);

		// If the branch only exists in CN use a CN character
		if (!firstOp) {
			firstOp = Object.values(CHARACTER_LOCALES.zh_CN).find(
				(op) =>
					op.subProfessionId === branchId &&
					(op.rarity != "TIER_1" || op.rarity != "TIER_2")
			);
			fallback = true;
		}

		let description = firstOp.description;
		const trait = firstOp.trait;
		const className = professionToClass(firstOp.profession);

		if (branchId in TRAIT_OVERRIDES && locale == "en_US") {
			description = TRAIT_OVERRIDES[branchId];
		}

		if (branchId in CN_TRAIT_TLS && locale != "zh_CN" && fallback) {
			description = CN_TRAIT_TLS[branchId][locale];
		} else if (description in jetTraitTranslations.full && fallback) {
			description = fixJetSkillDescriptionTags(
				jetTraitTranslations.full[description].en
			);
		} else if (fallback) {
			console.warn(
				"No trait translation found for subProfessionId:",
				branchId,
				locale
			);
		}

		const blackboard = trait
			? trait.candidates[trait.candidates.length - 1].blackboard
			: [];

		const options = {
			class: className,
			trait: descriptionToHtml(description, blackboard),
		};

		locales[locale] = options[target];

		return locales;
	}, {});
}
