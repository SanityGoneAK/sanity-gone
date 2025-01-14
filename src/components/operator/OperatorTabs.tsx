import { useState } from "react";

import { Tab } from "@headlessui/react";
import { useStore } from "@nanostores/react";

import { useTranslations } from "~/i18n/utils.ts";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { operatorStore } from "~/pages/[locale]/operators/_store";
import { cx } from "~/utils/styles.ts";

import OperatorAttributesPanel from "./panels/OperatorAttributesPanel";
// import OperatorRiicPanel from "./panels/OperatorRiicPanel";
import OperatorMiscPanel from "./panels/OperatorMiscPanel";
import OperatorModulesPanel from "./panels/OperatorModulesPanel";
import OperatorRiicPanel from "./panels/OperatorRiicPanel";
import OperatorSkillsPanel from "./panels/OperatorSkillsPanel";
import OperatorTalentsPanel from "./panels/OperatorTalentsPanel";

import type { ui } from "~/i18n/ui.ts";

const OperatorTabs: React.FC = () => {
	const operator = useStore(operatorStore);

	const locale = useStore(localeStore);
	const t = useTranslations(locale as keyof typeof ui);

	const tabs = [
		t("operators.details.attributes.title"),
		t("operators.details.talents.title"),
		operator.skillData.length > 0 && t("operators.details.skills.title"),
		operator.modules.length > 0 && t("operators.details.modules.title"),
		t("operators.details.riic.title"),
		t("operators.details.misc.title"),
	].filter(Boolean) as string[];

	const [selectedIndex, setSelectedIndex] = useState(0);

	return (
		<Tab.Group
			as="div"
			selectedIndex={selectedIndex}
			onChange={setSelectedIndex}
		>
			{/* TODO i wanted to preview layout so i literally did the dumbest thing that would make it work lMAO
			 this is terrible, fix it please */}
			<Tab.List className="flex flex-row flex-wrap gap-2 bg-neutral-600/[.66] px-4 pb-2 sm:flex-nowrap">
				{tabs.map((label, i) => {
					return (
						<Tab
							key={label}
							id={`operator-${label.toLowerCase()}-button`}
							aria-controls={`operator-${label.toLowerCase()}-tabpanel`}
							className={cx(
								`relative cursor-pointer appearance-none border-none bg-none p-2 text-lg font-semibold uppercase leading-[23px] text-neutral-200 last:justify-self-end`,
								"outline-none [html[data-focus-source=key]_&:focus-visible]:outline-offset-4 [html[data-focus-source=key]_&:focus-visible]:outline-blue-light",
								i === selectedIndex
									? `:after:outline-none text-neutral-50 after:absolute after:bottom-[-8px] after:left-2 after:right-2 after:h-0 after:border after:border-neutral-50`
									: "hover:text-neutral-100",
								label === "Misc" ? "ml-auto" : ""
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
				{operator.modules.length > 0 && (
					<Tab.Panel id="operator-modules-panel">
						<OperatorModulesPanel />
					</Tab.Panel>
				)}
				<Tab.Panel id="operator-riic-panel">
					<OperatorRiicPanel />
				</Tab.Panel>
				<Tab.Panel id="operator-misc-panel">
					<OperatorMiscPanel />
				</Tab.Panel>
			</Tab.Panels>
		</Tab.Group>
	);
};
export default OperatorTabs;
