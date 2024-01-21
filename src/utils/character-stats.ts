import { range, isEqual } from "lodash-es";

import { toTitleCase } from "./strings";

import type { Range } from "../types/gamedata-types";
import type * as OutputTypes from "../types/output-types";

/**
 * Represents a set of stat values for a character.
 */
export interface CharacterStatValues {
	health: number;
	attackPower: number;
	defense: number;
	artsResistance: number;
	dpCost: number;
	blockCount: number;
	redeployTimeInSeconds: number;
	secondsPerAttack: number;
	rangeObject: Range;
}

/**
 * Represents the stat changes of a potential at each potential level.
 */
export interface PotentialStatChange {
	health: number;
	attackPower: number;
	defense: number;
	artsResistance: number;
	dpCost: number;
	attackSpeed: number;
	redeployTimeInSeconds: number;
	description: string | null;
}

/**
 * Returns true if the character stats do not change at all.
 * This is used to determine if a character is a summon without stat changes (such as a seaborn)
 * or not (such as Kal'tsit's spine Monster3 Mont3r Monst3r Muenster the 3rd).
 *
 * @param characterObject The character object to check (usually a token).
 */
export const doStatsChange = (
	characterObject: OutputTypes.Character
): boolean => {
	const { phases } = characterObject;
	const activePhase = phases[phases.length - 1];

	const startingKeyFrame = activePhase.attributesKeyFrames[0];
	const finalKeyFrame =
		activePhase.attributesKeyFrames[
			activePhase.attributesKeyFrames.length - 1
		];

	return !isEqual(startingKeyFrame.data, finalKeyFrame.data);
};

/**
 * Returns the stat values for a character at a given level.
 * If tokenId is provided, parentObject also needs to be provided.
 * This is necessary for modules that increase the stats of summons, such as Pozy Y.
 *
 * (This works fine for tokens otherwise, but module data in our current
 * schema is tied to the parent character/op of the token/summon in operators.json,
 * so we need the parent object in order to get the module stat increase for the token.)
 *
 * @param characterObject The character object to get the stats of.
 * @param values A dict of values to use for the calculation.
 * @param values.eliteLevel The elite level of the character.
 * @param values.level The level of the character.
 * @param values.trust Trust level of the character.
 * @param values.potential Potential of the character.
 * @param values.moduleId The module ID to get the stats of. Defaults to no module.
 * 						 (If this is supplied, moduleLevel must also be supplied)
 * @param values.moduleLevel The module level to get the stats of.
 * @param tokenId The token ID to get the stats of. (If this is supplied, parentObject must also be supplied)
 * @param parentObject The parent object of the token.
 */
