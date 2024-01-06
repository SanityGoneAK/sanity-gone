import { atom, computed } from "nanostores";

import operatorsJson from "../../../data/operators.json";

import type * as OutputTypes from "../../types/output-types.ts";
import { professionLookup } from "../../utils/classes.ts";
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
export const filterProfession = atom<keyof typeof professionLookup[] | null>(null);
export const filterBranch = atom<keyof typeof branches[] | null>(null);
export const filterRarity = atom<1 | 2 |3 | 4 | 5 | 6 | null>(null);
export const filterGuideAvailable = atom<boolean | null>(null)