import type { InterpolatedValue } from "./description-parser";

// Any types for the gamedata of Arknights should go here.
// This file is for UNPROCESSED typings that fully conform with game data.
// Typings post-transformation can be found in output-types.ts.

export interface SharedProperties {
  name: string;
  description: string;
  appellation: string;
  profession: string;
  tokenKey: string | null;
  subProfessionId: string;
  rarity: number;
  isNotObtainable: boolean;
  trait: {
    candidates: {
      blackboard: InterpolatedValue[];
    }[];
  } | null;
}

/**
 * The raw game-data version of a single character.
 */
export interface Character extends SharedProperties {
  phases: {
    rangeId: string | null;
    [otherProperties: string]: unknown;
  }[];
  talents:
  | {
    candidates: {
      rangeId: string | null;
      name: string;
      description: string;
    }[];
  }[]
  | null;
  skills: {
    skillId: string | null;
    rangeId: string | null;
    overrideTokenKey: string | null;
  }[];
}

/**
 * Represents an Arknights range, in a grids format.
 * Each range is represented by a unique "range ID".
 */
export interface Range {
  id: string;
  direction: number;
  grids: {
    row: number;
    col: number;
  }[];
}

/**
 * Represents an original module formatting in the gamedata.
 *
 * Yes, it is a giant mess.
 */
export interface BattleEquip {
  phases: {
    equipLevel: number;
    parts: {
      target: string;
      addOrOverrideTalentDataBundle: {
        candidates:
        | {
          displayRangeId: boolean;
          upgradeDescription: string | null;
          talentIndex: number;
          requiredPotentialRank: number;
          rangeId: string | null;
          blackboard: InterpolatedValue[];
        }[]
        | null;
      };
      overrideTraitDataBundle: {
        candidates:
        | {
          additionalDescription: string | null;
          requiredPotentialRank: number;
          blackboard: InterpolatedValue[];
          overrideDescripton: string | null; // not a typo
        }[]
        | null;
      };
      [otherProperties: string]: unknown;
    }[];
    attributeBlackboard: InterpolatedValue[];
    tokenAttributeBlackboard: InterpolatedValue[];
  }[];
}
