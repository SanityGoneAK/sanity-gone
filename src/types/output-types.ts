import type { Range } from "./gamedata-types";
import type { RiicSkill } from "../../scripts/aggregate-riic-data";
import type { CharacterStatValues } from "../utils/character-stats";
import type { InterpolatedValue } from "../utils/description-parser";

export type { SkinSource, SkinCostTokenType } from "../../scripts/scrape-prts";
export type { RiicSkill } from "../../scripts/aggregate-riic-data";

// This file contains the output types of our gamedata scripts - the game data after it's been
// processed by the scripts. These types do NOT fully conform to raw gamedata.
/**
 * Represents a single Arknights character (an operator or summon or something else).
 */
export interface Character {
	charId: string;
	name: string;
	// cnName: string;
	profession: string;
	subProfessionId: string;
	position: string;
	description: string | null;
	phases: CharacterPhase[];
	rarity: number; // 1-indexed
	favorKeyFrames: FavorKeyFrame[] | null;
	potentialRanks: PotentialRanks[];
	talents: Talent[];
	skills: CharacterTableSkill[];
	allSkillLvlup: SkillLevelUpgrade[];
	skillData: SkillTableSkill[];
	tagList: Array<string>;
	[otherProperties: string]: unknown;
}

export type Rarity = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Represents a single Arknights operator, which has some extra properties compared to a `Character`.
 */
export interface Operator extends Character {
	voices: Voice[];
	skins: Skin[];
	isLimited: boolean;
	releaseOrder: number; // lower value means released earlier
	summons: Summon[];
	modules: Module[];
	// /** The character ID of this operator's alter, or `null` if it doesn't have one. */
	alterId: string | null;
	// /** The corresponding base operator's character ID if this operator is an alter, or `null` if this operator isn't an alter. */
	baseOperatorId: string | null;
	riicSkills: RiicSkill[];
	hasGuide: boolean;
	potentialItemId: string;
	itemUsage: string;
	itemDesc: string;

	handbook: {
		profile: string;
		basicInfo: Array<{
			title: string;
			value: string;
		}>;
		physicalExam: Array<{
			title: string;
			value: string;
		}>;
		clinicalAnalysis: string;
		promotionRecord: string;
		archives: string[];
	};
}

/**
 * Represents an Arknights summon. Currently only has a single extra property: the operatorId of the operator that summons it.
 */
export interface Summon extends Character {
	operatorId: string;
}

/**
 * Represents an Arknights enemy
 */
export interface Enemy {
	enemyId: string;
	enemyIndex: string;
	enemyTags: string[];
	name: string;
	enemyRace: string;
	enemyLevel: string;
	description: string;
	attackType: string;
	endure: string;
	attack: string;
	defence: string;
	resistance: string;
	ability: unknown;
	levels: EnemyLevels[];
}

/**
 * Represents a "phase" of an Arknights character (an operator or summon or something else).
 * At a specific phase, they might have different max levels, attribute keyframes, and ranges.
 */
interface CharacterPhase {
	characterPrefabKey: string;
	// character_table.json's "phases" objects have rangeIds,
	// but we expect this to be denormalized first
	range: Range;
	maxLevel: number;
	attributesKeyFrames: AttributeKeyFrame[];
	evolveCost: ItemCost[] | null;
	[otherProperties: string]: unknown;
}

/**
 * A given talent at a specific potential level.
 */
export interface TalentPhase {
	unlockCondition: {
		phase: string;
		level: number;
	};
	requiredPotentialRank: number;
	prefabKey: unknown; // unused
	/** Can be `null` for e.g. summon talents. */
	name: string | null;
	description: string | null;
	// this object only has rangeId,
	// but we'll expect that the range has been denormalized ahead of time
	range: Range | null;
	// this is the same format of interpolation object as is used in SkillInfo
	blackboard: InterpolatedValue[];
	[otherProperties: string]: unknown;
}

/**
 * A given talent at any of its "phases" (elite and potential improvements).
 */
