import { Fragment, useState } from "react";

import { useStore } from "@nanostores/react";

import { EliteTwoIcon } from "~/components/icons";
import ArchiveIcon from "~/components/icons/ArchiveIcon";
import GuardIcon from "~/components/icons/GuardIcon.tsx";
import OriginiumIcon from "~/components/icons/OriginiumIcon.tsx";
import StarIcon from "~/components/icons/StarIcon.tsx";
import Accordion from "~/components/ui/Accordion.tsx";
import Tooltip from "~/components/ui/Tooltip.tsx";
import { useTranslations } from "~/i18n/utils.ts";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { operatorStore } from "~/pages/[locale]/operators/_slugstore";
import { classToProfession } from "~/utils/classes.ts";
import {
	arbitraryImage,
	itemImage,
	operatorAvatar,
	operatorClassIcon,
} from "~/utils/images.ts";
import { toTitleCase } from "~/utils/strings.ts";
import { cx } from "~/utils/styles.ts";

import enItemsJson from "../../../../data/en_US/items.json";
import jpItemsJson from "../../../../data/ja_JP/items.json";
import krItemsJson from "../../../../data/ko_KR/items.json";
import cnItemsJson from "../../../../data/zh_CN/items.json";

import type { Locale } from "~/i18n/languages";
import type { ui } from "~/i18n/ui.ts";

