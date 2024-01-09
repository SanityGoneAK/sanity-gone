import React, { useCallback, useMemo } from "react";

import { useStore } from "@nanostores/react";

import branches from "../../../../data/branches.json";
import {
	$availableBranches,
	$filterBranch,
	$filterGuideAvailable,
	$filterProfession,
	$filterRarity,
	toggleProfession,
	type Rarity,
	toggleBranch,
	toggleRarity,
} from "../../../pages/operators/_store";
import { classToProfession, professionLookup } from "../../../utils/classes";
import { operatorBranchIcon, operatorClassIcon } from "../../../utils/images";
import { cx } from "../../../utils/styles";
import StarIcon from "../../icons/StarIcon";
import { Checkbox } from "../../ui/Checkbox";

const OperatorFilters = () => {
	const filterProfession = useStore($filterProfession);
	const filterBranch = useStore($filterBranch);
	const filterRarity = useStore($filterRarity);
	const filterGuideAvailable = useStore($filterGuideAvailable);
	const availableBranches = useStore($availableBranches);

	const professions = Object.keys(professionLookup);

	const clearFilters = useCallback(() => {
		$filterProfession.set([]);
		$filterBranch.set([]);
		$filterRarity.set([]);
		$filterGuideAvailable.set(false);
	}, []);

	return (
		<div className="flex max-w-[420px] flex-col gap-4 rounded-lg bg-neutral-950 p-4 text-neutral-200">
			<div>
				<p>Class</p>
				<div className="mt-2 flex gap-2 rounded bg-neutral-700 p-1">
					{professions.map((profession) => {
						const selected = filterProfession.some(
							(item) => item === profession
						);
						return (
							<button
								key={profession}
								className={cx(
									"rounded p-1 hover:bg-neutral-800",
									{
										"bg-gradient-to-b from-purple-light to-purple":
											selected,
									}
								)}
							>
								<img
									className={cx("size-8", {
										"mix-blend-multiply invert ": selected,
										"mix-blend-lighten": !selected,
									})}
									alt=""
									src={operatorClassIcon(
										classToProfession(profession)
									)}
									onClick={() => toggleProfession(profession)}
								/>
							</button>
						);
					})}
				</div>
			</div>
			<div>
				<p>Branch</p>
				{availableBranches.length == 0 ? (
					<div className="mt-2 flex items-center justify-center rounded bg-neutral-900 p-2">
						<p className="leading-5 text-neutral-300">
							Select a Class
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
										"flex items-center gap-1 rounded bg-neutral-700 px-2 py-1",
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
									<p>{branch.branchName.en_US}</p>
								</button>
							);
						})}
					</div>
				)}
			</div>
			<div>
				<p>Rarity</p>
				<div className="mt-2">
					<div className="mt-2 flex items-center justify-center rounded bg-neutral-700 p-2">
						{new Array<Rarity>(1, 2, 3, 4, 5, 6).map((rarity) => {
							const selected = filterRarity.some(
								(item) => item === rarity
							);
							const rarityStyleVariants = {
								1: selected
									? `bg-gradient-to-b from-rarity-1 to-rarity-1-dark text-neutral-800`
									: `text-rarity-1 hover:bg-neutral-500`,
								2: selected
									? `bg-gradient-to-b from-rarity-2 to-rarity-2-dark text-neutral-800`
									: `text-rarity-2 hover:bg-neutral-500`,
								3: selected
									? `bg-gradient-to-b from-rarity-3 to-rarity-3-dark text-neutral-800`
									: `text-rarity-3 hover:bg-neutral-500`,
								4: selected
									? `bg-gradient-to-b from-rarity-4 to-rarity-4-dark text-neutral-800`
									: `text-rarity-4 hover:bg-neutral-500`,
								5: selected
									? `bg-gradient-to-b from-rarity-5 to-rarity-5-dark text-neutral-800`
									: `text-rarity-5 hover:bg-neutral-500`,
								6: selected
									? `bg-gradient-to-b from-rarity-6-dark to-rarity-6 text-neutral-800`
									: `text-rarity-6 hover:bg-neutral-500`,
							};

							return (
								<button
									key={rarity}
									onClick={() => toggleRarity(rarity)}
									className={cx(
										"flex w-full items-center justify-center gap-0.5 rounded font-semibold",
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
			<div className="flex items-center">
				<Checkbox
					id="guides-available"
					onCheckedChange={(value) =>
						$filterGuideAvailable.set(!!value)
					}
				/>
				<label className="ml-2" htmlFor="guides-available">
					Guides Available
				</label>
			</div>
			<div className="mt-2">
				<hr className="text-neutral-600" />
				<button
					className="mt-2 w-full rounded-sm px-1 py-2 hover:bg-neutral-800"
					type="button"
					onClick={() => clearFilters()}
				>
					Clear Filters
				</button>
			</div>
		</div>
	);
};

export default OperatorFilters;
