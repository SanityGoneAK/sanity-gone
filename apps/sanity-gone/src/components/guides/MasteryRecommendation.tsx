import { operatorsStore } from "~/pages/[locale]/guides/_store";
import {useStore} from "@nanostores/react";
import {useMemo} from "react";
import type * as OutputTypes from "~/types/output-types.ts";

import OperatorHeader from "~/components/operator/OperatorHeader.tsx";
import {localeStore} from "~/pages/[locale]/_store.ts";
import type {Locale} from "~/i18n/languages.ts";
import OperatorSkillHeader from "~/components/operator/OperatorSkillHeader.tsx";
import {cx} from "~/utils/styles.ts";

type SkillConfig = {
    index: number;
    mastery: number;
    story: string;
    advanced: string;
};
interface MasteryRecommendation {
    charId: string
    skills: SkillConfig[];
}

const MasteryRecommendation = ({charId, skills}: MasteryRecommendation) => {
    const operators = useStore(operatorsStore);
    const locale = useStore(localeStore);

    const operator = useMemo((): OutputTypes.Operator => {
        return operators[charId as keyof typeof operators] as OutputTypes.Operator;
    }, [operators, charId]);

    if (!operator) return null;

    return (
        <div className="flex flex-col not-prose rounded overflow-hidden">
            <div className="col-span-4">
                <OperatorHeader operator={operator} locale={locale} />
            </div>
            <div className="pt-4 bg-neutral-600/[.66] space-y-3 pb-4">
                <div className="px-1 lg:px-6 grid lg:grid-cols-[1fr_repeat(3,100px)]">
                    <p className="hidden lg:inline text-neutral-200 text-lg">Skill</p>
                    <p className="hidden lg:inline text-neutral-200 text-lg text-center">Mastery</p>
                    <p className="hidden lg:inline text-neutral-200 text-lg text-center">Story</p>
                    <p className="hidden lg:inline text-neutral-200 text-lg text-center">Advanced</p>
                </div>
                <div className="divide-y-2 space-y-4 divide-neutral-200/20">
                {skills.map((skill, idx) => (
                    <Skill key={idx} operator={operator} locale={locale} {...skill} />
                ))}
                </div>
            </div>
        </div>
    );
};

function skillLevelNumberToMasteryLevel(level: number): string {
    if (level > 7) {
        return `M${level - 7}`;
    }
    return `${level}`;
}

interface MasteryRecommendationSkillProps {
    operator: OutputTypes.Operator
    locale: Locale,
    index: number,
    mastery: number,
    story: string,
    advanced: string
    breakpoint?: boolean
}

const Skill = ({ operator, locale, index, mastery, story, advanced, breakpoint = false }: MasteryRecommendationSkillProps) => {
    const skill = operator.skillData?.[index];
    if (!skill) return null;

    const level = skill.levels?.[mastery];
    if (!level) return null;

    const levelString = skillLevelNumberToMasteryLevel(mastery+1)

    return (
        <div className="px-5 lg:px-6 lg:grid lg:grid-cols-[1fr_300px] pb-2">
            <div className="mb-3">
                <OperatorSkillHeader locale={locale} activeSkillLevel={level} activeSkillTableSkill={skill}/>
            </div>
            <div className="grid grid-cols-[repeat(3,1fr)] lg:hidden">
                <p className="inline lg:hidden text-neutral-200 text-lg text-center">Mastery</p>
                <p className="inline lg:hidden text-neutral-200 text-lg text-center">Story</p>
                <p className="inline lg:hidden text-neutral-200 text-lg text-center">Advanced</p>
            </div>
            <div className="grid grid-cols-[repeat(3,1fr)] lg:grid-cols-[repeat(3,100px)]">
                <p className={cx("row-span-2 text-center text-xl place-content-center")}>S{index+1}{levelString}</p>
                {breakpoint && <p className="col-span-2 col-start-2 text-center text-xl place-content-center font-bold italic">Breakpoint</p>}
                <p className={cx("col-start-2 text-center text-xl place-content-center", {"row-span-2": breakpoint == false})}>{story}</p>
                <p className={cx("col-start-3 text-center text-xl place-content-center", {"row-span-2": breakpoint == false})}>{advanced}</p>
            </div>
        </div>
    );
};

MasteryRecommendation.Skill = Skill;
export default MasteryRecommendation