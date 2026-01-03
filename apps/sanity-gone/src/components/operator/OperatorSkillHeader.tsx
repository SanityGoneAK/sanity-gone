import {skillIcon} from "~/utils/images.ts";
import {cx} from "~/utils/styles.ts";
import * as OutputTypes from "~/types/output-types";
import type {SkillLevel} from "~/types/output-types";
import type {Locale} from "~/i18n/languages.ts";
import {useMemo} from "react";
import {useTranslations} from "~/i18n/utils.ts";

export const OperatorSkillHeader = ({activeSkillTableSkill, activeSkillLevel, locale}: {activeSkillTableSkill: OutputTypes.SkillTableSkill, activeSkillLevel: OutputTypes.SkillLevel, locale: Locale}) => {
    const t = useTranslations(locale);
    const typeTitle: Record<keyof typeof OutputTypes.SkillType, string> =
        useMemo(
            () => ({
                PASSIVE: t("operators.details.skills.passive"),
                MANUAL: t("operators.details.skills.manual"),
                AUTO: t("operators.details.skills.auto"),
            }),
            [locale]
        );

    const spRecoveryTitle: Record<
        keyof typeof OutputTypes.SkillSpType,
        string
    > = useMemo(
        () => ({
            INCREASE_WHEN_ATTACK: t(
                "operators.details.skills.increase_when_attack"
            ),
            INCREASE_WHEN_TAKEN_DAMAGE: t(
                "operators.details.skills.increase_when_taken_damage"
            ),
            INCREASE_WITH_TIME: t(
                "operators.details.skills.increase_with_time"
            ),
            8: t("operators.details.skills.always_active"),
            UNUSED: "",
        }),
        [locale]
    );

    return <div
        className="grid grid-flow-col grid-cols-[48px_1fr] items-center gap-x-4 gap-y-2 [grid-template-areas:'icon_name''skilltype_skilltype'] sm:[grid-template-areas:'icon_name''icon_skilltype']">
        <img
            className="h-12 w-12 rounded [grid-area:icon]"
            src={skillIcon(
                activeSkillTableSkill.iconId,
                activeSkillTableSkill.skillId
            )}
            alt={activeSkillLevel.name}
        />
        <h2 className="font-serif text-lg font-semibold leading-6 [grid-area:name]">
            {activeSkillLevel.name}
        </h2>
        <dl className="grid h-6 grid-flow-col items-center justify-start gap-x-2 [grid-area:skilltype] sm:col-span-1 sm:gap-x-3">
						<span className="text-base leading-none text-neutral-50">
							{typeTitle[activeSkillLevel.skillType]}
						</span>

            {/* TODO This is an InterpunctSpacer. Maybe consider making it a .tsx component so it can be used everywhere?*/}
            <span
                className={`inline-block h-1 w-1 rounded-full bg-neutral-400`}
            ></span>

            <span
                className={cx(
                    "text-base leading-none",
                    spRecoveryClassName[
                        activeSkillLevel.spData.spType
                        ]
                )}
            >
							{/* space here is only needed if it's in English */}
                {spRecoveryTitle[activeSkillLevel.spData.spType] +
                    (locale === "en" ? " " : "")}
                {t("operators.details.skills.recovery")}
						</span>
        </dl>
    </div>
}

const spRecoveryClassName: Record<
    keyof typeof OutputTypes.SkillSpType,
    string
> = {
    INCREASE_WHEN_ATTACK: "text-orange",
    INCREASE_WHEN_TAKEN_DAMAGE: "text-yellow",
    INCREASE_WITH_TIME: "text-green",
    8: "text-blue",
    UNUSED: "",
};



export default OperatorSkillHeader;