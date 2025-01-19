import { useStore } from "@nanostores/react";

import SvgRarityGradientDefs from "./SvgRarityGradientDefs";
import { $operators, $viewConfig } from "../../pages/[locale]/operators/_store";
import enOperatorsJson from "data/en_US/operators.json";
import {
	operatorAvatar,
	operatorBranchIcon,
	operatorPortrait,
} from "../../utils/images";
import { slugify } from "../../utils/strings";

import type * as OutputTypes from "../../types/output-types";
import useMediaQuery from "~/utils/media-query";
import { cx } from "~/utils/styles";
import StarIcon from "../icons/StarIcon";
import { professionToClass } from "~/utils/classes";
import { subProfessionIdToBranch } from "~/utils/branches";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { useTranslations } from "~/i18n/utils.ts";
import type { ui } from "~/i18n/ui.ts";

const OperatorLargeItem: React.FC<{
	operator: OutputTypes.Operator;
	locale: string;
}> = ({ operator, locale }) => {
	const [charName, alterName] = operator.name.split(/\sthe\s/i);
	const rarityText = {
		1: "text-neutral-50",
		2: "text-green-light",
		3: "text-blue-light",
		4: "text-purple-light",
		5: "text-yellow-light",
		6: "text-orange-light",
	};

	const enOperator = enOperatorsJson[operator.charId as keyof typeof enOperatorsJson] as OutputTypes.Operator;
	const slug = slugify(enOperator.name);

	return (
		<li className="relative h-[280px] w-full overflow-hidden rounded">
			<div className="h-full overflow-hidden bg-neutral-600">
				<div className="relative w-full">
					<img
						loading="lazy"
						className="h-full w-full object-fill object-right-bottom"
						alt=""
						src={operatorPortrait(operator.charId)}
					/>
				</div>
			</div>
			<div className="group absolute top-0 flex h-full w-full flex-col">
				<div className="flex">
					<div className="flex h-11 w-11 items-center justify-center rounded-br bg-neutral-800/[.66] p-1.5 transition-colors duration-150 ease-in-out will-change-['background-color'] hover:bg-neutral-700">
						<img
							className="h-full w-full"
							src={operatorBranchIcon(operator.subProfessionId)}
							alt=""
						/>
					</div>
					<a
						className="block h-11 flex-grow"
						tabIndex={-1}
						href={`/${locale}/operators/${slug}`}
					></a>
				</div>

				<div className="flex h-full flex-col justify-end bg-gradient-to-b from-[transparent] from-40% via-neutral-950/[0.67] via-[67%] to-[#1c1c1c] to-100%">
					<a
						href={`/${locale}/operators/${slug}`}
						tabIndex={-1}
						className="flex flex-grow flex-col justify-end p-3"
					>
						<h3 className="flex flex-col text-lg font-semibold leading-6 text-neutral-50">
							{alterName ? (
								<>
									{charName}
									<span className="visually-hidden">
										&nbsp;the&nbsp;
									</span>
									<span className="text-base font-normal">
										{alterName}
									</span>
								</>
							) : (
								charName
							)}
						</h3>
						<div className="flex items-center">
							<div
								className={cx(
									rarityText[
										operator.rarity as keyof typeof rarityText
									]
								)}
							>
								<span className="visually-hidden">
									Class:&nbsp;
								</span>
								{professionToClass(operator.profession)}
							</div>
							<div className="visually-hidden">
								Subclass:{" "}
								{subProfessionIdToBranch(
									operator.subProfessionId
								)}
							</div>
							<span className="visually-hidden">
								Rarity:&nbsp;
							</span>
							<span
								className={cx(
									"ml-auto mr-0.5 leading-[21px]",
									rarityText[
										operator.rarity as keyof typeof rarityText
									]
								)}
							>
								{operator.rarity}
							</span>{" "}
							<StarIcon
								rarity={operator.rarity as OutputTypes.Rarity}
								aria-hidden="true"
								aria-label="stars"
							/>
						</div>
					</a>

					<a
						href={`/${locale}/operators/${slugify(slug)}`}
						className={cx(
							"h-1 bg-gradient-to-r text-center brightness-100 filter transition-all duration-75 ease-in-out will-change-[height] focus:h-8 group-hover:h-8",
							{
								"from-neutral-50 to-neutral-100":
									operator.rarity == 1,
								"from-green-light to-green":
									operator.rarity == 2,
								"from-blue-light to-blue": operator.rarity == 3,
								"from-purple-light to-purple":
									operator.rarity == 4,
								"from-yellow-light to-yellow":
									operator.rarity == 5,
								"from-orange to-orange-light":
									operator.rarity == 6,
							}
						)}
					>
						<span className="mt-1 inline-block font-semibold uppercase text-neutral-950">
							View Operator
						</span>
						<span className="visually-hidden">{operator.name}</span>
					</a>
				</div>
			</div>
		</li>
	);
};

