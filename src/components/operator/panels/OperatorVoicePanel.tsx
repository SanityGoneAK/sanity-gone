import { useStore } from "@nanostores/react";
import { useMemo, useState } from "react";
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
import {
  MediaController,
  MediaControlBar,
  MediaPlayButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange, MediaMuteButton
} from "media-chrome/react";
import PlayIcon from "~/components/icons/PlayIcon.tsx";
import PauseIcon from "~/components/icons/PauseIcon.tsx";

const OperatorVoicePanel: React.FC = () => {
	const locale = useStore(localeStore);
	const t = useTranslations(locale);
	const operator = useStore(operatorStore);

	const [skinId, setSkinId] = useState(operator.charId);
	const voiceDict = useMemo(() => {
		return operator.voices[skinId];
	}, [skinId]);
	const [currentVoiceLanguage, setCurrentVoiceLanguage] =
		useState("CN_MANDARIN");
	const voiceLines = useMemo(() => {
		return operator.voiceLines[skinId];
	}, [skinId, currentVoiceLanguage]);

	return (
		<div className="flex flex-col gap-4 p-6">
			<div className="inline w-fit rounded border-b border-neutral-600 bg-neutral-800/80 pb-4 backdrop-blur-[4px]">
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
									<span className={cx("text-neutral-200", {
										"text-neutral-50":
											currentVoiceLanguage ===
											voice.voiceLangType,
									})}>{voice.voiceLangType}</span>
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
							<MediaController className="bg-neutral-600 h-16 rounded-lg overflow-hidden" audio>
								<audio
									slot="media"
									src={operatorVoiceLine(
										voiceLanguagesToLocaleKey[
											currentVoiceLanguage as keyof typeof voiceLanguagesToLocaleKey
										],
										line.voiceAsset
									)}
								/>
								<MediaControlBar className="w-full h-full bg-neutral-600 px-4 ">
                  <MediaPlayButton className="bg-neutral-600">
                    <span slot="play"><PlayIcon/></span>
                    <span slot="pause"><PauseIcon/></span>
                  </MediaPlayButton>
									<MediaTimeDisplay showDuration className="bg-neutral-600"/>
									<MediaTimeRange className="bg-neutral-600">
										<span slot="thumb" className="ml-1 h-2 w-6 p-3 box-content absolute grid my-0 mx-[-12px] rounded-xl outline-offset-[-12px] after:rounded-sm after:bg-neutral-200 hover:outline hover:outline-[12px] hover:outline-neutral-50/[0.05]"></span>
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