export interface Talent {
	candidates: TalentPhase[];
}

/**
 * Represents the attributes/stats of a character at a given "key frame",
 * which is to say, a specific level and elite level.
 */
export interface AttributeKeyFrame {
	level: number;
	data: {
		maxHp: number;
		atk: number;
		def: number;
		baseAttackTime: number;
		magicResistance: number;
		cost: number;
		blockCnt: number;
		respawnTime: number;
		[otherProperties: string]: unknown;
	};
}

/**
 * Represents a "key frame" of what stats an operators gains at a certain level of
 * trust.
 */
export interface FavorKeyFrame {
	level: number;
	data: {
		maxHp: number;
		atk: number;
		def: number;
		magicResistance: number;
		[otherProperties: string]: unknown;
	};
}

/**
 * Represents the bonuses at each potential level for a character.
 * Used for potential dropdowns and anything else that needs to know how potentials
 * affect a specific character.
 */
export interface PotentialRanks {
	buff: {
		attributes: {
			attributeModifiers: {
				attributeType: string;
				value: number;
				[otherProperties: string]: unknown;
			}[];
			[otherProperties: string]: unknown;
		};
	} | null;
	type: string;
	description: string;
	equivalentCost: unknown; // unused
}

/** Keys are strings used in game data, values are what we display in OperatorSkillsPanel */
export const SkillType = {
	PASSIVE: "Passive",
	MANUAL: "Manual Trigger",
	AUTO: "Auto Trigger",
} as const;

/** Keys are strings used in game data, values are what we display in OperatorSkillsPanel */
export const SkillSpType = {
	INCREASE_WITH_TIME: "Per Second",
	INCREASE_WHEN_ATTACK: "Offensive",
	INCREASE_WHEN_TAKEN_DAMAGE: "Defensive",
	UNUSED: "UNUSED",
} as const;

/**
 * Represents a skill's information at a specific skill level.
 */
interface SkillLevel {
	name: string;
	description: string | null;
	// SkillLevelObject only has rangeId (of type string) in the game data,
	// but we expect it to be denormalized into a RangeObject before being passed to <SkillInfo />
	rangeId: string | null;
	range: Range | null;
	skillType: keyof typeof SkillType;
	spData: {
		spType: keyof typeof SkillSpType;
		spCost: number;
		initSp: number;
		levelUpCost: unknown; // unused
		maxChargeTime: unknown; // unused
		increment: unknown; // unused
	};
	duration: number;
	// "blackboard" is used for interpolating formatted numeric values into the description,
	// e.g. "gains ATK <@ba.vup>+{atk:0%}</>, <@ba.vup>reduced</> attack interval, DEF <@ba.vup>+{def:0%}</>, ..."
	// references blackboard.atk, blackboard.def and is formatted to
	// "gains ATK +140%, reduced attack interval, DEF +80%, ..." with blue text for the interpolated values
	blackboard: InterpolatedValue[];
	prefabId: unknown; // unused
	[otherProperties: string]: unknown;
}

/** Represents a single object in the `skills` array of a given `character_table.json` entry. */
export interface CharacterTableSkill {
	skillId: string | null;
	levelUpCostCond: MasteryUpgrade[];
	unlockCond: {
		phase: string;
		level: number;
	};
	[otherProperties: string]: unknown;
}

/**
 * Represents an operator skill. Importantly, this is the object taken from `skill_table.json`,
 * **not** the `skills` property on a given `character_table.json` entry.
 */
export interface SkillTableSkill {
	skillId: string;
	iconId: string | null;
	levels: SkillLevel[];
	[otherProperties: string]: unknown;
}

export interface MasteryUpgrade {
	unlockCond: {
		phase: string;
		level: number;
	};
	lvlUpTime: number;
	/** Can be null for e.g. summon skills. */
	levelUpCost: ItemCost[] | null;
}

export interface SkillLevelUpgrade {
	unlockCond: {
		phase: string;
		level: number;
	};
	/** Can be null for e.g. summon skills. */
	lvlUpCost: ItemCost[] | null;
}