export const getStatsAtLevel = (
	characterObject: OutputTypes.Character,
	values: {
		eliteLevel: number;
		level: number;
		trust: number;
		/** Zero-indexed potential (from 0 to 5). Confusing, but how the game data represents it. */
		potential: number;
		moduleId?: string | null;
		moduleLevel?: number;
	},
	tokenId?: string,
	parentObject?: OutputTypes.Character
): CharacterStatValues => {
	const { eliteLevel, level, trust, potential, moduleId, moduleLevel } =
		values;

	const { phases } = characterObject;
	const activePhase = phases[eliteLevel];
	const maxLevel = activePhase.maxLevel;

	const { range: rangeObject } = activePhase;

	const startingKeyFrame = activePhase.attributesKeyFrames[0];
	const finalKeyFrame =
		activePhase.attributesKeyFrames[
			activePhase.attributesKeyFrames.length - 1
		];

	const {
		maxHp,
		atk,
		def,
		magicResistance: res,
		cost: dp,
		blockCnt,
		respawnTime: redeploy,
		baseAttackTime,
	} = startingKeyFrame.data;

	const {
		maxHp: finalMaxHp,
		atk: finalMaxAtk,
		def: finalMaxDef,
		magicResistance: finalMaxRes,
	} = finalKeyFrame.data;

	const {
		maxHp: trustHp,
		atk: trustAtk,
		def: trustDef,
		magicResistance: trustRes,
	} = getStatIncreaseAtTrust(characterObject, trust);

	const {
		health: potHealth,
		attackPower: potAttack,
		defense: potDefense,
		artsResistance: potRes,
		attackSpeed: potASPD,
		dpCost: potDp,
		redeployTimeInSeconds: potRedeploy,
	} = doStatsChange(characterObject)
		? // if stats don't change (summon like skalter seaborn), favorKeyFrames is null
			getStatIncreaseAtPotential(characterObject, potential)
		: {
				health: 0,
				attackPower: 0,
				defense: 0,
				artsResistance: 0,
				attackSpeed: 0,
				dpCost: 0,
				redeployTimeInSeconds: 0,
			};

	const {
		atk: modAttack,
		max_hp: modHealth,
		def: modDefense,
		attack_speed: modASPD,
		magic_resistance: modRes,
		cost: modDp,
		respawn_time: modRedeploy,
		block_cnt: modBlock,
	} = moduleId
		? tokenId
			? getModuleStatIncrease(
					parentObject!,
					moduleId,
					moduleLevel!,
					tokenId
				)
			: getModuleStatIncrease(characterObject, moduleId, moduleLevel!)
		: {
				atk: 0,
				max_hp: 0,
				def: 0,
				attack_speed: 0,
				magic_resistance: 0,
				cost: 0,
				respawn_time: 0,
				block_cnt: 0,
			};

	// apply trust-based and potential-based transforms
	const health =
		linearInterpolateByLevel(level, maxLevel, maxHp, finalMaxHp) +
		trustHp +
		potHealth +
		modHealth;
	const attackPower =
		linearInterpolateByLevel(level, maxLevel, atk, finalMaxAtk) +
		trustAtk +
		potAttack +
		modAttack;
	const defense =
		linearInterpolateByLevel(level, maxLevel, def, finalMaxDef) +
		trustDef +
		potDefense +
		modDefense;
	const artsResistance =
		linearInterpolateByLevel(level, maxLevel, res, finalMaxRes) +
		trustRes +
		potRes +
		modRes;
	const redeployTimeInSeconds = redeploy + potRedeploy + modRedeploy;
	const dpCost = dp + potDp + modDp;
	const blockCount = blockCnt + modBlock;

	// ASPD...
	const secondsPerAttack = calculateSecondsPerAttack(
		baseAttackTime,
		100 + potASPD + modASPD
	);

	return {
		health,
		attackPower,
		defense,
		artsResistance,
		dpCost,
		blockCount,
		redeployTimeInSeconds,
		secondsPerAttack,
		rangeObject,
	};
};

const linearInterpolateByLevel = (
	level: number,
	maxLevel: number,
	baseValue: number,
	maxValue: number
): number => {
	return Math.round(
		baseValue + ((level - 1) * (maxValue - baseValue)) / (maxLevel - 1)
	);
};

export const calculateSecondsPerAttack = (
	baseAttackTime: number,
	aspd: number
): number => {
	return Math.round((baseAttackTime * 30) / (aspd / 100.0)) / 30;
};

/**
 * Get the PotentialStatChange corresponding to the given **zero-indexed** potential.
 * @param characterObject The character object to get the potential stat changes from.
 * @param potential Zero-indexed potential level (from 0 to 5).
 */
