import { atom, computed, action } from "nanostores";
import enOperatorsJson from "data/en_US/operators.json";
import branches from "data/en_US/branches.json";
import { classToProfession, professionLookup } from "../../../utils/classes.ts";

import type * as OutputTypes from "../../../types/output-types.ts";
import { localeStore } from "~/pages/[locale]/_store.ts";

export const operatorIdStore = atom<string>(
	typeof window !== "undefined" ? (window as any).operatorId : ""
);

export const operatorsJson = atom<OutputTypes.Operator[]>(typeof window !== "undefined" ? (window as any).operatorsJson : enOperatorsJson);

export const operatorStore = computed(
	[operatorIdStore, localeStore, operatorsJson],
	(operatorId, locale, operatorsJson) =>{
		return operatorsJson[operatorId as keyof typeof operatorsJson] as OutputTypes.Operator;
	}
);

// View Format
export type ViewConfigValue = "compact" | "large";
export const $viewConfig = atom<ViewConfigValue>("large");

// Sorting
export type SortDirectionValue = "ASC" | "DESC" | null;
export const $sortDirection = atom<SortDirectionValue>(
	typeof window !== "undefined"
		? ((window as any).queryParams?.sortDirection as SortDirectionValue ?? null)
		: null
);

export type SortCategoryValue =
	| "Alphabetical"
	| "Rarity"
	| "Release Date"
	| null;
export const $sortCategory = atom<SortCategoryValue>(
	typeof window !== "undefined"
		? ((window as any).queryParams?.sortCategory as SortCategoryValue ?? null)
		: null
);
export const $isSortEmpty = computed(
	[$sortCategory, $sortDirection],
	(category, direction) => category === null && direction === null
);

// Filtering
export const $filterProfession = atom<string[]>(
	typeof window !== "undefined"
		? ((window as any).queryParams?.professions?.split(",") ?? [])
		: []
);
export const $filterBranch = atom<Array<keyof typeof branches>>(
	typeof window !== "undefined"
		? ((window as any).queryParams?.branches?.split(",") ?? [])
		: []
);
export const $filterRarity = atom<Array<OutputTypes.Rarity>>(
	typeof window !== "undefined"
		? ((window as any).queryParams?.rarity?.split(",")?.map((rarity: string) => Number(rarity) as OutputTypes.Rarity)?? [])
		: []
);
export const $filterGuideAvailable = atom<boolean>(false);

export const $availableBranches = computed($filterProfession, (professions) => {
	return Object.entries(branches).filter(([key, branch]) => {
		return professions.some((item) => item === branch.class);
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
		localeStore,
		operatorsJson,
	],
	(
		professions,
		branches,
		rarity,
		guideAvailable,
		sortCategory,
		sortDirection,
		locale,
		operatorsJson,
	) => {
		if (!operatorsJson) {
			return [];
		}
		let baseOperators = Object.values(operatorsJson) as OutputTypes.Operator[];
		baseOperators.pop();

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
				baseOperators.sort((a, b) =>
					a.name.localeCompare(b.name, "en")
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
			serializeFiltersToUrl();
			return;
		}

		const professionBranches = $availableBranches
			.get()
			.filter(([key, branch]) => branch.class === profession);

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
		serializeFiltersToUrl();
	}
);

export const toggleBranch = action(
	$filterBranch,
	"toggleBranch",
	(filterBranchStore, branch: keyof typeof branches) => {
		if (filterBranchStore.get().indexOf(branch) === -1) {
			filterBranchStore.set([...filterBranchStore.get(), branch]);
			serializeFiltersToUrl();
			return;
		}

		filterBranchStore.set(
			filterBranchStore.get().filter((item) => item !== branch)
		);
		serializeFiltersToUrl();
	}
);

export const toggleRarity = action(
	$filterRarity,
	"toggleRarity",
	(filterRarityStore, rarity: OutputTypes.Rarity) => {
		if (filterRarityStore.get().indexOf(rarity) === -1) {
			filterRarityStore.set([...filterRarityStore.get(), rarity]);
			serializeFiltersToUrl();
			return;
		}

		filterRarityStore.set(
			filterRarityStore.get().filter((item) => item !== rarity)
		);
		serializeFiltersToUrl();
	}
);

export const serializeFiltersToUrl = () => {
	if (typeof window === "undefined"){
		return;
	}

	const params = new URLSearchParams();

	const professions = $filterProfession.get();
	if (professions.length > 0) params.set("professions", professions.join(","));

	const branches = $filterBranch.get();
	if (branches.length > 0) params.set("branches", branches.join(","));

	const rarity = $filterRarity.get();
	if (rarity.length > 0) params.set("rarity", rarity.join(","));

	if ($filterGuideAvailable.get()) params.set("guideAvailable", "true");

	const sortCategory = $sortCategory.get();
	if (sortCategory) params.set("sortCategory", sortCategory);

	const sortDirection = $sortDirection.get();
	if (sortDirection) params.set("sortDirection", sortDirection);

	// Update the URL without reloading the page
	const url = new URL(window.location.href);
	url.search = params.toString();
	history.replaceState(null, "", url.toString());
};

export const initializeFiltersFromUrl = (defaultSearchParams: URLSearchParams | null | undefined) => {
	if (typeof window === "undefined" && !defaultSearchParams) {
		return;
	}

	const params = defaultSearchParams ? defaultSearchParams : new URLSearchParams(window.location.search);

	const professions = params.get("professions");
	$filterProfession.set(professions ? professions.split(",") : []);

	const queryBranches = params.get("branches");
	$filterBranch.set(
		queryBranches
			? (queryBranches.split(",") as Array<keyof typeof branches>)
			: []
	);

	const rarity = params.get("rarity");
	$filterRarity.set(
		rarity
			? (rarity.split(",").map(Number) as Array<OutputTypes.Rarity>)
			: []
	);

	const guideAvailable = params.get("guideAvailable");
	$filterGuideAvailable.set(guideAvailable === "true");

	const sortCategory = params.get("sortCategory");
	$sortCategory.set(
		sortCategory ? (sortCategory as SortCategoryValue) : null
	);

	const sortDirection = params.get("sortDirection");
	$sortDirection.set(
		sortDirection ? (sortDirection as SortDirectionValue) : null
	);
};