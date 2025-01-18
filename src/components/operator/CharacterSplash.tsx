import { useState } from "react";

import { Tab } from "@headlessui/react";
import { useStore } from "@nanostores/react";

import { operatorStore } from "~/pages/[locale]/operators/_store";
import { operatorSplash, operatorSplashAvatar } from "~/utils/images.ts";
import { cx } from "~/utils/styles.ts";

import { EliteOneIcon, EliteTwoIcon, EliteZeroIcon } from "../icons";
import OriginiumIcon from "../icons/OriginiumIcon";

import type * as OutputTypes from "~/types/output-types.ts";
import PaintbrushIcon from "~/components/icons/PaintbrushIcon.tsx";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { useTranslations } from "~/i18n/utils.ts";
import type { ui } from "~/i18n/ui.ts";
import ContingencyTokenIcon from "~/components/icons/ContingencyTokenIcon.tsx";

const CharacterSplash: React.FC = () => {
	const { skins } = useStore(operatorStore);

	let startIndex = 0;
	skins.forEach((skin, i) => {
		if (skin.name === "Elite 2") {
			startIndex = i;
		}
	});

	const [selectedIndex, setSelectedIndex] = useState(startIndex);

	const locale = useStore(localeStore);
	const t = useTranslations(locale as keyof typeof ui);

	return (
		<Tab.Group
			as="div"
			className="h-full rounded-l-lg"
			selectedIndex={selectedIndex}
			onChange={setSelectedIndex}
		>
			<Tab.List className="absolute z-10 flex flex-col overflow-hidden rounded">
				{skins.map((skin, i) => {
					return (
						<Tab
							id={`${skin.skinId}-button`}
							className={cx(
								"relative m-0 flex h-16 w-16 cursor-pointer justify-center overflow-hidden border-none bg-neutral-500 object-cover p-0 opacity-[33%]",
								"outline-none [html[data-focus-source=key]_&:focus-visible]:-outline-offset-2 [html[data-focus-source=key]_&:focus-visible]:outline-blue-light",
								"last:rounded-br-lg sm:last:rounded-br-none",
								i === selectedIndex
									? `bg-neutral-50 !opacity-100` //  after:absolute after:bottom-0 after:w-full after:bg-neutral-50 sm:bg-neutral-500 sm:after:h-1
									: ""
							)}
							key={skin.skinId}
						>
							<img
								className="relative h-16 w-16 object-cover"
								src={operatorSplashAvatar(skin.avatarId)}
								alt={skin.name}
							/>
						</Tab>
					);
				})}
			</Tab.List>
			<Tab.Panels className="h-full">
				{skins.map((skin) => {
					const skinName = skin.name.toLowerCase().includes('elite') ? (t('operators.details.general.elite') + skin.name.toLowerCase().split('elite')[1]) : skin.name;
					return (
						<Tab.Panel
							id={`${skin.skinId}-tabpanel`}
							className={"relative flex h-full items-center"}
							// style={{
							// 	background:
							// 		"linear-gradient(270deg, rgba(0, 0, 0, 0.33) 0%, rgba(0, 0, 0, 0.1) 12.34%, rgba(0, 0, 0, 0) 32.5%)",
							// }}    no longer needed - do not need gradient on right to transition to statblock anymore
							key={skin.skinId}
						>
							{/* TO NOT ANYMORE DO This image causes layout shift of the label when loading.
                  Change to Astro native images / provide height */}
							{/* This was fixed by fixing the width and position of the panel on the right.
							No more layout shift, just make sure there's also no layout shift on mobile */}
							<img
								className="my-0 mx-auto w-[clamp(0px,100%,85vw)] md:w-[clamp(0px,100%,60rem)] h-auto"
								src={operatorSplash(skin.portraitId, skin.type)}
								alt={skin.name}
							/>
							<div className="absolute bottom-0 left-0 inline-flex h-16 items-center gap-4">
								{skin.type === "elite-zero" && (
									<EliteZeroIcon className="h-12 w-12 stroke-neutral-50" />
								)}
								{skin.type === "elite-one-or-two" &&
									skin.name === "Elite 1" && (
										<EliteOneIcon className="h-12 w-12 fill-neutral-50" />
									)}
								{skin.type === "elite-one-or-two" &&
									skin.name === "Elite 2" && (
										<EliteTwoIcon className="h-12 w-12 fill-neutral-50" />
									)}

								<div className="inline-flex w-fit flex-col gap-2">
									<div
										className={
											`inline-flex w-fit items-center gap-2 ${!skin.type.toLowerCase().includes("elite") ? "h-6" : ""}`
											// weird fix that's necessary because we want there to be no leading when the skin is elite
											// in order to better center the icon,
											// but if it's a skin that's not bought using OP and also not an elite skin, not setting
											// the height here causes a layout difference between those skins and the ones bought
											// using OP.
										}
									>
										<span className="text-lg font-semibold leading-none">
											{skinName}
										</span>

										{skins[selectedIndex].cost &&
											skins[
												selectedIndex
											].obtainSources?.includes(
												"Outfit Store"
											) && (
												<div className="inline-flex w-fit rounded-lg bg-neutral-600 px-2.5 py-1 text-base leading-none text-neutral-50">
													<div className="flex flex-row items-center">
														<span className="mr-1 leading-none">
															{
																(
																	skins[
																		selectedIndex
																	] as OutputTypes.Skin
																).cost
															}
														</span>
														<OriginiumIcon />
													</div>
												</div>
											)}
										{skins[selectedIndex].cost &&
											skins[
												selectedIndex
												].obtainSources?.includes(
												"Contingency Contract Store"
											) && (
												<div className="inline-flex w-fit rounded-lg bg-neutral-600 px-2.5 py-1 text-base leading-none text-neutral-50">
													<div className="flex flex-row items-center">
														<span className="mr-1 leading-none">
															{
																(
																	skins[
																		selectedIndex
																		] as OutputTypes.Skin
																).cost
															}
														</span>
														<ContingencyTokenIcon />
													</div>
												</div>
											)}
									</div>
									<div className="inline-flex h-5 gap-2">
										<PaintbrushIcon />
										<span className="text-blue-light">
											{skin.displaySkin.drawerList?.join(
												", "
											)}
										</span>
									</div>
								</div>
							</div>
						</Tab.Panel>
					);
				})}
			</Tab.Panels>
		</Tab.Group>
	);
};
export default CharacterSplash;
