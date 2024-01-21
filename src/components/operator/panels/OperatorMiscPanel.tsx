import { useStore } from "@nanostores/react";

import ArchiveIcon from "~/components/icons/ArchiveIcon";
import { operatorStore } from "~/pages/[locale]/operators/_store";

const OperatorMiscPanel: React.FC = () => {
	const operator = useStore(operatorStore);

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
				<p>
					Penguin Logistics employees, the last members of the Texas
					family, have outstanding individual combat capabilities.
				</p>
			</div>
			<div className="grid grid-cols-[1fr,_1px,_1fr] gap-4">
				<div>
					<h2 className="mb-4 font-serif text-2xl font-semibold">
						Basic Info
					</h2>
					<ul>
						<li className="flex items-center justify-between">
							<span className="text-neutral-200">Code</span>{" "}
							<span className="text-lg font-semibold">
								Texas the Ormetrosa
							</span>
						</li>
					</ul>
				</div>
				<div className="border-l border-neutral-600"></div>
				<div>
					<h2 className="mb-4 font-serif text-2xl font-semibold">
						Physical Exam
					</h2>
					<ul>
						<li className="flex items-center justify-between">
							<span className="text-neutral-200">Code</span>{" "}
							<span className="text-lg font-semibold">
								Texas the Ormetrosa
							</span>
						</li>
					</ul>
				</div>
			</div>
			<div className="rounded bg-neutral-600 p-4">
				<div>
					<h3 className="leading=[14px] mb-1 text-neutral-200">
						Infection Status
					</h3>
					<p>
						According to the medical test, subject is confirmed to
						be uninfected.
					</p>
				</div>
				<div>
					<h3 className="leading=[14px] mb-1 text-neutral-200">
						Clinical Diagnosis Analysis
					</h3>
					<p>
						The results of the imaging test showed that the internal
						organs of the operator were clearly outlined, no
						abnormal shadows were seen, no abnormalities were found
						in the detection of Originium particles in the
						circulatory system, and there was no sign of ore disease
						infection. At this stage, it can be confirmed that he is
						not infected with ore disease.[Fusion rate of somatic
						cells and origin stones] 0%Operator Dexas showed no
						signs of being infected by origin stones.[Blood Origin
						Stone Crystallization Density] 0.12u/LJudging from the
						experience of Operator Dexas, it is a miracle that she
						was not infected in such a dangerous environment, or
						conversely, this is also a proof of her superb skills.
					</p>
				</div>
			</div>
			<div className="flex justify-between gap-4">
				<div className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded bg-neutral-600 hover:bg-neutral-500">
					<ArchiveIcon />
					<p className="font-bold uppercase text-neutral-200">
						ARCHIVE 1
					</p>
				</div>
				<div className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded bg-neutral-600 hover:bg-neutral-500">
					<ArchiveIcon />
					<p className="font-bold uppercase text-neutral-200">
						ARCHIVE 2
					</p>
				</div>
				<div className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded bg-neutral-600 hover:bg-neutral-500">
					<ArchiveIcon />
					<p className="font-bold uppercase text-neutral-200">
						ARCHIVE 3
					</p>
				</div>
				<div className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded bg-neutral-600 hover:bg-neutral-500">
					<ArchiveIcon />
					<p className="font-bold uppercase text-neutral-200">
						ARCHIVE 4
					</p>
				</div>
			</div>
			<div className="flex h-16 items-center justify-center gap-2 bg-neutral-600 hover:bg-neutral-500">
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
			</div>
		</div>
	);
};

export default OperatorMiscPanel;
