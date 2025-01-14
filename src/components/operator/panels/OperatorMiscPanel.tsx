import { useStore } from "@nanostores/react";

import ArchiveIcon from "~/components/icons/ArchiveIcon";
import { operatorStore } from "~/pages/[locale]/operators/_store";
import { useState } from "react";

import enItemsJson from "../../../../data/en_US/items.json";
import cnItemsJson from "../../../../data/zh_CN/items.json";
import krItemsJson from "../../../../data/ko_KR/items.json";
import jpItemsJson from "../../../../data/ja_JP/items.json";
import {
	arbitraryImage,
	itemImage,
	operatorAvatar,
	operatorClassIcon,
} from "~/utils/images.ts";
import { cx } from "~/utils/styles.ts";
import OriginiumIcon from "~/components/icons/OriginiumIcon.tsx";
import Accordion from "~/components/ui/Accordion.tsx";
import { EliteTwoIcon } from "~/components/icons";
import GuardIcon from "~/components/icons/GuardIcon.tsx";
import { classToProfession } from "~/utils/classes.ts";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { useTranslations } from "~/i18n/utils.ts";
import type { ui } from "~/i18n/ui.ts";

const OperatorMiscPanel: React.FC = () => {
	const locale = useStore(localeStore);
	const t = useTranslations(locale as keyof typeof ui);

	const operator = useStore(operatorStore);
	const handbook = operator.handbook;

	// split off Infection Status and Inspection Report (robots only) from basicInfo
	const infectionInspection = handbook.basicInfo.filter((info) =>
		["Inspection Report", "Infection Status"].includes(info.title)
	);

	const basicInfo = handbook.basicInfo.filter(
		(info) =>
			!["Inspection Report", "Infection Status"].includes(info.title)
	);

	const isRobot = operator.tagList.some((tag) => ['Robot', 'ロボット', '로봇', '支援机械'].includes(tag));

	// 0: not open
	// 1-4: archive 1-4
	// 5: promotion record
	const [currentArchive, setCurrentArchive] = useState(0);

	// console.log(operator.potentialItemId);
	const itemMap = {
		en: enItemsJson,
		'zh-cn': cnItemsJson,
		kr: krItemsJson,
		jp: jpItemsJson,
	}
	const itemsJson = itemMap[locale as keyof typeof itemMap];
	const potItem =
		itemsJson[operator.potentialItemId as keyof typeof itemsJson];

	if (currentArchive != 0) {
		return (
			<div className="flex flex-col gap-4 rounded-br-lg p-6">
				<button
					className="flex items-center gap-2"
					onClick={() => setCurrentArchive(0)}
					// TODO We may want to make this its own component
				>
					<svg
						width="8"
						height="14"
						viewBox="0 0 8 14"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M7 13L1 7L7 1"
							stroke="#B8B8C0"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<p>Miscellaneous Details</p>
				</button>
				<h2 className="font-serif text-2xl font-semibold">
					{currentArchive <= 4
						? `${t('operators.details.misc.archive')} ${currentArchive}`
						: t('operators.details.misc.promotion_record')}
				</h2>
				<hr className="border border-neutral-600" />
				<p
					className="whitespace-pre-line text-base font-normal leading-normal"
					dangerouslySetInnerHTML={{
						__html:
							currentArchive <= 4
								? handbook.archives[currentArchive - 1]
								: handbook.promotionRecord,
					}}
				/>
			</div>
		);
	}

	return (
		<div className="grid gap-y-4 rounded-br-lg p-6">
			<div className="inline-flex w-fit gap-2 rounded bg-neutral-800/80 text-base leading-normal text-neutral-50 backdrop-blur-[4px]">
				<span className="text-neutral-200">VA</span>
				<ul className="m-0 flex list-none gap-2 p-0">
					{operator.voices.map((voice) => (
						<li key={voice.voiceLangType}>
							{voice.voiceLangType}:{voice.cvName.join(", ")}
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
				<h2 className="font-serif text-2xl font-semibold">Profile</h2>
				<p className="text-base font-normal leading-normal">
					{handbook.profile}
				</p>
			</div>
			<div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1fr,_1px,_1fr]">
				<div>
					<h2 className="mb-4 font-serif text-2xl font-semibold">
						{t("operators.details.misc.basic_info")}
					</h2>
					<ul>
						{basicInfo.map((info) => (
							<li
								className="mb-4 flex h-6 items-center justify-between last:mb-0"
								key={info.title}
							>
								<span className="text-base leading-none text-neutral-200">
									{info.title}
								</span>
								<span className="text-lg font-semibold leading-none">
									{info.value}
								</span>
							</li>
						))}
					</ul>
				</div>
				<div className="border-t border-neutral-600 sm:border-l"></div>
				<div>
					<h2 className="mb-4 font-serif text-2xl font-semibold">
						{isRobot ? t('operators.details.misc.performance_review'): t("operators.details.misc.physical_exam")}
					</h2>
					<ul>
						{handbook.physicalExam.map((item) => (
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
								<span className="text-lg font-semibold leading-none">
									{item.value}
								</span>
							</li>
						))}
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
							{t("operators.details.misc.clinical_diagnosis_analysis")}
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
						<div>
							<Accordion
								icon={<ArchiveIcon />}
								title={`${t("operators.details.misc.archive")} ${index + 1}`}
							>
								<p className="mt-0 whitespace-pre-line font-normal text-neutral-50" dangerouslySetInnerHTML={
									{ __html: archive }
								}></p>
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
								title={t("operators.details.misc.class_conversion_record")}
							>
								<p className="mt-0 whitespace-pre-line font-normal text-neutral-50" dangerouslySetInnerHTML={
									{ __html: handbook.classConversionRecord[0] }
								}></p>
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
								<p className="mt-0 whitespace-pre-line font-normal text-neutral-50" dangerouslySetInnerHTML={
									{ __html: handbook.classConversionRecord[1] }
								}></p>
							</Accordion>
						</div>
					</div>
				)}

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
