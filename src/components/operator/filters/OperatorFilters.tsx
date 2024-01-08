import React, { useCallback, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useStore } from "@nanostores/react";
import {
	$availableBranches,
	$filterBranch,
	$filterGuideAvailable,
	$filterProfession,
	$filterRarity,
	type Rarity,
} from "../../../pages/operators/_store";
import { classToProfession, professionLookup } from "../../../utils/classes";
import branches from "../../../../data/branches.json";
import { operatorBranchIcon, operatorClassIcon } from "../../../utils/images";
import { clsx as cx } from "clsx";
import StarIcon from "../../icons/StarIcon";

const OperatorFilters = () => {
	const filterProfession = useStore($filterProfession);
	const filterBranch = useStore($filterBranch);
	const filterRarity = useStore($filterRarity);
	const filterGuideAvailable = useStore($filterGuideAvailable);
	const availableBranches = useStore($availableBranches);

	const professions = Object.keys(professionLookup);

	const toggleProfession = useCallback(
		(profession: string) => {
			if (filterProfession.indexOf(profession) === -1) {
				$filterProfession.set([...filterProfession, profession]);
				return;
			}

			const professionBranches = availableBranches.filter(
				([key, branch]) => branch.class.en_US === profession
			);
			$filterBranch.set(
				filterBranch.filter((item) =>
					professionBranches.some(
						([professionBranch]) => item === professionBranch
					)
				)
			);
			$filterProfession.set(
				filterProfession.filter((item) => item !== profession)
			);
		},
		[filterProfession]
	);
	const toggleBranch = useCallback(
		(branch: keyof typeof branches) => {
			if (filterBranch.indexOf(branch) === -1) {
				$filterBranch.set([...filterBranch, branch]);
				return;
			}

			$filterBranch.set(filterBranch.filter((item) => item !== branch));
		},
		[filterBranch]
	);
	const toggleRarity = useCallback(
		(rarity: Rarity) => {
			if (filterRarity.indexOf(rarity) === -1) {
				$filterRarity.set([...filterRarity, rarity]);
				return;
			}

			$filterRarity.set(filterRarity.filter((item) => item !== rarity));
		},
		[filterRarity]
	);

	const clearFilters = useCallback(() => {
		$filterProfession.set([]);
		$filterBranch.set([]);
	}, []);

	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<button
					className="group w-8 h-8 bg-neutral-800/[0.66] flex items-center justify-center rounded data-[state=open]:bg-gradient-to-b data-[state=open]:from-purple-light data-[state=open]:to-purple"
					aria-label="Open Filters"
				>
					<svg
						width="15"
						height="15"
						viewBox="0 0 15 15"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							className="group-data-[state=open]:fill-neutral-950 group-data-[state=closed]:fill-neutral-50"
							fillRule="evenodd"
							clipRule="evenodd"
							d="M6.98584 1.5H8.01416L8.30566 3L9.08789 3.2959C9.55939 3.4736 9.983 3.71757 10.3506 4.01953L10.998 4.5498L12.4395 4.05469L12.9536 4.94385L11.8022 5.9458L11.9341 6.77051V6.77197C11.9799 7.05318 12 7.28908 12 7.5C12 7.71092 11.9799 7.94679 11.9341 8.22803L11.8008 9.05273L12.9521 10.0547L12.438 10.9453L10.998 10.4487L10.3491 10.9805C9.98154 11.2824 9.55939 11.5264 9.08789 11.7041H9.08643L8.3042 12L8.0127 13.5H6.98584L6.69434 12L5.91211 11.7041C5.44061 11.5264 5.017 11.2824 4.64941 10.9805L4.00195 10.4502L2.56055 10.9453L2.04639 10.0562L3.19922 9.05273L3.06592 8.23096V8.22949C3.02071 7.94707 3 7.7105 3 7.5C3 7.28908 3.02006 7.05321 3.06592 6.77197L3.19922 5.94727L2.04639 4.94531L2.56055 4.05469L4.00195 4.55127L4.64941 4.01953C5.017 3.71757 5.44061 3.4736 5.91211 3.2959L6.69434 3L6.98584 1.5ZM4.5 7.5C4.5 5.85261 5.85261 4.5 7.5 4.5C9.14739 4.5 10.5 5.85261 10.5 7.5C10.5 9.14739 9.14739 10.5 7.5 10.5C5.85261 10.5 4.5 9.14739 4.5 7.5Z"
						/>
						<path
							className="group-data-[state=open]:fill-neutral-950 group-data-[state=closed]:fill-neutral-50"
							fillRule="evenodd"
							clipRule="evenodd"
							d="M5.38184 1.89258L5.74951 0H9.25049L9.61816 1.89258C10.2364 2.12582 10.8053 2.45076 11.3027 2.85938L13.1191 2.23389L14.8711 5.26465L13.415 6.53174V6.5332C13.4708 6.87628 13.5 7.19434 13.5 7.5C13.5 7.80612 13.471 8.12459 13.415 8.46826L14.8696 9.73535L13.1191 12.7661L11.3013 12.1392C10.8037 12.5479 10.2367 12.8742 9.61816 13.1074L9.25049 15H5.74951L5.38184 13.1074C4.76358 12.8742 4.19467 12.5492 3.69727 12.1406L1.88086 12.7661L0.128906 9.73535L1.58496 8.46973V8.46826C1.52986 8.12447 1.5 7.80658 1.5 7.5C1.5 7.19388 1.52899 6.87541 1.58496 6.53174L0.128906 5.26611L1.88086 2.23389L3.69873 2.86084C4.19609 2.45245 4.76371 2.12569 5.38184 1.89258ZM8.01416 1.5H6.98584L6.69434 3L5.91211 3.2959C5.44061 3.4736 5.017 3.71757 4.64941 4.01953L4.00195 4.55127L2.56055 4.05469L2.04639 4.94531L3.19922 5.94727L3.06592 6.77197C3.02006 7.05321 3 7.28908 3 7.5C3 7.7105 3.02071 7.94707 3.06592 8.22949V8.23096L3.19922 9.05273L2.04639 10.0562L2.56055 10.9453L4.00195 10.4502L4.64941 10.9805C5.017 11.2824 5.44061 11.5264 5.91211 11.7041L6.69434 12L6.98584 13.5H8.0127L8.3042 12L9.08643 11.7041H9.08789C9.55939 11.5264 9.98154 11.2824 10.3491 10.9805L10.998 10.4487L12.438 10.9453L12.9521 10.0547L11.8008 9.05273L11.9341 8.22803C11.9799 7.94679 12 7.71092 12 7.5C12 7.28908 11.9799 7.05318 11.9341 6.77197V6.77051L11.8022 5.9458L12.9536 4.94385L12.4395 4.05469L10.998 4.5498L10.3506 4.01953C9.983 3.71757 9.55939 3.4736 9.08789 3.2959L8.30566 3L8.01416 1.5Z"
						/>
					</svg>
				</button>
			</Popover.Trigger>
			<Popover.Anchor className="mt-2" />
			<Popover.Portal>
				<Popover.Content>
					<div className="max-w-[420px] bg-neutral-950 rounded-lg p-4 text-neutral-200 flex flex-col gap-4">
						<div>
							<p>Class</p>
							<div className="flex gap-2 bg-neutral-700 p-1 rounded mt-2">
								{professions.map((profession) => {
									const selected = filterProfession.some(
										(item) => item === profession
									);
									return (
										<button
											key={profession}
											className={cx(
												"hover:bg-neutral-800 p-1 rounded",
												{
													"bg-gradient-to-b from-purple-light to-purple":
														selected,
												}
											)}
										>
											<img
												className={cx("size-8", {
													"invert mix-blend-multiply ":
														selected,
													"mix-blend-lighten":
														!selected,
												})}
												alt=""
												src={operatorClassIcon(
													classToProfession(
														profession
													)
												)}
												onClick={() =>
													toggleProfession(profession)
												}
											/>
										</button>
									);
								})}
							</div>
						</div>
						<div>
							<p>Branch</p>
							{availableBranches.length == 0 ? (
								<div className="p-2 rounded bg-neutral-900 flex items-center justify-center mt-2">
									<p className="leading-5 text-neutral-300">
										Select a Class
									</p>
								</div>
							) : (
								<div className="flex flex-wrap gap-2 mt-2">
									{availableBranches.map(([key, branch]) => {
										const selected = filterBranch.some(
											(item) => item === key
										);
										return (
											<button
												key={key}
												className={cx(
													"rounded bg-neutral-700 py-1 px-2 flex items-center gap-1",
													{
														"bg-gradient-to-b from-purple-light to-purple text-neutral-800":
															selected,
														"text-neutral-50":
															!selected,
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
													src={operatorBranchIcon(
														key
													)}
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
								<div className="p-2 rounded bg-neutral-700 flex items-center justify-center mt-2">
									{new Array<Rarity>(1, 2, 3, 4, 5, 6).map(
										(rarity) => {
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
													onClick={() =>
														toggleRarity(
															rarity
														)
													}
													className={cx(
														"w-full font-semibold rounded flex items-center justify-center gap-0.5",
														rarityStyleVariants[
															rarity
														]
													)}
												>
													{rarity}
													<StarIcon rarity={rarity} selected={selected}/>
												</button>
											);
										}
									)}
								</div>
							</div>
						</div>
						<div className="mt-2">
							<hr className="text-neutral-600" />
							<button
								className="mt-2 hover:bg-neutral-800 px-1 py-2 w-full rounded-sm"
								type="button"
								onClick={() => clearFilters()}
							>
								Clear Filters
							</button>
						</div>
					</div>
					{/* <Popover.Close /> */}
					<Popover.Arrow className="fill-neutral-950" />
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
};

export default OperatorFilters;