const getPotentialStatIncrease = (
	characterObject: OutputTypes.Character,
	potential: number
): PotentialStatChange => {
	// if `potential === 0`, that means Potential 1 in game, i.e. initial operator state and no bonuses.
	// In this case, return zeroes
	if (potential === 0) {
		return {
			artsResistance: 0,
			attackPower: 0,
			attackSpeed: 0,
			defense: 0,
			description: null,
			dpCost: 0,
			health: 0,
			redeployTimeInSeconds: 0,
		};
	}

	const { potentialRanks } = characterObject;
	/** Potential 2 is at potentialRanks[0], and Potential 6 is at potentialRanks[4] */
	const pot = potentialRanks[potential - 1];

	const statChanges: PotentialStatChange = {
		health: 0,
		attackPower: 0,
		defense: 0,
		artsResistance: 0,
		dpCost: 0,
		attackSpeed: 0,
		redeployTimeInSeconds: 0,
		description: null,
	};

	if (pot.buff == null) {
		let desc = pot.description;
		if (desc.startsWith("Improves ")) {
			desc = desc.replace("Improves ", "") + " Enhancement";
		} else if (desc === "天赋效果增强") {
			desc = "Talent Enhancement";
		} else if (desc === "第一天赋效果增强") {
			desc = "First Talent Enhancement";
		} else if (desc === "第二天赋效果增强") {
			desc = "Second Talent Enhancement";
		}
		return statChanges;
	}

	const attribType = pot.buff.attributes.attributeModifiers[0].attributeType;
	const attribChange = pot.buff.attributes.attributeModifiers[0].value;

	switch (attribType) {
		case "MAX_HP": // used to be 0
			statChanges.health += attribChange;
			break;
		case "ATK": // used to be 1
			statChanges.attackPower += attribChange;
			break;
		case "DEF": // used to be 2
			statChanges.defense += attribChange;
			break;
		case "MAGIC_RESISTANCE": // used to be 3
			statChanges.artsResistance += attribChange;
			break;
		case "COST": // used to be 4
			statChanges.dpCost += attribChange;
			break;
		case "ATTACK_SPEED": // used to be 7
			statChanges.attackSpeed += attribChange;
			break;
		case "RESPAWN_TIME": // used to be 21
			statChanges.redeployTimeInSeconds += attribChange;
			break;
		default:
			console.warn("Unrecognized attribute in potentials");
			break;
	}

	return statChanges;
};

/**
 * Returns the total potential stat increases for a character for the given **zero-indexed** potential level.
 * Is the result of adding all the relevant potential stat increases from getPotStatIncreases together.
 * @param characterObject The character object to get the potential stat changes from.
 * @param potential Zero-indexed potential level (from 0 to 5).
 */
export const getStatIncreaseAtPotential = (
	characterObject: OutputTypes.Character,
	potential: number
): PotentialStatChange => {
	const initialIncreases = {
		health: 0,
		attackPower: 0,
		defense: 0,
		artsResistance: 0,
		dpCost: 0,
		attackSpeed: 0,
		redeployTimeInSeconds: 0,
		description: null,
	};
	if (potential === 0) {
		return initialIncreases;
	}

	const relevantStatIncreases = range(1, potential + 1).map((p) =>
		getPotentialStatIncrease(characterObject, p)
	);
	return relevantStatIncreases.reduce(
		(vals: PotentialStatChange, previous: PotentialStatChange) => {
			return {
				health: vals.health + previous.health,
				attackPower: vals.attackPower + previous.attackPower,
				defense: vals.defense + previous.defense,
				artsResistance: vals.artsResistance + previous.artsResistance,
				dpCost: vals.dpCost + previous.dpCost,
				attackSpeed: vals.attackSpeed + previous.attackSpeed,
				redeployTimeInSeconds:
					vals.redeployTimeInSeconds + previous.redeployTimeInSeconds,
				description: null,
			};
		},
		initialIncreases
	);
};

/**
 * Gets a list of the **zero-indexed** potentials that modify an operator's stats.
 * This means not potentials that upgrade a talent / etc.
 *
 * This list includes Potential 0 by default, because downgrading to Potential 0 will decrease
 * stats to (usually) a unique value that isn't at any other potentials.
 *
 * @param characterObject The character object to get the potentials with stat changes for.
 */
export const getPotentialsWithStatChanges = (
	characterObject: OutputTypes.Character
): number[] => {
	const relevantStatIncreases = range(1, 6).map((p) =>
		getPotentialStatIncrease(characterObject, p)
	);

	const potList = [0];
	const zeroed = {
		health: 0,
		attackPower: 0,
		defense: 0,
		artsResistance: 0,
		dpCost: 0,
		attackSpeed: 0,
		redeployTimeInSeconds: 0,
		description: null,
	};
	for (let i = 0; i < 5; i++) {
		const cur = relevantStatIncreases[i];
		cur.description = null;
		if (!isEqual(cur, zeroed)) {
			potList.push(i + 1);
		}
	}

	return potList;
};

