import { operatorsStore } from "~/pages/[locale]/guides/_store";
import {useStore} from "@nanostores/react";
import {useMemo} from "react";
import type * as OutputTypes from "~/types/output-types.ts";

import { createContext, useContext } from "react";
import OperatorHeader from "~/components/operator/OperatorHeader.tsx";
import {localeStore} from "~/pages/[locale]/_store.ts";
import type {Locale} from "~/i18n/languages.ts";
import OperatorSkillHeader from "~/components/operator/OperatorSkillHeader.tsx";

type MasteryContextValue = {
    operator: OutputTypes.Operator;
    locale: Locale
};

const MasteryContext = createContext<MasteryContextValue | null>(null);

const useMastery = () => {
    const ctx = useContext(MasteryContext);
    if (!ctx) {
        throw new Error(
            "MasteryRecommendation.Skill must be used inside MasteryRecommendation"
        );
    }
    return ctx;
};



const MasteryRecommendation = ({charId, children}: { charId: string; children?: React.ReactNode; }) => {
    const operators = useStore(operatorsStore);
    const locale = useStore(localeStore);

    const operator = useMemo((): OutputTypes.Operator => {
        return operators[charId as keyof typeof operators] as OutputTypes.Operator;
    }, [operators, charId]);

    if (!operator) return null;

    return (
        <MasteryContext value={{ operator, locale }}>
            <div className="flex flex-col space-y-16 not-prose">
                <div className="col-span-4">
                    <OperatorHeader operator={operator} locale={locale} />
                </div>
                <div className="grid grid-cols-4">
                    <p>Skill</p>
                    <p>Mastery</p>
                    <p>Story</p>
                    <p>Advanced</p>
                </div>
            </div>
            {children}
        </MasteryContext>
    );
};

function skillLevelNumberToMasteryLevel(level: number): string {
    if (level > 7) {
        return `M${level - 7}`;
    }
    return `${level}`;
}

const Skill = ({ index, mastery, story, advanced }: { index: number, mastery: number, story: string, advanced: string }) => {
    const { operator, locale } = useMastery();

    const skill = operator.skillData?.[index];
    if (!skill) return null;

    const level = skill.levels?.[mastery];
    if (!level) return null;

    const levelString = skillLevelNumberToMasteryLevel(mastery)

    return (
        <>
            <OperatorSkillHeader locale={locale} activeSkillLevel={level} activeSkillTableSkill={skill}/>
            <p>{levelString}</p>
            <p>{story}</p>
            <p>{advanced}</p>
        </>
    );
};

MasteryRecommendation.Skill = Skill;
export default MasteryRecommendation