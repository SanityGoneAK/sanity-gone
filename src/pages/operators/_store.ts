import { atom, computed, action } from "nanostores";

import branches from "../../../data/branches.json";
import operatorsJson from "../../../data/operators.json";
import { classToProfession, professionLookup } from "../../utils/classes.ts";

import type * as OutputTypes from "../../types/output-types.ts";

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
export const $viewConfig = atom<ViewConfigValue>("compact");

// Sorting
export type SortDirectionValue = "ASC" | "DESC" | null;
export const $sortDirection = atom<SortDirectionValue>(null);

export type SortCategoryValue =
	| "Alphabetical"
	| "Rarity"
	| "Release Date"
	| null;
export const $sortCategory = atom<SortCategoryValue>(null);
export const $isSortEmpty = computed(
	[$sortCategory, $sortDirection],
	(category, direction) => category === null && direction === null
);

// Filtering
export const $filterProfession = atom<string[]>([]);
export const $filterBranch = atom<Array<keyof typeof branches>>([]);
export type Rarity = 1 | 2 | 3 | 4 | 5 | 6;
export const $filterRarity = atom<Array<Rarity>>([]);
export const $filterGuideAvailable = atom<boolean>(false);

export const $availableBranches = computed($filterProfession, (professions) => {
	return Object.entries(branches).filter(([key, branch]) => {
		return professions.some((item) => item === branch.class.en_US);
	});
});

export const $operators = computed(
	[
		$filterProfession,
		$filterBranch,
		$filterRarity,
		$filterGuideAvailable,
		$sortCategory,
		$sortDirection,
	],
	(
		professions,
		branches,
		rarity,
		guideAvailable,
		sortCategory,
		sortDirection
	) => {
		let baseOperators = Object.values(
			operatorsJson
		) as OutputTypes.Operator[];

		if (professions.length > 0) {
			baseOperators = baseOperators.filter((operator) =>
				professions
					.map((profession) => classToProfession(profession))
					.some((profession) => profession === operator.profession)
			);
		}

		if (branches.length > 0) {
			baseOperators = baseOperators.filter((operator) =>
				branches.some((branch) => branch === operator.subProfessionId)
			);
		}

		if (rarity.length > 0) {
			baseOperators = baseOperators.filter((operator) =>
				rarity.some((rarityIndex) => operator.rarity === rarityIndex)
			);
		}

		if (guideAvailable) {
			baseOperators = baseOperators.filter(
				(operator) => operator.hasGuide === true
			);
		}

		if (sortCategory && sortDirection) {
			if (sortCategory === "Alphabetical") {
				baseOperators.sort(
					(a, b) => a.name?.en_US.localeCompare(b.name?.en_US, "en")
				);
			}

			if (sortCategory === "Rarity") {
				baseOperators.sort((a, b) => a.rarity - b.rarity);
			}

			if (sortCategory === "Release Date") {
				baseOperators.sort((a, b) => a.releaseOrder - b.releaseOrder);
			}

			if (sortDirection == "DESC") {
				baseOperators.reverse();
			}
		}

		return baseOperators;
	}
);

export const toggleProfession = action(
	$filterProfession,
	"toggleProfession",
	(filterProfessionStore, profession: string) => {
		const filterProfession = filterProfessionStore.get();
		if (filterProfession.indexOf(profession) === -1) {
			filterProfessionStore.set([...filterProfession, profession]);
			return;
		}

		const professionBranches = $availableBranches
			.get()
			.filter(([key, branch]) => branch.class.en_US === profession);

		$filterBranch.set(
			$filterBranch
				.get()
				.filter((item) =>
					professionBranches.some(
						([professionBranch]) => item === professionBranch
					)
				)
		);

		filterProfessionStore.set(
			filterProfession.filter((item) => item !== profession)
		);
	}
);

export const toggleBranch = action(
	$filterBranch,
	"toggleBranch",
	(filterBranchStore, branch: keyof typeof branches) => {
		if (filterBranchStore.get().indexOf(branch) === -1) {
			filterBranchStore.set([...filterBranchStore.get(), branch]);
			return;
		}

		filterBranchStore.set(
			filterBranchStore.get().filter((item) => item !== branch)
		);
	}
);

export const toggleRarity = action(
	$filterRarity,
	"toggleRarity",
	(filterRarityStore, rarity: Rarity) => {
		if (filterRarityStore.get().indexOf(rarity) === -1) {
			filterRarityStore.set([...filterRarityStore.get(), rarity]);
			return;
		}

		filterRarityStore.set(
			filterRarityStore.get().filter((item) => item !== rarity)
		);
	}
);