/**
 * Returns the stat increase at the given trust level.
 * Assumed that this is for one's own operator (not a support character), so trust over 100 has the same effect as
 * 100 trust.
 * @param characterObject The character object to get the trust stat changes for.
 * @param rawTrust The character's trust level (from 0 to 200).
 */
export const getStatIncreaseAtTrust = (
	characterObject: OutputTypes.Character,
	rawTrust: number
): {
	maxHp: number;
	atk: number;
	def: number;
	magicResistance: number;
} => {
	if (characterObject.favorKeyFrames == null) {
		throw new Error(
			`Can't get trust stat increase, favorKeyFrames is null; charId: ${characterObject.charId}`
		);
	}

	const trust = Math.min(100, rawTrust);
	const maxTrust =
		characterObject.favorKeyFrames[
			characterObject.favorKeyFrames.length - 1
		].data;

	return {
		maxHp: Math.round((trust * maxTrust.maxHp) / 100),
		atk: Math.round((trust * maxTrust.atk) / 100),
		def: Math.round((trust * maxTrust.def) / 100),
		magicResistance: Math.round((trust * maxTrust.magicResistance) / 100),
	};
};

interface ModuleStatChange {
	atk: number;
	max_hp: number;
	def: number;
	attack_speed: number;
	magic_resistance: number;
	cost: number;
	respawn_time: number;
	block_cnt: number;
}

/**
 * Returns the stat increase for a module at a given level.
 *
 * If tokenId is supplied, returns the stat increase for the token instead of the base character.
 *
 * @param characterObject The character object to get the module stat changes for.
 * @param moduleId The module ID to get the stat changes for. (Must be attached to the character object)
 * @param moduleLevel The module level to get the stat changes for.
 * @param tokenId The token ID to get the stat changes for. Returns the stat changes for the **TOKEN**,
 * NOT the base character, if this value is supplied.
 */
export const getModuleStatIncrease = (
	characterObject: OutputTypes.Character,
	moduleId: string,
	moduleLevel: number,
	tokenId?: string
): ModuleStatChange => {
	const statChanges = {
		atk: 0,
		max_hp: 0,
		def: 0,
		attack_speed: 0,
		magic_resistance: 0,
		cost: 0,
		respawn_time: 0,
		block_cnt: 0,
	};

	if (characterObject.modules == null) {
		throw new Error(
			`CharacterObject doesn't have modules, cannot get stat increase - charId: ${characterObject.charId}`
		);
	}
	const op = characterObject as OutputTypes.Operator;
	const module = op.modules.filter((mod) => mod.moduleId === moduleId)[0];

	// get specific phase
	// candidate for potential 0 (1) is used because potential does not affect stat changes
	const modulePhase = module.phases[moduleLevel - 1].candidates[0];

	const toCheck = !tokenId
		? modulePhase.attributeBlackboard
		: modulePhase.tokenAttributeBlackboard[
				tokenId as keyof typeof modulePhase.tokenAttributeBlackboard
			];

	if (!toCheck) {
		// this module doesn't change the summon stats
		return statChanges;
	}

	toCheck.forEach((iv) => {
		if (!(iv.key in statChanges)) {
			throw new Error(
				`Unknown attribute modified: ${iv.key} with value of ${iv.value} on module ${characterObject.charId}`
			);
		}
		// @ts-expect-error we literally just checked if the key exists
		statChanges[iv.key] += iv.value;
	});

	return statChanges;
};

/**
 * Returns if the character is melee/ranged/both for a character.
 *
 * @param position Position string from the character object.
 * @param description Description string from the character object.
 */
export function getMeleeOrRangedOrBoth(
	position: string,
	description: string | null
) {
	return description?.toLowerCase().includes("can be deployed on ranged")
		? "Melee or Ranged"
		: toTitleCase(position);
}

/**
 * Converts a PHASE_X string to a number.
 * Old format for PHASE_X was just a number, but it was changed to PHASE_1, PHASE_2, etc.
 *
 * @param phase The phase string to convert.
 */
export const phaseToNumber = (phase: string): number => {
	const match = /^PHASE_(\d)$/.exec(phase);
	if (match === null) {
		throw new Error(`Expected a phase. Got ${phase} instead`);
	}
	return +match[1];
};
