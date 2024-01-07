import { atom, computed } from "nanostores";

import operatorsJson from "../../../data/operators.json";

import type * as OutputTypes from "../../types/output-types.ts";
import branches from "../../../data/branches.json";


export const operatorIdStore = atom<string>(
	typeof window !== "undefined" ? (window as any).operatorId : "",
);

export const operatorStore = computed(
	operatorIdStore,
	(operatorId) =>
		operatorsJson[
			operatorId as keyof typeof operatorsJson
			] as OutputTypes.Operator,
);

// View Format
export type ViewConfigValue = "compact" | "large";
export const viewConfig = atom<ViewConfigValue>("compact");

// Sorting
export type SortDirectionValue = "ASC" | "DESC" | null;
export const sortDirection = atom<SortDirectionValue>(null);

export type SortCategoryValue = "Alphabetical" | "Rarity" | "Release Date" | null;
export const SortCategory = atom<SortDirectionValue>(null);


// Filtering
export const $filterProfession = atom<string[]>([]);
export const $filterBranch = atom<Array<keyof typeof branches>>([]);
export const $filterRarity = atom<1 | 2 |3 | 4 | 5 | 6 | null>(null);
export const $filterGuideAvailable = atom<boolean | null>(null)


export const $availableBranches = computed($filterProfession, (professions) => {
	return Object.entries(branches).filter(([key, branch]) => {
		return professions.some((item) => item === branch.class.en_US)
	});
})