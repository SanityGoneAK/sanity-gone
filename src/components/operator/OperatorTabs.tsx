import { useState } from "react";

import { Tab } from "@headlessui/react";
import { useStore } from "@nanostores/react";

import { operatorStore } from "~/pages/[locale]/operators/_store";
import { cx } from "~/utils/styles.ts";

import OperatorAttributesPanel from "./panels/OperatorAttributesPanel";
// import OperatorRiicPanel from "./panels/OperatorRiicPanel";
import OperatorMiscPanel from "./panels/OperatorMiscPanel";
import OperatorSkillsPanel from "./panels/OperatorSkillsPanel";
import OperatorTalentsPanel from "./panels/OperatorTalentsPanel";

const OperatorTabs: React.FC = () => {
	const operator = useStore(operatorStore);
	const tabs = [
		"Attributes",
		"Talents",
		operator.skillData.length > 0 && "Skills",
		"Modules",
		"RIIC",
		"Misc",
	].filter(Boolean) as string[];

	const [selectedIndex, setSelectedIndex] = useState(0);

	return (
		<Tab.Group
			as="div"
			selectedIndex={selectedIndex}
			onChange={setSelectedIndex}
		>
			<Tab.List className="grid grid-cols-[repeat(5,auto)_1fr] gap-x-2 bg-neutral-600/[.66] px-4 pb-2">
				{tabs.map((label, i) => {
					return (
						<Tab
							key={label}
							id={`operator-${label.toLowerCase()}-button`}
							aria-controls={`operator-${label.toLowerCase()}-tabpanel`}
							className={cx(
								`relative cursor-pointer appearance-none border-none bg-none p-2 text-lg
								font-semibold uppercase leading-[23px] text-neutral-200
								last:justify-self-end`,
								"outline-none [html[data-focus-source=key]_&:focus-visible]:outline-offset-4 [html[data-focus-source=key]_&:focus-visible]:outline-blue-light",
								i === selectedIndex
									? `:after:outline-none text-neutral-50 after:absolute after:bottom-[-8px] after:left-2 after:right-2 after:h-0
									after:border after:border-neutral-50 after:shadow-[0px_-4px_16px] after:shadow-neutral-50`
									: "hover:text-neutral-100"
							)}
						>
							{label}
						</Tab>
					);
				})}
			</Tab.List>
			<Tab.Panels>
				<Tab.Panel id="operator-attributes-panel">
					<OperatorAttributesPanel />
				</Tab.Panel>
				<Tab.Panel id="operator-talents-panel">
					<OperatorTalentsPanel />
				</Tab.Panel>
				{operator.skillData.length > 0 && (
					<Tab.Panel id="operator-skills-panel">
						<OperatorSkillsPanel />
					</Tab.Panel>
				)}
				<Tab.Panel id="operator-modules-panel">
					{/* TODO */}
					Modules panel
				</Tab.Panel>
				<Tab.Panel id="operator-riic-panel">
					{/*<OperatorRiicPanel />*/}
				</Tab.Panel>
				<Tab.Panel id="operator-misc-panel">
					<OperatorMiscPanel />
				</Tab.Panel>
			</Tab.Panels>
		</Tab.Group>
	);
};
export default OperatorTabs;
