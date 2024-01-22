import { useStore } from "@nanostores/react";

import ArchiveIcon from "~/components/icons/ArchiveIcon";
import { operatorStore } from "~/pages/[locale]/operators/_store";
import { useState } from "react";

import itemsJson from "../../../../data/en_US/items.json";
import { arbitraryImage, itemImage, operatorAvatar } from "~/utils/images.ts";
import { cx } from "~/utils/styles.ts";

const OperatorMiscPanel: React.FC = () => {
	const operator = useStore(operatorStore);
	const handbook = operator.handbook;

	// split off Infection Status from basicInfo
	const basicInfo = handbook.basicInfo.filter(
		(info) => info.title !== "Infection Status"
	);
	const infectionStatus = handbook.basicInfo.filter(
		(info) => info.title === "Infection Status"
	);

	// TODO use this to handle robot operators
	const isRobot = operator.rarity === 1;

	// 0: not open
	// 1-4: archive 1-4
	// 5: promotion record
	const [currentArchive, setCurrentArchive] = useState(0);

	console.log(operator.potentialItemId);
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
						? `Archive ${currentArchive}`
						: "Promotion Record"}
				</h2>
				<hr className="border border-neutral-600" />
				<p className="whitespace-pre-line text-base font-normal leading-normal">
					{currentArchive <= 4
						? handbook.archives[currentArchive - 1]
						: handbook.promotionRecord}
				</p>
			</div>
		);
	}
	return (
		<div className="grid gap-y-4 rounded-br-lg p-6">
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
			<div className="grid grid-cols-[1fr,_1px,_1fr] gap-4">
				<div>
					<h2 className="mb-4 font-serif text-2xl font-semibold">
						Basic Info
					</h2>
					<ul>
						{basicInfo.map((info) => (
							<li
								className="mb-4 flex items-center justify-between last:mb-0"
								key={info.title}
							>
								<span className="text-base leading-normal text-neutral-200">
									{info.title}
								</span>
								<span className="text-lg font-semibold">
									{info.value}
								</span>
							</li>
						))}
					</ul>
				</div>
				<div className="border-l border-neutral-600"></div>
				<div>
					<h2 className="mb-4 font-serif text-2xl font-semibold">
						Physical Exam
					</h2>
					<ul>
						{handbook.physicalExam.map((item) => (
							<li
								className="mb-4 flex items-center justify-between last:mb-0"
								key={item.title}
							>
								<span className="text-base leading-normal text-neutral-200">
									{
										// TODO Do we want to collapse Originium Arts Assimilation
										// into Arts Assimilation? It don't fit :pepegaturtle:
										item.title
									}
								</span>
								<span className="text-lg font-semibold">
									{item.value}
								</span>
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className="flex flex-col gap-4 rounded bg-neutral-600 p-4">
				<div>
					<h3 className="mb-1 text-sm leading-none text-neutral-200">
						Infection Status
					</h3>
					<p className="text-base font-normal leading-normal">
						{infectionStatus.length > 0
							? infectionStatus[0].value
							: "N/A"}
					</p>
				</div>
				<div>
					<h3 className="mb-1 text-sm leading-none text-neutral-200">
						Clinical Diagnosis Analysis
					</h3>
					<p
						className="whitespace-pre-line text-base font-normal leading-normal"
						// whitespace-pre-line to preserve newlines
					>
						{handbook.clinicalAnalysis}
					</p>
				</div>
			</div>
			<div className="flex justify-between gap-4">
				{[1, 2, 3, 4].map((archive) => (
					<button
						onClick={() => setCurrentArchive(archive)}
						key={`Archive ${archive}`}
						className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded bg-neutral-600 hover:bg-neutral-500"
					>
						<ArchiveIcon />
						<p className="font-bold uppercase text-neutral-200">
							ARCHIVE {archive}
						</p>
					</button>
				))}
			</div>
			<button
				onClick={() => setCurrentArchive(5)}
				className="flex h-16 items-center justify-center gap-2 bg-neutral-600 hover:bg-neutral-500"
			>
				<svg
					width="28"
					height="26"
					viewBox="0 0 28 26"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M6.72 25.3203L14 20.4663L21.28 25.3203L19.2 20.2003L16.8 18.6003L19.0406 17.1066L21.28 18.5997L20.3254 16.25L25.92 12.5203L28 7.40028L19.0408 13.3735L16.8 11.8797L25.92 5.79969L28 0.679688L14 10.0137L0 0.679688L2.08 5.79969L11.2 11.8797L8.95923 13.3735L0 7.40028L2.08 12.5203L7.67456 16.25L6.72 18.5997L8.9594 17.1066L11.2 18.6003L8.8 20.2003L6.72 25.3203ZM14 13.7457L11.7588 15.24L14 16.7343L16.2412 15.24L14 13.7457Z"
						className="fill-neutral-200"
					/>
				</svg>
				<p className="font-semibold text-neutral-200">
					PROMOTION RECORD
				</p>
			</button>
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
								5: "border-yellow-light bg-yellow-light/30",
								4: "border-purple-light bg-purple-light/30",
								3: "border-blue-light bg-blue-light/30",
								2: "border-green-light bg-green-light/30",
								1: "border-neutral-50 bg-neutral-50/30",
							}[operator.rarity - 1]
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
				<div className="relative flex h-[52px] w-[52px] items-center">
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
