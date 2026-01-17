import {operatorsStore} from "~/pages/[locale]/guides/_store";
import {useStore} from "@nanostores/react";
import React, {useMemo, useState} from "react";
import type * as OutputTypes from "~/types/output-types.ts";

import OperatorHeader from "~/components/operator/OperatorHeader.tsx";
import {localeStore} from "~/pages/[locale]/_store.ts";
import type {Locale} from "~/i18n/languages.ts";
import OperatorSkillHeader from "~/components/operator/OperatorSkillHeader.tsx";
import {cx} from "~/utils/styles.ts";
import ModuleInfo from "~/components/operator/ModuleInfo.tsx";
import PillButtonGroup from "~/components/ui/ButtonGroup.tsx";
import PotentialsDropdown from "~/components/operator/PotentialsDropdown.tsx";
import {useTranslations} from "~/i18n/utils.ts";
import {Collapsible} from "@base-ui/react/collapsible";
import ChevronIcon from "~/components/icons/ChevronIcon.tsx";
import {moduleTypeImage} from "~/utils/images.ts";


interface ModuleRecommendation {
    charId: string
    moduleType: string;
    recommended: boolean|"maybe";
    recommendedLevel?: number;
}

const ModuleRecommendation = ({charId, moduleType, recommended, recommendedLevel}: ModuleRecommendation) => {
    const operators = useStore(operatorsStore);
    const locale = useStore(localeStore);

    const operator = useMemo((): OutputTypes.Operator => {
        return operators[charId as keyof typeof operators] as OutputTypes.Operator;
    }, [operators, charId]);

    if (!operator) return null;

    const module = operator.modules.find(
        (mod) => mod.moduleIcon.split('-')[1].toLowerCase() === moduleType.toLowerCase()
    )

    if (!module) return null;

    const [stage, setStage] = useState(recommendedLevel ?? 3);
    const [potential, setPotential] = useState(0);

    const t = useTranslations(locale);

    const potentialsInUse = useMemo(() => {
        const potentials: number[][] = [];
        const phases = module.phases;
        for (let i = 0; i < phases.length; i++) {
            const curPotentialList: number[] = [];
            for (let curPot = 0; curPot <= 5; curPot++) {
                if (
                    phases[i].candidates.find(
                        (obj) => obj.requiredPotentialRank === curPot
                    )
                ) {
                    curPotentialList.push(curPot);
                }
            }
            potentials.push(curPotentialList);
        }

        return potentials;
    }, [module])

    const setStageSafely = (stage: number) => {
        // undefined error will occur if we try to switch to a stage which a
        // potential doesn't affect
        if (
            module.moduleId &&
            !potentialsInUse[stage - 1].includes(
                potential
            )
        ) {
            setPotential(potentialsInUse[stage - 1][0]);
        }
        setStage(stage);
    };

    return (
        <div className="flex flex-col not-prose rounded overflow-hidden not-prose leading-[1.5]">
            <OperatorHeader operator={operator} locale={locale}/>

            <div className="pt-4 bg-neutral-600/[.66] space-y-3">
                <div className="px-4 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <img
                            className="h-6"
                            src={moduleTypeImage(module.moduleIcon.toLowerCase())}
                            alt=""
                        />
                        <h2 className="font-serif text-lg font-semibold leading-none">
                            {module.moduleName}
                        </h2>
                        <p className="font-semibold text-neutral-200">
                            {module.moduleIcon}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 mt-2 md:mt-0">
                        <div className="grid grid-cols-[1fr_auto] md:grid-cols-[auto_1fr] items-center gap-2">
                            <h3 className="text-neutral-200 text-lg">Rating</h3>
                            {recommended === true && <p className="text-lg font-semibold">Yes</p>}
                            {recommended === 'maybe' && <p className="text-lg font-semibold">Maybe</p>}
                            {!recommended && <p className="text-lg font-semibold">Not Recommended</p>}
                        </div>
                        {(recommended && recommendedLevel) && <div className="grid grid-cols-[1fr_auto] items-center gap-2 md:ml-3">
                            <h3 className="text-neutral-200 text-lg">Recommended Level</h3>
                            <p className="text-lg font-semibold">Level {recommendedLevel}</p>
                        </div>}
                    </div>
                </div>


                <Collapsible.Root
                    defaultOpen={false}
                >
                    <Collapsible.Trigger
                        className="
                          group flex w-full items-center gap-2
                          justify-center
                          px-4 py-3
                          text-sm font-semibold uppercase tracking-wide
                          text-neutral-200
                          hover:bg-neutral-700
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-neutral-600
                        "
                    >
                        <ChevronIcon className="size-3 transition-transform rotate-90 group-data-[panel-open]:-rotate-90"/>
                        View Module Details
                    </Collapsible.Trigger>

                    <Collapsible.Panel
                        className="
                            px-6 pb-4 mt-3
                            overflow-hidden
                            transition-all duration-150 ease-out
                            h-(--collapsible-panel-height)
                            data-[starting-style]:h-0
                            data-[ending-style]:h-0
                        "
                    >

                        <div className="flex items-center gap-2 mb-4">
                            <div className="grid grid-flow-col items-center gap-x-2 text-neutral-200">
                                {t("operators.details.modules.stage")}
                                <PillButtonGroup
                                    labels={[1, 2, 3]}
                                    value={stage}
                                    onChange={setStageSafely}
                                />
                            </div>
                            <div className="ml-auto">
                                <PotentialsDropdown
                                    potentialsToShow={
                                        module.moduleId
                                            ? potentialsInUse[
                                            stage - 1
                                                ]
                                            : [0]
                                    }
                                    currentPotential={potential}
                                    onChange={setPotential}
                                />
                            </div>
                        </div>
                        <ModuleInfo operator={operator} module={module} stage={stage} potential={potential} withTitle={false} />
                    </Collapsible.Panel>
                </Collapsible.Root>
            </div>
        </div>
    )
        ;
}

export default ModuleRecommendation;