const OperatorMiscPanel: React.FC = () => {
	const locale = useStore(localeStore);
	const t = useTranslations(locale);

	const operator = useStore(operatorStore);
	const handbook = operator.handbook;

	// split off Infection Status and Inspection Report (robots only) from basicInfo
	const infectionInspection = handbook.basicInfo.filter((info) =>
		[
			"Inspection Report",
			"Infection Status", // en
			"鉱石病感染状況",
			"メンテナンス結果報告", // jp
			"광석병 감염 상황",
			"점검 검사 보고", // kr
			"矿石病感染情况",
			"维护检测报告", // cn
		].includes(info.title)
	);

	const basicInfo = handbook.basicInfo.filter(
		(info) =>
			![
				"Inspection Report",
				"Infection Status", // en
				"鉱石病感染状況",
				"メンテナンス結果報告", // jp
				"광석병 감염 상황",
				"점검 검사 보고", // kr
				"矿石病感染情况",
				"维护检测报告", // cn
			].includes(info.title)
	);

	// split off PhysicalInfo if there are any newlines chilling in there at the end
	const lastPhysicalInfo = handbook.physicalExam.length - 1;

	// create a deep copy of PhysicalExam to not modify the original JSON
	// (this will ensure reloads and data modifications won't break this)
	// TODO Maybe this is better to handle in GameData?
	const handbookPhysicalExam: {
		title: string;
		value: string;
	}[] = JSON.parse(JSON.stringify(handbook.physicalExam));
	let extraInfo = null;

	if (handbook.physicalExam[lastPhysicalInfo].value.includes("\n")) {
		const lastEntrySplit =
			handbookPhysicalExam[lastPhysicalInfo].value.split("\n");
		extraInfo = lastEntrySplit
			.slice(1, lastEntrySplit.length)
			.join("\n")
			.trim();
		handbookPhysicalExam[lastPhysicalInfo].value = lastEntrySplit[0].trim();
	}

	const isRobot = operator.tagList.some((tag) =>
		["Robot", "ロボット", "로봇", "支援机械"].includes(tag)
	);

	// console.log(operator.potentialItemId);
	const itemMap: Record<Locale, any> = {
		en: enItemsJson,
		"zh-cn": cnItemsJson,
		ko: krItemsJson,
		ja: jpItemsJson,
	};
	const itemsJson = itemMap[locale as keyof typeof itemMap];
	const potItem = operator.potentialItemId
		? itemsJson[operator.potentialItemId as keyof typeof itemsJson]
		: itemsJson[operator.activityPotentialItemId as keyof typeof itemsJson];

	return (
		<div className="grid gap-y-4 rounded-br-lg p-6">
			<div className="inline w-fit rounded bg-neutral-800/80 backdrop-blur-[4px]">
				<ul className="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-base leading-normal text-neutral-50">
					<li>
						<span className="text-neutral-200">VA</span>
					</li>
					{operator.voices.map((voice) => (
						<li key={voice.voiceLangType}>
							<Tooltip content={voice.voiceLangType}>
								<div className="flex items-center gap-0.5">
									<img
										className="w-5"
										src={`/flags/${voice.voiceLangType}.png`}
										alt={voice.voiceLangType}
									/>
									{voice.cvName.join(", ")}
								</div>
							</Tooltip>
						</li>
					))}
				</ul>
			</div>
			<ul className="flex gap-2">
				{operator.tagList.map((tag, index) => (
					<li
						className="rounded bg-neutral-500 px-2 py-1 text-sm"
						key={index}
					>
						{tag}
					</li>
				))}
			</ul>
			<div>
				<h2 className="font-serif text-2xl font-semibold">
					{t("operators.details.misc.profile")}
				</h2>
				<p
					className="whitespace-pre-line text-base font-normal leading-normal"
					dangerouslySetInnerHTML={{ __html: handbook.profile }}
				></p>
			</div>
			<div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1fr,_1px,_1fr]">
				<div>
					<h2 className="mb-4 font-serif text-2xl font-semibold">
						{t("operators.details.misc.basic_info")}
					</h2>
					<ul>
						{basicInfo.map((info) => (
							<li
								className={cx(
									`mb-4 flex items-center justify-between last:mb-0`,
									info.value.length > 50 ? "" : "h-6" // oh hi ifrit...
								)}
								key={info.title}
							>
								<span className="text-base leading-none text-neutral-200">
									{info.title}
								</span>
								<span
									className={cx(
										`max-w-[250px] whitespace-pre-wrap text-right text-lg font-semibold leading-none`,
										info.value.length > 50 ? "break-words" : ""
									)}
									// i hate ifrit, i have to set max-w-250px AND break-words or the layout completely breaks on mobile
									// due to lackluster whitespace-pre-wrap support... it does it correctly but it
									// expands the div to be way too wide, expanding the whole layout
								>
									{info.value}
								</span>
							</li>
						))}
					</ul>
				</div>
				<div className="border-t border-neutral-600 sm:border-l"></div>
				<div>
					<h2 className="mb-4 font-serif text-2xl font-semibold">
						{isRobot
							? t("operators.details.misc.performance_review")
							: t("operators.details.misc.physical_exam")}
					</h2>
					<ul>
						{handbookPhysicalExam.map((item) => (
							<li
								className="mb-4 flex h-6 items-center justify-between last:mb-0"
								key={item.title}
							>
								<span className="text-base leading-none text-neutral-200">
									{item.title ===
									"Originium Arts Assimilation" ? ( // i may or may not be slightly trolling
										// (it had to be done, otherwise certain arts assimilation values wouldn't fit)
										<div className="flex flex-row items-center gap-1.5">
											<OriginiumIcon />
											<p>Arts Assimilation</p>
										</div>
									) : (
										item.title
									)}
								</span>
								<span className="text-right text-lg font-semibold leading-none">
									{item.value}
								</span>
							</li>
						))}
						{extraInfo && (
							<li className="mb-4 flex items-center justify-between last:mb-0">
								<span
									className="whitespace-pre-line text-base leading-snug text-neutral-200"
									dangerouslySetInnerHTML={{
										__html: extraInfo,
									}}
								></span>
							</li>
						)}
					</ul>
				</div>
			</div>
			<div className="flex flex-col gap-4 rounded bg-neutral-600 p-4">
				{infectionInspection && infectionInspection.length > 0 ? (
					<div>
						<h3 className="mb-1 text-sm leading-none text-neutral-200">
							{infectionInspection[0].title}
						</h3>
						<p className="text-base font-normal leading-normal">
							{infectionInspection[0].value}
						</p>
					</div>
				) : (
					<div>
						<h3 className="mb-1 text-sm leading-none text-neutral-200">
							{t("operators.details.misc.infection_status")}
						</h3>
						<p className="text-base font-normal leading-normal">
							N/A
						</p>
					</div>
				)}
				{!isRobot && (
					<div>
						<h3 className="mb-1 text-sm leading-none text-neutral-200">
							{t(
								"operators.details.misc.clinical_diagnosis_analysis"
							)}
						</h3>
						<p
							className="whitespace-pre-line text-base font-normal leading-normal"
							// whitespace-pre-line to preserve newlines
						>
							{handbook.clinicalAnalysis}
						</p>
					</div>
				)}
			</div>
			{handbook.archives && handbook.archives.length > 0 && (
				<div className="flex flex-col gap-4">
					{handbook.archives.map((archive, index) => (
						<div key={index}>
							<Accordion
								icon={<ArchiveIcon />}
								title={`${t("operators.details.misc.archive")} ${index + 1}`}
							>
								<p
									className="mt-0 whitespace-pre-line font-normal text-neutral-50"
									dangerouslySetInnerHTML={{
										__html: archive,
									}}
								></p>
							</Accordion>
						</div>
					))}
				</div>
			)}
			{handbook.promotionRecord && (
				<div>
					<Accordion
						icon={<EliteTwoIcon />}
						title={t("operators.details.misc.promotion_record")}
						fill={true}
					>
						<p className="mt-0 whitespace-pre-line font-normal text-neutral-50">
							{handbook.promotionRecord}
						</p>
					</Accordion>
				</div>
			)}
			{handbook.classConversionRecord &&
				handbook.classConversionRecord.length > 0 && (
					// oh hi amiya.
					// guardmiya class conversion record first
					<div className="flex flex-col gap-4">
						<div>
							<Accordion
								icon={
									<img
										className="h-8 w-8"
										src={operatorClassIcon(
											classToProfession(
												"Guard"
											).toLowerCase()
										)}
										alt="Guard"
									/>
								}
								title={t(
									"operators.details.misc.class_conversion_record"
								)}
							>
								<p
									className="mt-0 whitespace-pre-line font-normal text-neutral-50"
									dangerouslySetInnerHTML={{
										__html: handbook
											.classConversionRecord[0],
									}}
								></p>
							</Accordion>
						</div>
						<div>
							<Accordion
								icon={
									<img
										className="h-8 w-8"
										src={operatorClassIcon(
											classToProfession(
												"Medic"
											).toLowerCase()
										)}
										alt="Medic"
									/>
								}
								title="Class Conversion Record"
							>
								<p
									className="mt-0 whitespace-pre-line font-normal text-neutral-50"
									dangerouslySetInnerHTML={{
										__html: handbook
											.classConversionRecord[1],
									}}
								></p>
							</Accordion>
						</div>
					</div>
				)}
			{
				// certain very special operators don't have potential items... (conviction again)
				potItem && (
					<div className="flex flex-row items-center gap-4">
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
										6: "border-yellow bg-yellow/30",
										5: "border-yellow-light bg-yellow-light/30",
										4: "border-purple-light bg-purple-light/30",
										3: "border-blue-light bg-blue-light/30",
										2: "border-green-light bg-green-light/30",
										1: "border-neutral-50 bg-neutral-50/30",
									}[operator.rarity]
								)}
								style={{
									gridArea: "stack",
								}}
							/>
							<img
								src={itemImage(potItem.iconId)}
								className="h-[52px] w-[52px]"
								style={{
									gridArea: "stack",
								}}
							/>
						</div>

						<div>
							<p className="text-base font-normal leading-normal">
								{potItem.description}
							</p>
							<p className="text-base font-normal italic leading-normal text-neutral-200">
								{potItem.usage}
							</p>
						</div>
					</div>
				)
			}
			<div className="flex flex-row items-center gap-4">
				<div className="relative flex h-[52px] w-[52px] flex-none items-center">
					<img
						src={arbitraryImage(
							`unknown/op_r${operator.rarity}.png`
						)}
						className="relative h-[60px] w-[60px] object-cover"
					/>
					<img
						src={operatorAvatar(operator.charId, 0)}
						className={
							"absolute left-[8px] top-[8px] h-[30px] w-[30px]"
						}
					/>
				</div>
				<div>
					<p className="text-base font-normal leading-normal">
						{operator.itemUsage}
					</p>
					<p className="text-base font-normal italic leading-normal text-neutral-200">
						{operator.itemDesc}
					</p>
				</div>
			</div>
		</div>
	);
};

export default OperatorMiscPanel;
