import { useStore } from "@nanostores/react";
import { useMemo, useState } from "react";
import PillButtonGroup from "~/components/ui/PillButtonGroup";

import { operatorStore } from "~/pages/[locale]/operators/_store";
import PotentialsDropdown from "../PotentialsDropdown";
import { moduleImage, moduleTypeImage } from "~/utils/images";
import { AttackSpeedIcon, DPCostIcon, HealthIcon } from "~/components/icons";
import MaterialRequirements from "../MaterialRequirements";

const OperatorModulesPanel: React.FC = () => {
	const operator = useStore(operatorStore);
	const [model, setModel] = useState("x");
	const [stage, setStage] = useState(0);

	return (
		<div className="flex flex-col gap-4 p-6">
			<div className="grid grid-cols-[auto_auto_1fr] items-center gap-x-4 border-b border-neutral-600 pb-4">
				<div className="grid grid-flow-col items-center gap-x-2 text-neutral-200">
					<span>Model</span>
					<PillButtonGroup
						labels={["x", "y"]}
						value={model}
						onChange={setModel}
					/>
				</div>
				<PillButtonGroup
					labels={[0, 1, 2]}
					value={stage}
					onChange={setStage}
				/>
				{/* Someone fix this plz */}
				{/* <PotentialsDropdown
					potentialsToShow={potentialsMap[`PHASE_${elite}`]}
					currentPotential={potential}
					onChange={setPotential}
				/> */}
			</div>
			<div className="grid gap-y-4 rounded-br-lg">
				<div className="grid-areas-module grid grid-cols-[192px_1fr] grid-rows-[auto_auto_1fr] items-center gap-x-4 gap-y-4">
					<div className="grid-in-image h-full overflow-hidden rounded-lg bg-neutral-900">
						<img
							className="h-[182px]"
							src={moduleImage("uniequip_002_lumen")}
							alt=""
						/>
						<button
							className="w-full border-t border-neutral-600 py-2 hover:bg-neutral-600"
							type="button"
						>
							View Story
						</button>
					</div>
					<div className="grid-in-title grid-areas-module-title grid grid-cols-[48px_1fr]">
						<img
							className="grid-in-icon"
							src={moduleTypeImage("arc-x")}
							alt=""
						/>
						<h2 className="font-serif text-2xl grid-in-name">
							Blueberries and Dark Chocolate
						</h2>
						<p className="grid-in-code font-semibold text-purple">
							EXE-Y
						</p>
					</div>
					<dl className="grid-in-stats flex gap-2">
						<div className="flex w-full items-center justify-start gap-x-2 rounded bg-neutral-600 px-2 py-1">
							<HealthIcon />
							<dt className="text-neutral-200">Health</dt>
							<dd className="ml-auto">+12</dd>
						</div>
						<div className="flex w-full items-center justify-start gap-x-2 rounded bg-neutral-600 px-2 py-1">
							<AttackSpeedIcon />
							<dt className="text-neutral-200">Attack</dt>
							<dd className="ml-auto">+100</dd>
						</div>
						<div className="flex w-full items-center justify-start gap-x-2 rounded bg-neutral-600 px-2 py-1">
							<DPCostIcon />
							<dt className="text-neutral-200">DP</dt>
							<dd className="ml-auto">-1</dd>
						</div>
					</dl>
					<div className="grid-in-trait self-start">
						<h3 className="mb-1 text-sm text-neutral-200">Trait</h3>
						<p>
							Attack +10% when there are no friendly operator in
							the surrounding four squares
						</p>
					</div>
				</div>
				<div>
					<h2 className="text-lg font-semibold leading-[23px]">
						Promotion Requirements
					</h2>
					{/* <MaterialRequirements
							itemCosts={itemCosts}
							minElite={minElite}
							minLevel={minLevel}
						/> */}
				</div>
				<div className="flex flex-col gap-4">
					<h2 className="text-lg font-semibold leading-[23px]">
						Unlock Missions
					</h2>
					<div>
						<h3 className="mb-1 text-sm leading-[14px] text-neutral-200">
							Trait
						</h3>
						<p>
							Eliminate 10 elite or leader enemies through
							non-assist combat as Texas The Omertosa.
						</p>
					</div>
					<div>
						<h3 className="mb-1 text-sm leading-[14px] text-neutral-200">
							Trait
						</h3>
						<p>
							Complete the extra story CB-8 with a 3-star rating,
							and at least 2 Greytail enemies must be eliminated
							using Texas The Omertosa.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OperatorModulesPanel;
