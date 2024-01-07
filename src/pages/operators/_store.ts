import { atom, computed } from "nanostores";

import operatorsJson from "../../../data/operators.json";

import type * as OutputTypes from "../../types/output-types.ts";
import branches from "../../../data/branches.json";
import { classToProfession } from "../../utils/classes.ts";

export const operatorIdStore = atom<string>(
	typeof window !== "undefined" ? (window as any).operatorId : ""
);

export const operatorStore = computed(
	operatorIdStore,
	(operatorId) =>
		operatorsJson[
			operatorId as keyof typeof operatorsJson
		] as OutputTypes.Operator
);

// View Format
export type ViewConfigValue = "compact" | "large";
export const viewConfig = atom<ViewConfigValue>("compact");

// Sorting
export type SortDirectionValue = "ASC" | "DESC" | null;
export const sortDirection = atom<SortDirectionValue>(null);

export type SortCategoryValue =
	| "Alphabetical"
	| "Rarity"
	| "Release Date"
	| null;
export const SortCategory = atom<SortDirectionValue>(null);

// Filtering
export const filterProfession = atom<keyof (typeof professionLookup)[] | null>(
	null
);
export const filterBranch = atom<keyof (typeof branches)[] | null>(null);
export const filterRarity = atom<1 | 2 | 3 | 4 | 5 | 6 | null>(null);
export const filterGuideAvailable = atom<boolean | null>(null);

// Filtering
export const $filterProfession = atom<string[]>([]);
export const $filterBranch = atom<Array<keyof typeof branches>>([]);
export type Rarity = 1 | 2 | 3 | 4 | 5 | 6;
export const $filterRarity = atom<Array<Rarity>>([]);
export const $filterGuideAvailable = atom<boolean | null>(null);

export const $availableBranches = computed($filterProfession, (professions) => {
	return Object.entries(branches).filter(([key, branch]) => {
		return professions.some((item) => item === branch.class.en_US);
	});
});

export const $operators = computed([$filterProfession, $filterBranch, $filterRarity], (professions, branches, rarity)=>{
	let baseOperators = Object.values(operatorsJson) as OutputTypes.Operator[];

	if(professions.length > 0){
		baseOperators = baseOperators.filter(
			operator => professions.map(profession => classToProfession(profession)).some( profession => profession === operator.profession))
	}

	if(branches.length > 0){
		baseOperators = baseOperators.filter(
			operator => branches.some(branch => branch === operator.subProfessionId)
		)
	}

	if(rarity.length > 0){
		baseOperators = baseOperators.filter(
			operator => rarity.some(rarityIndex => operator.rarity === rarityIndex)
		)
	}

	return baseOperators
})