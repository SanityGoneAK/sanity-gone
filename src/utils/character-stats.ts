import { isEqual } from "lodash-es";

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
 * @param values.trust Whether or not to add the max trust bonus.
 * 					   (Not granular, so either entire trust bonus or none)
 * @param values.pots Whether or not to add the max potential bonus.
 * 					  (Not granular, so either all or none)
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
		trust: boolean;
		pots: boolean;
		moduleId?: string | null;
		moduleLevel?: number;
	},
	tokenId?: string,
	parentObject?: OutputTypes.Character
): CharacterStatValues => {
	const { eliteLevel, level, trust, pots, moduleId, moduleLevel } = values;

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
	} = trust
		? getMaxTrustStatIncrease(characterObject)
		: {
				maxHp: 0,
				atk: 0,
				def: 0,
				magicResistance: 0,
			}; // pass 0 to everything if trust is off to avoid weird errors with summons

	const {
		health: potHealth,
		attackPower: potAttack,
		defense: potDefense,
		artsResistance: potRes,
		attackSpeed: potASPD,
		dpCost: potDp,
		redeployTimeInSeconds: potRedeploy,
	} = pots && doStatsChange(characterObject)
		? // if stats don't change (summon like skalter seaborn), favorKeyFrames is null
			getMaxPotStatIncrease(characterObject)
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
		linearInterpolate(level, maxLevel, maxHp, finalMaxHp) +
		(trust ? trustHp : 0) +
		potHealth +
		modHealth;
	const attackPower =
		linearInterpolate(level, maxLevel, atk, finalMaxAtk) +
		(trust ? trustAtk : 0) +
		potAttack +
		modAttack;
	const defense =
		linearInterpolate(level, maxLevel, def, finalMaxDef) +
		(trust ? trustDef : 0) +
		potDefense +
		modDefense;
	const artsResistance =
		linearInterpolate(level, maxLevel, res, finalMaxRes) +
		(trust ? trustRes : 0) +
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

const linearInterpolate = (
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
 * Returns an array of CharacterStatValues changes at each potential level,
 * with Pot2 at index 0 and Pot6 at index 4.
 * @param characterObject The character object to get the potential stat changes from.
 */
export const getPotStatIncreases = (
	characterObject: OutputTypes.Character
): PotentialStatChange[] => {
	const { potentialRanks } = characterObject;

	const statChanges: PotentialStatChange[] = [];

	potentialRanks.forEach((pot) => {
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
			statChanges.push({
				health: 0,
				attackPower: 0,
				defense: 0,
				artsResistance: 0,
				dpCost: 0,
				attackSpeed: 0,
				redeployTimeInSeconds: 0,
				description: desc,
			});
			return;
		}
		const curStats: PotentialStatChange = {
			health: 0,
			attackPower: 0,
			defense: 0,
			artsResistance: 0,
			dpCost: 0,
			attackSpeed: 0,
			redeployTimeInSeconds: 0,
			description: null,
		};
		const attribType =
			pot.buff.attributes.attributeModifiers[0].attributeType;
		const attribChange = pot.buff.attributes.attributeModifiers[0].value;

		switch (attribType) {
			case "MAX_HP": // used to be 0
				curStats.health += attribChange;
				break;
			case "ATK": // used to be 1
				curStats.attackPower += attribChange;
				break;
			case "DEF": // used to be 2
				curStats.defense += attribChange;
				break;
			case "MAGIC_RESISTANCE": // used to be 3
				curStats.artsResistance += attribChange;
				break;
			case "COST": // used to be 4
				curStats.dpCost += attribChange;
				break;
			case "ATTACK_SPEED": // used to be 7
				curStats.attackSpeed += attribChange;
				break;
			case "RESPAWN_TIME": // used to be 21
				curStats.redeployTimeInSeconds += attribChange;
				break;
			default:
				console.warn("Unrecognized attribute in potentials");
				break;
		}
		statChanges.push(curStats);
	});

	return statChanges;
};

/**
 * Returns the maximum potential stat increase for a character.
 * Is the result of adding all the potential stat increases from getPotStatIncreases together.
 * @param characterObject The character object to get the potential stat changes from.
 */
export const getMaxPotStatIncrease = (
	characterObject: OutputTypes.Character
): PotentialStatChange => {
	return getPotStatIncreases(characterObject).reduce(
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
		{
			health: 0,
			attackPower: 0,
			defense: 0,
			artsResistance: 0,
			dpCost: 0,
			attackSpeed: 0,
			redeployTimeInSeconds: 0,
			description: null,
		}
	);
};

/**
 * Returns the stat increase at max trust (200% for support, 100% for own operator) for a character.
 * @param characterObject The character object to get the trust stat changes for.
 */
export const getMaxTrustStatIncrease = (
	characterObject: OutputTypes.Character
): {
	maxHp: number;
	atk: number;
	def: number;
	magicResistance: number;
} => {
	if (characterObject.favorKeyFrames == null) {
		throw new Error(
			`Can't get max trust stat increase, favorKeyFrames is null; charId: ${characterObject.charId}`
		);
	}
	return characterObject.favorKeyFrames[
		characterObject.favorKeyFrames.length - 1
	].data;
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
