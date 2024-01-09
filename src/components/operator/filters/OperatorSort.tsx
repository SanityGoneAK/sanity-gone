import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../../ui/Dropdown";
import {
	$isSortEmpty,
	$sortCategory,
	$sortDirection,
	type SortCategoryValue,
	type SortDirectionValue,
} from "../../../pages/operators/_store";
import { useStore } from "@nanostores/react";

const OperatorSort = () => {
	const sortDirection = useStore($sortDirection);
	const sortCategory = useStore($sortCategory);
	const isSortEmpty = useStore($isSortEmpty);

	const setSorting = (value: string) => {
		const [category, direction] = value.split("_");

		$sortDirection.set(direction as SortDirectionValue);
		$sortCategory.set(category as SortDirectionValue);
	};

	const clearSorting = () => {
		$sortDirection.set(null);
		$sortCategory.set(null);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="flex justify-between w-36 text-left bg-neutral-800/[0.66] py-2 px-3 text-neutral-200 leading-4 rounded-lg">
					{isSortEmpty ? (
						<>
							<span>Sort By</span>
							<svg
								width="16"
								height="14"
								viewBox="0 0 16 14"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M7.50001 2H9.50001C9.63262 2 9.75979 1.94732 9.85356 1.85355C9.94733 1.75978 10 1.63261 10 1.5V0.499999C10 0.367391 9.94733 0.240214 9.85356 0.146446C9.75979 0.0526783 9.63262 0 9.50001 0H7.50001C7.3674 0 7.24023 0.0526783 7.14646 0.146446C7.05269 0.240214 7.00001 0.367391 7.00001 0.499999V1.5C7.00001 1.63261 7.05269 1.75978 7.14646 1.85355C7.24023 1.94732 7.3674 2 7.50001 2ZM7.50001 5.99999H11.5C11.6326 5.99999 11.7598 5.94731 11.8536 5.85354C11.9473 5.75978 12 5.6326 12 5.49999V4.49999C12 4.36739 11.9473 4.24021 11.8536 4.14644C11.7598 4.05267 11.6326 3.99999 11.5 3.99999H7.50001C7.3674 3.99999 7.24023 4.05267 7.14646 4.14644C7.05269 4.24021 7.00001 4.36739 7.00001 4.49999V5.49999C7.00001 5.6326 7.05269 5.75978 7.14646 5.85354C7.24023 5.94731 7.3674 5.99999 7.50001 5.99999ZM15.5 12H7.50001C7.3674 12 7.24023 12.0527 7.14646 12.1464C7.05269 12.2402 7.00001 12.3674 7.00001 12.5V13.5C7.00001 13.6326 7.05269 13.7598 7.14646 13.8535C7.24023 13.9473 7.3674 14 7.50001 14H15.5C15.6326 14 15.7598 13.9473 15.8536 13.8535C15.9473 13.7598 16 13.6326 16 13.5V12.5C16 12.3674 15.9473 12.2402 15.8536 12.1464C15.7598 12.0527 15.6326 12 15.5 12ZM7.50001 9.99998H13.5C13.6326 9.99998 13.7598 9.94731 13.8536 9.85354C13.9473 9.75977 14 9.63259 14 9.49999V8.49999C14 8.36738 13.9473 8.2402 13.8536 8.14643C13.7598 8.05267 13.6326 7.99999 13.5 7.99999H7.50001C7.3674 7.99999 7.24023 8.05267 7.14646 8.14643C7.05269 8.2402 7.00001 8.36738 7.00001 8.49999V9.49999C7.00001 9.63259 7.05269 9.75977 7.14646 9.85354C7.24023 9.94731 7.3674 9.99998 7.50001 9.99998ZM5.50002 9.99998H4.00002V0.499999C4.00002 0.367391 3.94734 0.240214 3.85357 0.146446C3.7598 0.0526783 3.63263 0 3.50002 0H2.50002C2.36741 0 2.24024 0.0526783 2.14647 0.146446C2.0527 0.240214 2.00002 0.367391 2.00002 0.499999V9.99998H0.500023C0.0565865 9.99998 -0.167788 10.5387 0.147211 10.8534L2.64721 13.8534C2.74097 13.9471 2.86809 13.9997 3.00064 13.9997C3.1332 13.9997 3.26032 13.9471 3.35408 13.8534L5.85408 10.8534C6.1672 10.5394 5.94439 9.99998 5.50002 9.99998Z"
									fill="#87879B"
								/>
							</svg>
						</>
					) : (
						<div className="flex gap-2 text-neutral-50">
							{sortCategory}
							{sortDirection == "ASC" ? (
								<svg
									width="8"
									height="18"
									viewBox="0 0 8 18"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M3.5 17C3.5 17.2761 3.72386 17.5 4 17.5C4.27614 17.5 4.5 17.2761 4.5 17L3.5 17ZM4.35355 0.646446C4.15829 0.451185 3.84171 0.451185 3.64645 0.646446L0.464466 3.82843C0.269203 4.02369 0.269203 4.34027 0.464466 4.53553C0.659728 4.7308 0.97631 4.7308 1.17157 4.53553L4 1.70711L6.82843 4.53553C7.02369 4.7308 7.34027 4.7308 7.53553 4.53553C7.7308 4.34027 7.7308 4.02369 7.53553 3.82843L4.35355 0.646446ZM4.5 17L4.5 1L3.5 1L3.5 17L4.5 17Z"
										fill="#E8E8F2"
									/>
								</svg>
							) : (
								<svg
									width="8"
									height="18"
									viewBox="0 0 8 18"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M4.5 1C4.5 0.723858 4.27614 0.5 4 0.5C3.72386 0.5 3.5 0.723858 3.5 1L4.5 1ZM3.64645 17.3536C3.84171 17.5488 4.15829 17.5488 4.35355 17.3536L7.53553 14.1716C7.7308 13.9763 7.7308 13.6597 7.53553 13.4645C7.34027 13.2692 7.02369 13.2692 6.82843 13.4645L4 16.2929L1.17157 13.4645C0.97631 13.2692 0.659728 13.2692 0.464466 13.4645C0.269203 13.6597 0.269203 13.9763 0.464466 14.1716L3.64645 17.3536ZM3.5 1L3.5 17L4.5 17L4.5 1L3.5 1Z"
										fill="#E8E8F2"
									/>
								</svg>
							)}
						</div>
					)}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-36">
				<DropdownMenuRadioGroup
					value={
						isSortEmpty ? `${sortCategory}_${sortDirection}` : ""
					}
					onValueChange={setSorting}
				>
					{new Array<SortCategoryValue>(
						"Alphabetical",
						"Rarity",
						"Release Date"
					).map((sortCategory) => {
						return new Array<SortDirectionValue>("ASC", "DESC").map(
							(sortDirection) => {
								const key = `${sortCategory}_${sortDirection}`;
								return (
									<DropdownMenuRadioItem
										key={key}
										value={key}
										className="flex gap-2"
									>
										{sortCategory}
										{sortDirection == "ASC" ? (
											<svg
												width="8"
												height="18"
												viewBox="0 0 8 18"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M3.5 17C3.5 17.2761 3.72386 17.5 4 17.5C4.27614 17.5 4.5 17.2761 4.5 17L3.5 17ZM4.35355 0.646446C4.15829 0.451185 3.84171 0.451185 3.64645 0.646446L0.464466 3.82843C0.269203 4.02369 0.269203 4.34027 0.464466 4.53553C0.659728 4.7308 0.97631 4.7308 1.17157 4.53553L4 1.70711L6.82843 4.53553C7.02369 4.7308 7.34027 4.7308 7.53553 4.53553C7.7308 4.34027 7.7308 4.02369 7.53553 3.82843L4.35355 0.646446ZM4.5 17L4.5 1L3.5 1L3.5 17L4.5 17Z"
													fill="#E8E8F2"
												/>
											</svg>
										) : (
											<svg
												width="8"
												height="18"
												viewBox="0 0 8 18"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M4.5 1C4.5 0.723858 4.27614 0.5 4 0.5C3.72386 0.5 3.5 0.723858 3.5 1L4.5 1ZM3.64645 17.3536C3.84171 17.5488 4.15829 17.5488 4.35355 17.3536L7.53553 14.1716C7.7308 13.9763 7.7308 13.6597 7.53553 13.4645C7.34027 13.2692 7.02369 13.2692 6.82843 13.4645L4 16.2929L1.17157 13.4645C0.97631 13.2692 0.659728 13.2692 0.464466 13.4645C0.269203 13.6597 0.269203 13.9763 0.464466 14.1716L3.64645 17.3536ZM3.5 1L3.5 17L4.5 17L4.5 1L3.5 1Z"
													fill="#E8E8F2"
												/>
											</svg>
										)}
									</DropdownMenuRadioItem>
								);
							}
						);
					})}
				</DropdownMenuRadioGroup>
				<DropdownMenuSeparator />
				<DropdownMenuLabel className="-mt-1">
					<button
						onClick={clearSorting}
						className="w-full text-neutral-200 font-normal hover:bg-neutral-600 rounded-md"
					>
						Clear Sort
					</button>
				</DropdownMenuLabel>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default OperatorSort;