export interface ItemCost {
	id: string;
	count: number;
	/** just `type`, which seems to always be `"MATERIAL"`, so very not useful*/
	[otherProperties: string]: unknown;
}

/**
 * Represents an operator module.
 */
export interface Module {
	moduleId: string;
	/** e.g. "CHA-X", "CHA-Y" */
	moduleIcon: string;
	moduleName: string;
	phases: ModulePhase;
	moduleDescription: string;
	itemCost: ItemCost[];
	missionList: Mission[];
}

export interface Mission {
	description: string;
	moduleMissionId: string;
	jumpStageId: string | null;
}

/**
 * Represents an operator module at a specific module level.
 */
type ModulePhase = Array<{
	candidates: ModulePhaseCandidate[];
}>;

/**
 * Represents an operator module at a specific module level *and* operator potential.
 */
export interface ModulePhaseCandidate {
	traitEffect: string;
	/** Either `"update"` or `"override"`. */
	traitEffectType: string;
	talentEffect: string | null;
	talentIndex: number;
	displayRange: boolean;
	range: Range | null;
	attributeBlackboard: InterpolatedValue[];
	requiredPotentialRank: number; // 0-indexed
	/**
	 * Stat changes for this operator's summons if they equip this module.
	 * Is an empty object if the operator has no summons, or if the module doesn't affect their stats.
	 */
	tokenAttributeBlackboard: {
		[summonCharacterId: string]: InterpolatedValue[];
	};
	// I have just decided that I am not going to parse this manually.
	// No thank you

	// unlockCondition: {
	// 	// yes this one is still a number.
	// 	// not PHASE_1, PHASE_2, etc.
	// 	// kill me
	// 	phase: number;
	// 	level: number;
	// };
}

interface Voice {
	wordkey: string;
	voiceLangType: string;
	cvName: string[];
}

export interface Skin {
	name: string;
	skinId: string;
	illustId: string;
	avatarId: string;
	portraitId: string;
	displaySkin: {
		modelName: string | null;
		drawerList: string[] | null;
	};
	/** Skin type. One of "elite-zero" | "elite-one-or-two" | "skin" (where "skin" is a special skin). */
	type: string;
	/** Only present when type is "skin". @see {SkinSource} for possible values */
	obtainSources?: string[];
	/** Only present when type is "skin". Cost to purchase skin (with `tokenType`s, e.g. primes or CC currency) */
	cost?: number | null;
	/** Only present when type is "skin". @see {SkinCostTokenType} for possible values */
	tokenType?: string | null;
}

export type SearchResult =
	| OperatorSearchResult
	| ClassSearchResult
	| BranchSearchResult;

export type LocalizedString = {
	en_US: string;
	ja_JP: string;
	ko_KR: string;
	zh_CN: string;
};

export interface OperatorSearchResult {
	objectID: string;
	type: "operator";
	charId: string;
	name: LocalizedString;
	class: string;
	subclass: string;
	rarity: number;
	hasGuide: boolean;
}

export interface ClassSearchResult {
	objectID: string;
	type: "class";
	// TODO localize this
	name: string;
	class: string;
}

export interface BranchSearchResult {
	objectID: string;
	type: "branch";
	name: LocalizedString;
	class: string;
	subProfession: string;
}

export interface StageInfo {
	stageId: string;
	stageType: string;
	difficulty: string;
	levelId: string;
	zoneId: string;
	code: string;
	hardStagedId: string;
	mainStageId: string;
	isCnOnly: boolean;
}

export interface StageData {
	options: {
		characterLimit: number;
		maxLifePoint: number;
		initialCost: number;
		maxCost: number;
		costIncreaseTime: number;
		moveMultiplier: number;
		steeringEnabled: boolean;
		isTrainingLevel: boolean;
		functionDisableMask: number;
	};
	levelId: string;
	mapId: string;
	bgmEvent: string;
	mapData: MapData;
	routes: Route[];
	waves: Wave[];
	predefines: {
		[otherProperties: string]: unknown;
		tokenCards: TokenCard[];
	};
	enemyDbRefs: EnemyDbRefs[];
	[otherProperties: string]: unknown;
}

