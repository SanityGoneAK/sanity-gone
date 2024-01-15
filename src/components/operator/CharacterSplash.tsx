import { useState } from "react";

import { Tab } from "@headlessui/react";
import { useStore } from "@nanostores/react";

import { operatorStore } from "~/pages/[locale]/operators/_store";
import { operatorSplash, operatorSplashAvatar } from "~/utils/images.ts";

import { EliteOneIcon, EliteTwoIcon, EliteZeroIcon } from "../icons";
import OriginiumIcon from "../icons/OriginiumIcon";

import type * as OutputTypes from "~/types/output-types.ts";
import { cx } from "~/utils/styles.ts";

const CharacterSplash: React.FC = () => {
	const { skins, voices } = useStore(operatorStore);

	let startIndex = 0;
	skins.forEach((skin, i) => {
		if (skin.name === "Elite 2") {
			startIndex = i;
		}
	});

	const [selectedIndex, setSelectedIndex] = useState(startIndex);

	return (
		<Tab.Group
			as="div"
			className="bg-neutral-800"
			selectedIndex={selectedIndex}
			onChange={setSelectedIndex}
		>
			<Tab.List className="flex overflow-hidden rounded-tl-[6px] bg-neutral-700">
				{skins.map((skin, i) => {
					return (
						<Tab
							id={`${skin.skinId}-button`}
							className={cx(
								"focus-visible:outline-solid outline-solid relative m-0 flex h-16 w-16 cursor-pointer justify-center overflow-hidden border-none bg-neutral-500 object-cover p-0 opacity-[33%] focus-visible:outline-none",
								i === selectedIndex
									? ` !opacity-100 after:absolute after:bottom-0 after:h-1 after:w-full after:bg-neutral-50`
									: ""
							)}
							key={skin.skinId}
						>
							<img
								className="relative h-16 w-16 object-cover"
								src={operatorSplashAvatar(
									skin.avatarId,
									skin.type
								)}
								alt={skin.name}
							/>
						</Tab>
					);
				})}
			</Tab.List>
			<Tab.Panels>
				{skins.map((skin) => {
					return (
						<Tab.Panel
							id={`${skin.skinId}-tabpanel`}
							className={"relative"}
							style={{
								background:
									"linear-gradient(270deg, rgba(0, 0, 0, 0.33) 0%, rgba(0, 0, 0, 0.1) 12.34%, rgba(0, 0, 0, 0) 32.5%)",
							}}
							key={skin.skinId}
						>
							{/* TODO: This image causes layout shift of the label when loading.
                  Change to Astro native images / provide height */}
							<img
								className="w-full"
								src={operatorSplash(skin.portraitId, skin.type)}
								alt={skin.name}
							/>
							<div className="absolute bottom-6 left-6 inline-flex flex-col gap-2">
								{skin.type === "elite-zero" && (
									<EliteZeroIcon
										className="h-12 w-[54px]"
										white={true}
									/>
								)}
								{skin.type === "elite-one-or-two" &&
									skin.name === "Elite 1" && (
										<EliteOneIcon
											className="h-12 w-[54px]"
											white={true}
										/>
									)}
								{skin.type === "elite-one-or-two" &&
									skin.name === "Elite 2" && (
										<EliteTwoIcon
											className="h-12 w-[54px]"
											white={true}
										/>
									)}

								{/* Old code for artists and voice actors. Could still be useful */}

								{/*<div className="inline-flex w-fit gap-2 rounded bg-neutral-800/80 px-2 py-1 text-base leading-normal text-neutral-50 backdrop-blur-[4px]">*/}
								{/*	<span className="text-neutral-200">*/}
								{/*		Artist*/}
								{/*	</span>*/}
								{/*	{skin.displaySkin.drawerList.join(", ")}*/}
								{/*</div>*/}
								{/*<div className="inline-flex w-fit gap-2 rounded bg-neutral-800/80 px-2 py-1 text-base leading-normal text-neutral-50 backdrop-blur-[4px]">*/}
								{/*	<span className="text-neutral-200">VA</span>*/}
								{/*	<ul className="m-0 flex list-none gap-2 p-0">*/}
								{/*		{voices.map((voice) => (*/}
								{/*			<li key={voice.voiceLangType}>*/}
								{/*				{voice.cvName.join(", ")}*/}
								{/*			</li>*/}
								{/*		))}*/}
								{/*	</ul>*/}
								{/*</div>*/}
							</div>

							{skins[selectedIndex].cost &&
								skins[selectedIndex].obtainSources?.includes(
									"Outfit Store"
								) && (
									<div className="absolute bottom-6 right-6">
										<div className="inline-flex w-fit rounded-lg bg-neutral-950 px-2.5 py-1 text-base leading-normal text-neutral-50">
											<span className="mr-2 text-neutral-200">
												Skin Cost
											</span>
											<div className="flex flex-row items-center">
												<span className="mr-1">
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
									</div>
								)}
						</Tab.Panel>
					);
				})}
			</Tab.Panels>
		</Tab.Group>
	);
};
export default CharacterSplash;
