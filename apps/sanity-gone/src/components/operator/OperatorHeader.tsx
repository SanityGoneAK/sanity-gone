import React, {useMemo} from "react";

import StarIcon from "../icons/StarIcon";
import OperatorBranchAndTrait from "./OperatorBranchAndTrait";
import OperatorBothTooltip from "~/components/operator/OperatorBothTooltip";
import {operatorClassIcon, operatorAvatar} from "~/utils/images";
import {professionToClass, classToProfession} from "~/utils/classes";
import {getMeleeOrRangedOrBoth} from "~/utils/character-stats";
import {cx} from "~/utils/styles";

import type * as OutputTypes from "~/types/output-types";

import MeleeIcon from "~/components/icons/MeleeIcon";
import RangedIcon from "~/components/icons/RangedIcon";
import MeleeAndRangedIcon from "~/components/icons/MeleeAndRangedIcon";

import {defaultLang, type Locale} from "~/i18n/languages";
import {useTranslations} from "~/i18n/utils";
import type {ui} from "~/i18n/ui.ts";

interface Props {
    operator: OutputTypes.Operator;
    locale?: Locale;
}

export const OperatorHeader: React.FC<Props> = ({operator, locale = defaultLang}) => {
    const [baseName, alterName] = operator.name.split(/ the /i);
    const operatorClass = professionToClass(operator.profession);
    const rarity = operator.rarity as 1 | 2 | 3 | 4 | 5 | 6;

    const t = useTranslations(locale);

    const meleeOrRanged = useMemo(
        () =>
            getMeleeOrRangedOrBoth(
                operator.position,
                operator.description,
            ),
        [operator.position, operator.description],
    );

    const meleeOrRangedString = t(
        `operators.details.general.${meleeOrRanged}` as keyof (typeof ui)[typeof defaultLang],
    );

    return (
        <div className="grid grid-rows-[auto_auto] gap-y-4 bg-neutral-600/[.66] sm:rounded-t">
            {/* Rarity bar */}
            <div
                className={cx(
                    "flex items-center w-full gap-1 px-5 h-6 sm:rounded-t",
                    {
                        6: "bg-orange/[.08]",
                        5: "bg-yellow/[.08]",
                        4: "bg-purple/[.08]",
                        3: "bg-blue/[.08]",
                        2: "bg-green/[.08]",
                        1: "bg-neutral-50/[.08]",
                    }[rarity],
                )}
            >
                <span className="visually-hidden">
                    {t("operators.index.filters.rarity")}: {rarity}
                </span>

                <span className="grid grid-flow-col">
                    {Array.from({length: rarity}).map((_, i) => (
                        <StarIcon key={i} className="h-3" rarity={rarity}/>
                    ))}
                </span>

                {operator.isLimited ? (
                    <span
                        className={cx(
                            "relative inline-block leading-normal font-black italic bg-clip-text text-transparent uppercase",
                            {
                                6: "bg-orange",
                                5: "bg-yellow",
                                4: "bg-purple",
                                3: "bg-blue",
                                2: "bg-green",
                                1: "bg-neutral-50",
                            }[rarity],
                        )}
                        style={{lineHeight: "12px"}}
                    >
                        {t("operators.details.general.limited")}
                    </span>
                ) : ''}
            </div>

            {/* Main content */}
            <div
                className="px-5 grid [grid-template-areas:'icon_name''classes_classes'] sm:[grid-template-areas:'icon_name''icon_classes'] gap-x-4 gap-y-3 sm:gap-y-2 w-full items-center grid-cols-[72px_1fr]">
                {/* Avatar */}
                <a href={`/${locale}/operators/${operator.slug}`} className="w-18 h-18 [grid-area:icon]">
                    <img
                        className="rounded"
                        src={operatorAvatar(operator.charId, 0)}
                        alt={operator.name}
                        width={72}
                        height={72}
                    />
                </a>

                {/* Name */}
                <a  href={`/${locale}/operators/${operator.slug}`} className="[grid-area:name]">
                    <h1 className="font-serif text-[36px] leading-10 font-bold">
                        {baseName}
                        {alterName && (<span className="text-neutral-200 font-normal">{" "}The {alterName}</span>)}
                    </h1>
                </a>

                {/* Classes / Position */}
                <div className="flex flex-row items-center gap-x-2 sm:gap-x-3 text-sm sm:text-base [grid-area:classes]">
                    <div className="grid grid-flow-col items-center gap-x-2">
                        <img
                            width={20}
                            height={20}
                            className="object-contain"
                            src={operatorClassIcon(
                                classToProfession(operatorClass).toLowerCase(),
                            )}
                            alt=""
                        />
                        <span>
                            {t(`operators.${operatorClass.toLowerCase()}` as keyof (typeof ui)[typeof defaultLang])}
                        </span>
                    </div>

                    <OperatorBranchAndTrait operator={operator}/>

                    <div className="flex-grow"/>

                    <div className="flex flex-row items-center gap-2">
                        {meleeOrRanged === "melee" && <MeleeIcon/>}
                        {meleeOrRanged === "ranged" && <RangedIcon/>}
                        {meleeOrRanged === "melee_and_ranged" && (
                            <MeleeAndRangedIcon/>
                        )}

                        <span className="text-neutral-200 hidden sm:inline">{meleeOrRangedString}</span>

                        <span className="text-neutral-200 sm:hidden">
                            {meleeOrRanged === "melee_and_ranged" && locale === "en" ? (
                                <OperatorBothTooltip/>
                            ) : (
                                meleeOrRangedString
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperatorHeader;
