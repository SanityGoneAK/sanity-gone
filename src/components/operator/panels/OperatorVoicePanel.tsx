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

const OperatorVoicePanel: React.FC = () => {
    const locale = useStore(localeStore);
    const t = useTranslations(locale);
    const operator = useStore(operatorStore);

    const [skinId, setSkinId] = useState(operator.charId);
    const voiceDict = useMemo(() => {
      return operator.voices[skinId]
    }, [skinId])
    const [currentVoiceLanguage, setCurrentVoiceLanguage] = useState("CN_MANDARIN");
    const voiceLines = useMemo(() => {
        return operator.voiceLines[skinId];
    }, [skinId, currentVoiceLanguage]);

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="inline w-fit rounded bg-neutral-800/80 backdrop-blur-[4px] border-b border-neutral-600 pb-4">
                <ul className="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-base leading-normal text-neutral-50">
                    {Object.values(voiceDict).map((voice) => (
                        <li key={voice.voiceLangType}>
                            <Tooltip content={voice.voiceLangType}>
                                <button
                                  className={cx("bg-neutral-500 px-2 py-0.5 rounded flex items-center gap-1", {"bg-neutral-300": currentVoiceLanguage === voice.voiceLangType})}
                                  onClick={() => {setCurrentVoiceLanguage(voice.voiceLangType)}}
                                >
                                    <img
                                        className="w-5"
                                        src={`/flags/${voice.voiceLangType}.png`}
                                        alt={voice.voiceLangType}
                                    />
                                    <span>{voice.voiceLangType}</span>
                                    <span className="font-semibold">{voice.cvName.join(", ")}</span>
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
                            <audio controls>
                                <source
                                    src={operatorVoiceLine(
                                        voiceLanguagesToLocaleKey[
                                        currentVoiceLanguage as keyof typeof voiceLanguagesToLocaleKey
                                        ],
                                        line.voiceAsset
                                    )}
                                ></source>
                            </audio>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OperatorVoicePanel;
