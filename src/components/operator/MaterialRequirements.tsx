import Tooltip from "~/components/ui/Tooltip";
import { itemImage } from "~/utils/images.ts";
import { cx } from "~/utils/styles.ts";

import { EliteOneIcon, EliteTwoIcon, EliteZeroIcon } from "../icons";

import type * as OutputTypes from "~/types/output-types";

import enItemsJson from "data/en_US/items.json";
import cnItemsJson from "data/zh_CN/items.json";
import krItemsJson from "data/ko_KR/items.json";
import jpItemsJson from "data/ja_JP/items.json";

import { useStore } from "@nanostores/react";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { useTranslations } from "~/i18n/utils.ts";
import type { ui } from "~/i18n/ui.ts";

interface Props {
	minElite?: number;
	minLevel?: number;
	minSkillLevel?: number;
	itemCosts: OutputTypes.ItemCost[];
}

const MaterialRequirements: React.FC<Props> = ({
	itemCosts,
	minElite,
	minLevel = 1,
	minSkillLevel = 1,
}) => {
	const locale = useStore(localeStore);
	const t = useTranslations(locale as keyof typeof ui);

	const shortNumberFormat = Intl.NumberFormat(locale, {
		notation: "compact",
		maximumFractionDigits: 2,
	});

	const itemMap = {
		en: enItemsJson,
		"zh-cn": cnItemsJson,
		kr: krItemsJson,
		jp: jpItemsJson,
	};
	const itemsJson = itemMap[locale as keyof typeof itemMap];

	return (
		<div className="flex flex-col gap-y-3">
			{minElite != null && (
				<div className="grid grid-cols-[16px_auto] items-center gap-x-2">
					{minElite === 0 && (
						<EliteZeroIcon className="stroke-[url(#rarity5)]" />
					)}
					{minElite === 1 && (
						<EliteOneIcon className="fill-[url(#rarity5)]" />
					)}
					{minElite === 2 && (
						<EliteTwoIcon className="fill-[url(#rarity5)]" />
					)}
					<span className="bg-gradient-to-b from-yellow-light to-yellow bg-clip-text text-base font-semibold leading-none text-transparent">
						{/* TODO Replace this with i18n'ed elite 0, 1, 2 */}
						{t("operators.details.general.elite")} {minElite} Lv {minLevel}
					</span>
				</div>
			)}
			{minSkillLevel > 1 &&
				// TODO
				null}
			<div className="flex gap-x-2 overflow-x-auto">
				{itemCosts.map(({ id, count }) => {
					const { name, rarity } =
						itemsJson[id as keyof typeof itemsJson];
					return (
						<Tooltip key={id} content={name}>
							<div
								className="inline-grid h-[52px] w-[52px]"
								style={{
									gridTemplateAreas: "'stack'",
								}}
							>
								<div
									className={cx(
										"h-[52px] w-[52px] rounded-full border-2",
										{
											5: "border-yellow-light bg-yellow-light/30",
											4: "border-purple-light bg-purple-light/30",
											3: "border-blue-light bg-blue-light/30",
											2: "border-green-light bg-green-light/30",
											1: "border-neutral-50 bg-neutral-50/30",
										}[rarity]
									)}
									style={{
										gridArea: "stack",
									}}
								/>
								<img
									className="z-[1] h-[52px] w-[52px]"
									src={itemImage(id)}
									alt={name}
									style={{
										gridArea: "stack",
									}}
								/>
								<span
									className="z-[2] inline-block self-end justify-self-end rounded-lg bg-neutral-950 px-1 py-0.5 text-sm font-semibold leading-none"
									style={{
										gridArea: "stack",
									}}
								>
									<span className="visually-hidden">
										Count: {count}
									</span>
									<span aria-hidden="true">
										{shortNumberFormat.format(count)}
									</span>
								</span>
							</div>
						</Tooltip>
					);
				})}
			</div>
		</div>
	);
};
export default MaterialRequirements;