const OperatorCompactItem: React.FC<{
	operator: OutputTypes.Operator;
	locale: string;
}> = ({ operator, locale }) => {
	const [charName, alterName] = operator.name.split(/\sthe\s/i);
	const rarityText = {
		1: "text-neutral-50",
		2: "text-green-light",
		3: "text-blue-light",
		4: "text-purple-light",
		5: "text-yellow-light",
		6: "text-orange-light",
	};

	const enOperator = enOperatorsJson[operator.charId as keyof typeof enOperatorsJson] as OutputTypes.Operator;
	const slug = slugify(enOperator.name);

	return (
		<li className="relative aspect-square h-full overflow-hidden rounded">
			<div className="h-full overflow-hidden bg-neutral-600">
				<div className="relative h-full w-full">
					<img
						loading="lazy"
						className="h-full w-full object-cover object-bottom"
						alt=""
						src={operatorAvatar(operator.charId)}
					/>
				</div>
			</div>
			<div className="group absolute top-0 flex h-full w-full flex-col">
				<div className="flex">
					<div className="flex h-10 w-10 items-center justify-center rounded-br bg-neutral-800/[.66] p-1.5 transition-colors duration-150 ease-in-out will-change-['background-color'] hover:bg-neutral-700">
						<img
							className="h-full w-full"
							src={operatorBranchIcon(operator.subProfessionId)}
							alt=""
						/>
					</div>
					<a
						tabIndex={-1}
						className="block h-11 flex-grow"
						href={`/${locale}/operators/${slug}`}
					></a>
				</div>
				<div className="from-zinc-950 to-100 flex h-full flex-col justify-end bg-gradient-to-b from-transparent from-30% via-transparent via-[67%] to-transparent transition duration-100 ease-in-out focus-within:via-neutral-950/[0.67] focus-within:to-[#1c1c1c] group-hover:from-transparent group-hover:via-neutral-950/[0.67] group-hover:to-[#1c1c1c]">
					<a
						href={`/${locale}/operators/${slug}`}
						className="group/link flex flex-grow flex-col justify-end p-3"
					>
						<h3 className="flex flex-col text-lg font-semibold leading-6 text-neutral-50 opacity-0 transition-opacity group-hover:opacity-100 group-focus/link:opacity-100">
							{alterName ? (
								<>
									{charName}
									<span className="visually-hidden">
										&nbsp;the&nbsp;
									</span>
									<span className="text-base font-normal">
										{alterName}
									</span>
								</>
							) : (
								charName
							)}
						</h3>
						<div className="visually-hidden">
							<span className="visually-hidden">
								Class:&nbsp;
								{professionToClass(operator.profession)}
							</span>
							Subclass:{" "}
							{subProfessionIdToBranch(operator.subProfessionId)}
							<span>Rarity:&nbsp;{operator.rarity}</span>
						</div>
					</a>

					<div
						className={cx("h-1 bg-gradient-to-r text-center", {
							"from-neutral-50 to-neutral-100":
								operator.rarity == 1,
							"from-green-light to-green": operator.rarity == 2,
							"from-blue-light to-blue": operator.rarity == 3,
							"from-purple-light to-purple": operator.rarity == 4,
							"from-yellow-light to-yellow": operator.rarity == 5,
							"from-orange to-orange-light": operator.rarity == 6,
						})}
					></div>
				</div>
			</div>
		</li>
	);
};

const OperatorList: React.FC<{ locale: string }> = ({ locale }) => {
	const operators = useStore($operators);
	const viewConfig = useStore($viewConfig);
	// const isMobile = useMediaQuery("(max-width: 768px)");

	return (
		<ul
			className={cx(
				"grid list-none grid-cols-[repeat(auto-fill,_minmax(144px,_1fr))]",
				viewConfig === "compact"
					? "gap-4 p-0"
					: "gap-x-6 gap-y-4 p-0"
			)}
		>
			{operators.map((op) =>
				viewConfig === "compact" ? (
					<OperatorCompactItem
						key={op.charId}
						locale={locale}
						operator={op}
					/>
				) : (
					<OperatorLargeItem
						key={op.charId}
						locale={locale}
						operator={op}
					/>
				)
			)}
			<SvgRarityGradientDefs />
		</ul>
	);
};

export default OperatorList;