interface MapData {
	map: number[][];
	tiles: Tile[];
	width: number;
	height: number;
	[otherProperties: string]: unknown;
}

export interface Tile {
	tileKey: string;
	heightType: number;
	buildableType: number;
	passableMask: number;
}

export interface DraggableEntity {
	row: number | null;
	col: number | null;
	charId: string;
	range: string;
}

export interface DraggableCharacter extends DraggableEntity {
	type: "character";
	stats: CharacterStatValues;
	skill: SkillTableSkill;
	characterObject: Character;
}

export interface DraggableToken extends DraggableEntity {
	type: "token";
	tokeObject: TokenCard;
	tokenId: string;
}

export interface MapCoordinates {
	row: number;
	col: number;
}

export interface RouteCheckpoint {
	type: number;
	time: number;
	position: MapCoordinates;
	reachOffset: MapCoordinates;
	randomizeReachOffset: boolean;
	reachDistance: number;
}

export interface Route {
	[otherProperties: string]: unknown;
	motionMode: number;
	startPosition: MapCoordinates;
	endPosition: MapCoordinates;
	checkpoints: RouteCheckpoint[];
	allowDiagonalMove: boolean;
	visitEveryTileCenter: boolean;
	visitEveryNodeCenter: boolean;
}

export interface WaveFragment {
	preDelay: 0.0;
	actions: WaveFragmentAction[];
	name: null | string;
}
export interface WaveFragmentAction {
	actionType: number;
	managedByScheduler: boolean;
	key: string;
	count: number;
	preDelay: number;
	interval: number;
	routeIndex: number;
	blockFragment: boolean;
	autoPreviewRoute: boolean;
	isUnharmfulAndAlwaysCountAsKilled: boolean;
	waveIndex: number;
	elapsedTime: number;
	waveElapsedTime: number;
	enemyRangeStart: number;
	enemyRangeEnd: number;
}

export interface Wave {
	preDelay: number;
	postDelay: number;
	maxTimeWaitingForNextWave: number;
	fragments: WaveFragment[];
	name: null | string;
}

export interface TokenCard {
	initialCnt: number;
	hidden: boolean;
	alias: string;
	uniEquipIds: null | any; //not sure
	inst: {
		characterKey: string;
		level: number;
		phase: number;
		favorPoint: number;
		potentialRank: number;
	};
	skillIndex: number;
	mainSkillLvl: number;
	skinId: string;
	tmplId: string;
	overrideSkillBlackboard: null | any;
}

export interface EnemyDbRefs {
	useDb: boolean;
	id: string;
	level: number;
	overwrittenData: null | EnemyLevels;
}

export interface EnemyLevels {
	level?: number;
	attributes: EnemyAttributes;
	lifePointReduce: EnemyAttributeValue;
	rangeRadius: EnemyAttributeValue;
	[otherProperties: string]: unknown;
}

export interface EnemyAttributes {
	maxHp: EnemyAttributeValue;
	atk: EnemyAttributeValue;
	def: EnemyAttributeValue;
	magicResistance: EnemyAttributeValue;
	cost: EnemyAttributeValue;
	blockCnt: EnemyAttributeValue;
	moveSpeed: EnemyAttributeValue;
	attackSpeed: EnemyAttributeValue;
	baseAttackTime: EnemyAttributeValue;
	respawnTime: EnemyAttributeValue;
	hpRecoveryPerSec: EnemyAttributeValue;
	spRecoveryPerSec: EnemyAttributeValue;
	maxDeployCount: EnemyAttributeValue;
	massLevel: EnemyAttributeValue;
	baseForceLevel: EnemyAttributeValue;
	stunImmune: EnemyAttributeValue;
	silenceImmune: EnemyAttributeValue;
}

interface EnemyAttributeValue {
	m_defined: boolean;
	m_value: number | boolean;
}
