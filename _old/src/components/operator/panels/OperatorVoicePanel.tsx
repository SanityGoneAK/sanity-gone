import { useMemo, useState } from "react";

import { Tab } from "@headlessui/react";
import { useStore } from "@nanostores/react";
import {
	MediaController,
	MediaControlBar,
	MediaPlayButton,
	MediaTimeDisplay,
	MediaTimeRange,
	MediaVolumeRange,
	MediaMuteButton,
} from "media-chrome/react";
import PillButtonGroup from "~/components/ui/ButtonGroup";

import Tooltip from "~/components/ui/Tooltip.tsx";
import {
	allLanguages,
	getLocaleFromLanguage,
	voiceLanguagesToLocaleKey,
	type Locale,
} from "~/i18n/languages";
import { useTranslations } from "~/i18n/utils";
import { localeStore } from "~/pages/[locale]/_store";
import { operatorStore } from "~/pages/[locale]/operators/_slugstore";
import { operatorVoiceLine } from "~/utils/audio";
import { cx } from "~/utils/styles.ts";
import PlayIcon from "~/components/icons/PlayIcon.tsx";
import PauseIcon from "~/components/icons/PauseIcon.tsx";

import { operatorSplashAvatar } from "~/utils/images.ts";

const OperatorVoicePanel: React.FC = () => {
	const locale = useStore(localeStore);
	const t = useTranslations(locale);
	const operator = useStore(operatorStore);

	const [voiceId, setVoiceId] = useState(operator.charId);
	const skins = useMemo(() => {
		return operator.skins.filter(
			(skin) => skin.voiceId !== null || skin.name === "Elite 2"
		);
	}, [voiceId]);
	const voiceDict = useMemo(() => {
		return operator.voices[voiceId];
	}, [voiceId]);
	const [currentVoiceLanguage, setCurrentVoiceLanguage] = useState(
		Object.keys(operator.voiceLines[voiceId])[0]
	);
	const voiceLines = useMemo(() => {
		return operator.voiceLines[voiceId][currentVoiceLanguage];
	}, [voiceId, currentVoiceLanguage]);

	return (
		<div className="flex flex-col gap-4 p-6">
			{skins.length > 1 && (
				<div className="z-10 flex overflow-hidden rounded">
					{skins.map((skin) => {
						return (
							<div
								id={`${skin.skinId}-button`}
								className={cx(
									"relative m-0 flex h-16 w-16 cursor-pointer justify-center overflow-hidden border-none bg-neutral-500 object-cover p-0 opacity-[33%]",
									"outline-none [html[data-focus-source=key]_&:focus-visible]:-outline-offset-2 [html[data-focus-source=key]_&:focus-visible]:outline-blue-light",
									"last:rounded-br-lg sm:last:rounded-br-none",
									skin.voiceId === voiceId ||
										(skin.name === "Elite 2" &&
											voiceId === operator.charId)
										? `bg-neutral-50 !opacity-100` //  after:absolute after:bottom-0 after:w-full after:bg-neutral-50 sm:bg-neutral-500 sm:after:h-1
										: ""
								)}
								key={skin.skinId}
								onClick={() => {
									setVoiceId(
										skin.name === "Elite 2"
											? operator.charId
											: (skin.voiceId ?? operator.charId)
									);
								}}
							>
								<img
									className="relative h-16 w-16 object-cover"
									src={operatorSplashAvatar(skin.avatarId)}
									alt={skin.name}
								/>
							</div>
						);
					})}
				</div>
			)}
			<div className="inline w-full rounded border-b border-neutral-600 bg-neutral-800/80 pb-4 backdrop-blur-[4px]">
				<ul className="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-base leading-normal text-neutral-50">
					{Object.values(voiceDict).map((voice) => (
						<li key={voice.voiceLangType}>
							<Tooltip content={voice.voiceLangType}>
								<button
									className={cx(
										"flex items-center gap-1 rounded bg-neutral-500 px-2 py-0.5",
										{
											"bg-neutral-300":
												currentVoiceLanguage ===
												voice.voiceLangType,
										}
									)}
									onClick={() => {
										setCurrentVoiceLanguage(
											voice.voiceLangType
										);
									}}
								>
									<img
										className="w-5"
										src={`/flags/${voice.voiceLangType}.png`}
										alt={voice.voiceLangType}
									/>
									<span
										className={cx("text-neutral-200", {
											"text-neutral-50":
												currentVoiceLanguage ===
												voice.voiceLangType,
										})}
									>
										{voice.voiceLangType}
									</span>
									<span className="font-semibold">
										{voice.cvName.join(", ")}
									</span>
								</button>
							</Tooltip>
						</li>
					))}
				</ul>
			</div>
			<div className="flex flex-col gap-4">
				{voiceLines.map((line) => {
					return (
						<div
							key={line.charWordId + "_" + currentVoiceLanguage}
							className="flex flex-col gap-2 border-b border-neutral-600 pb-4"
						>
							<h2 className="font-serif text-2xl font-semibold">
								{line.voiceTitle}
							</h2>
							<p>{line.voiceText}</p>
							<MediaController
								className="h-16 overflow-hidden rounded-lg bg-neutral-600"
								audio
							>
								<audio slot="media">
									{operatorVoiceLine(
										voiceLanguagesToLocaleKey[
											currentVoiceLanguage as keyof typeof voiceLanguagesToLocaleKey
										],
										line.voiceAsset
									).map((url, voiceLineIndex) => {
										return (
											<source
												src={url}
												key={`${line.voiceId}-${voiceLineIndex}`}
											></source>
										);
									})}
								</audio>
								<MediaControlBar className="h-full w-full bg-neutral-600 px-4">
									<MediaPlayButton className="bg-neutral-600">
										<span slot="play">
											<PlayIcon />
										</span>
										<span slot="pause">
											<PauseIcon />
										</span>
									</MediaPlayButton>
									<MediaTimeDisplay
										showDuration
										className="bg-neutral-600"
									/>
									<MediaTimeRange className="bg-neutral-600">
										<span
											slot="thumb"
											className="absolute mx-[-12px] my-0 ml-1 box-content grid h-2 w-6 rounded-xl p-3 outline-offset-[-12px] after:rounded-sm after:bg-neutral-200 hover:outline hover:outline-[12px] hover:outline-neutral-50/[0.05]"
										></span>
									</MediaTimeRange>
									<MediaMuteButton className="bg-neutral-600" />
									<MediaVolumeRange className="bg-neutral-600" />
								</MediaControlBar>
							</MediaController>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default OperatorVoicePanel;
