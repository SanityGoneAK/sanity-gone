import React, { useCallback, useEffect, useMemo } from "react";

import { useStore } from "@nanostores/react";

import branches from "../../../../data/branches.json";
import {
	$availableBranches,
	$filterBranch,
	$filterGuideAvailable,
	$filterProfession,
	$filterRarity,
	$filterGender,
	toggleProfession,
	toggleBranch,
	toggleRarity,
	toggleGender,
	initializeFiltersFromUrl,
	serializeFiltersToUrl,
} from "../../../pages/[locale]/operators/_store";
import { classToProfession, professionLookup } from "../../../utils/classes";
import { operatorBranchIcon, operatorClassIcon } from "../../../utils/images";
import { cx } from "../../../utils/styles";
import StarIcon from "../../icons/StarIcon";
import Checkbox from "../../ui/Checkbox";
import type { Gender, Rarity } from "~/types/output-types";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { useTranslations } from "~/i18n/utils.ts";
import type { ui } from "~/i18n/ui.ts";
import { subProfessionIdToBranch } from "~/utils/branches.ts";
import { localeToTag } from "~/i18n/languages.ts";

const OperatorFilters = () => {
	const locale = useStore(localeStore);
	const t = useTranslations(locale);

	const filterProfession = useStore($filterProfession);
	const filterBranch = useStore($filterBranch);
	const filterRarity = useStore($filterRarity);
	const filterGender = useStore($filterGender);
	const filterGuideAvailable = useStore($filterGuideAvailable);
	const availableBranches = useStore($availableBranches);

	const professions = Object.keys(professionLookup);

	const clearFilters = useCallback(() => {
		$filterProfession.set([]);
		$filterBranch.set([]);
		$filterRarity.set([]);
		$filterGender.set([]);
		$filterGuideAvailable.set(false);
		serializeFiltersToUrl();
	}, []);

	const genderTranslations = useMemo(() => {
		return {
			Male: t("operators.index.filters.gender.male"),
			Female: t("operators.index.filters.gender.female"),
			Other: t("operators.index.filters.gender.other"),
		};
	}, [locale]);

	return (
		<div className="flex w-full flex-col gap-4 rounded-lg text-neutral-200 md:w-[420px] md:bg-neutral-950 md:p-4">
			<div>
				<p>{t("operators.index.filters.class")}</p>
				<div className="mt-2 flex justify-center rounded border border-neutral-600">
					{professions.map((profession) => {
						const selected = filterProfession.some(
							(item) => item === profession
						);
						return (
							<button
								key={profession}
								onClick={() => toggleProfession(profession)}
								className={cx(
									"flex aspect-square w-full max-w-12 items-center justify-center rounded p-3 hover:bg-neutral-400",
									{
										"bg-neutral-50 hover:bg-neutral-100":
											selected,
									}
								)}
							>
								<img
									className={cx("w-full", {
										"mix-blend-multiply invert": selected,
										"mix-blend-lighten": !selected,
									})}
									alt=""
									src={operatorClassIcon(
										classToProfession(profession)
									)}
								/>
							</button>
						);
					})}
				</div>
			</div>
			<div>
				<p>{t("operators.index.filters.branch")}</p>
				{availableBranches.length == 0 ? (
					<div className="mt-2 flex items-center justify-center rounded bg-neutral-600 p-2 md:bg-neutral-900">
						<p className="leading-5 text-neutral-100">
							{t("operators.index.filters.select_class")}
						</p>
					</div>
				) : (
					<div className="mt-2 flex flex-wrap gap-2">
						{availableBranches.map(([key, branch]) => {
							const selected = filterBranch.some(
								(item) => item === key
							);
							return (
								<button
									key={key}
									className={cx(
										"flex items-center gap-1 rounded bg-neutral-900 px-2 py-1 md:bg-neutral-700",
										{
											"bg-gradient-to-b from-purple-light to-purple text-neutral-800":
												selected,
											"text-neutral-50": !selected,
										}
									)}
									onClick={() =>
										toggleBranch(
											key as keyof typeof branches
										)
									}
								>
									<img
										className={cx(
											"size-6 object-contain object-center",
											{
												invert: selected,
											}
										)}
										src={operatorBranchIcon(key)}
										alt=""
									/>
									<p>
										{subProfessionIdToBranch(
											key,
											localeToTag[
												locale as keyof typeof localeToTag
											]
										)}
									</p>
								</button>
							);
						})}
					</div>
				)}
			</div>
			<div>
				<p>{t("operators.index.filters.rarity")}</p>
				<div className="mt-2">
					<div className="mt-2 flex items-center justify-center rounded border border-neutral-600">
						{new Array<Rarity>(1, 2, 3, 4, 5, 6).map((rarity) => {
							const selected = filterRarity.some(
								(item) => item === rarity
							);
							const rarityStyleVariants = {
								1: selected
									? `bg-gradient-to-b from-neutral-50 to-neutral-100 text-neutral-800`
									: `text-neutral-50 hover:bg-neutral-500`,
								2: selected
									? `bg-gradient-to-b from-green-light to-green text-neutral-800`
									: `text-green-light hover:bg-neutral-500`,
								3: selected
									? `bg-gradient-to-b from-blue-light to-blue text-neutral-800`
									: `text-blue-light hover:bg-neutral-500`,
								4: selected
									? `bg-gradient-to-b from-purple-light to-purple text-neutral-800`
									: `text-purple-light hover:bg-neutral-500`,
								5: selected
									? `bg-gradient-to-b from-yellow-light to-yellow text-neutral-800`
									: `text-yellow-light hover:bg-neutral-500`,
								6: selected
									? `bg-gradient-to-b from-orange-light to-orange text-neutral-800`
									: `text-orange-light hover:bg-neutral-500`,
							};

							return (
								<button
									key={rarity}
									onClick={() => toggleRarity(rarity)}
									className={cx(
										"flex aspect-square w-full max-w-12 items-center justify-center gap-0.5 rounded font-semibold",
										rarityStyleVariants[rarity]
									)}
								>
									{rarity}
									<StarIcon
										rarity={rarity}
										selected={selected}
									/>
								</button>
							);
						})}
					</div>
				</div>
			</div>
			<div>
				<p>{t("operators.index.filters.gender")}</p>
				<div className="mt-2">
					<div className="text-red-500 mt-2 flex items-center justify-center gap-2 rounded border border-neutral-600 text-neutral-50">
						{new Array<Gender>("Male", "Female", "Other").map(
							(gender: Gender) => {
								const selected = filterGender.some(
									(item) => item === gender
								);
								return (
									<button
										key={gender}
										onClick={() => toggleGender(gender)}
										className={cx(
											"flex w-full py-2 items-center justify-center rounded hover:bg-neutral-400",
											{
												"bg-neutral-50 text-neutral-800 hover:bg-neutral-100":
													selected,
											}
										)}
									>
										{genderTranslations[gender]}
									</button>
								);
							}
						)}
					</div>
				</div>
			</div>
			<div className="flex items-center">
				<label
					className="flex cursor-pointer items-center gap-2"
					htmlFor="guides-available"
				>
					<Checkbox
						id="guides-available"
						checked={$filterGuideAvailable.get()}
						onCheckedChange={(value) =>
							$filterGuideAvailable.set(!!value)
						}
					/>
					{t("operators.index.filters.guides_available")}
				</label>
			</div>
			<div className="mt-2">
				<hr className="text-neutral-600" />
				<button
					className="mt-2 w-full rounded-sm px-1 py-2 hover:bg-neutral-800"
					type="button"
					onClick={() => clearFilters()}
				>
					{t("operators.index.filters.clear_filters")}
				</button>
			</div>
		</div>
	);
};

export default OperatorFilters;
