import { useEffect, useRef, useState } from "react";

import { Tab } from "@headlessui/react";
import { useStore } from "@nanostores/react";
import { Navigation, Scrollbar } from "swiper/modules";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";

import { useTranslations } from "~/i18n/utils.ts";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { operatorStore } from "~/pages/[locale]/operators/_slugstore";
import { cx } from "~/utils/styles.ts";

import OperatorAttributesPanel from "./panels/OperatorAttributesPanel";
// import OperatorRiicPanel from "./panels/OperatorRiicPanel";
import OperatorMiscPanel from "./panels/OperatorMiscPanel";
import OperatorModulesPanel from "./panels/OperatorModulesPanel";
import OperatorRiicPanel from "./panels/OperatorRiicPanel";
import OperatorSkillsPanel from "./panels/OperatorSkillsPanel";
import OperatorTalentsPanel from "./panels/OperatorTalentsPanel";
import OperatorVoicePanel from "./panels/OperatorVoicePanel";

const OperatorTabs: React.FC = () => {
	const operator = useStore(operatorStore);
	const swiperRef = useRef(null);

	const locale = useStore(localeStore);
	const t = useTranslations(locale);

	const tabs = [
		t("operators.details.attributes.title"),
		t("operators.details.talents.title"),
		operator.skillData.length > 0 && t("operators.details.skills.title"),
		operator.modules.length > 0 && t("operators.details.modules.title"),
		t("operators.details.riic.title"),
		t("operators.details.voice.title"),
		t("operators.details.misc.title"),
	].filter(Boolean) as string[];

	const [selectedIndex, setSelectedIndex] = useState(0);

	return (
		<Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
			<Tab.List className="flex flex-row flex-wrap gap-2 bg-neutral-600/[.66] sm:flex-nowrap sm:px-4">
				<Swiper
					// prevent the swiper buttons from showing up briefly on layouts where they shouldn't be
					className={
						"m-0 mx-0 w-full [&>.swiper-button-next]:sm:hidden [&>.swiper-button-prev]:sm:hidden"
					}
					direction="horizontal"
					modules={[Navigation, Scrollbar]}
					navigation={true}
					scrollbar={{ draggable: true }}
					slidesPerView={"auto"}
					freeMode={true}
				>
					{tabs.map((label, i) => {
						return (
							<SwiperSlide
								key={label}
								className={
									label === t("operators.details.misc.title")
										? "md:ml-auto"
										: ""
								}
								style={{ width: "fit-content" }}
							>
								<Tab
									id={`operator-${label.toLowerCase()}-button`}
									aria-controls={`operator-${label.toLowerCase()}-tabpanel`}
									className={cx(
										`relative cursor-pointer appearance-none border-none bg-none p-2 pb-3 text-lg font-semibold uppercase leading-[23px] text-neutral-200 last:justify-self-end`,
										"outline-none [html[data-focus-source=key]_&:focus-visible]:outline-offset-4 [html[data-focus-source=key]_&:focus-visible]:outline-blue-light",
										i === selectedIndex
											? `text-neutral-50 after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0 after:border after:border-neutral-50 after:outline-none`
											: "hover:text-neutral-100"
									)}
								>
									{label}
								</Tab>
							</SwiperSlide>
						);
					})}
				</Swiper>
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
				<Tab.Panel id="operator-voice-panel">
					<OperatorVoicePanel />
				</Tab.Panel>
				<Tab.Panel id="operator-misc-panel">
					<OperatorMiscPanel />
				</Tab.Panel>
			</Tab.Panels>
		</Tab.Group>
	);
};
export default OperatorTabs;
