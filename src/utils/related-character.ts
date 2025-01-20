import enOperatorsJson from "../../data/en_US/operators-index.json";
import cnOperatorsJson from "../../data/zh_CN/operators-index.json";
import jpOperatorsJson from "../../data/ja_JP/operators-index.json";
import krOperatorsJson from "../../data/ko_KR/operators-index.json";

import type { Operator } from "../types/output-types";
import type { Locale } from "~/i18n/languages.ts";

const operatorsMap = {
	en: enOperatorsJson,
	jp: jpOperatorsJson,
	kr: krOperatorsJson,
	'zh-cn': cnOperatorsJson,
}

export const getRelatedCharacter = (operator: Operator, locale: Locale): Operator[] => {
	const operatorsJson = operatorsMap[locale];
	const operators = [];
	if (operator.alterId) {
		operators.push(
			operatorsJson[
				operator.alterId as keyof typeof operatorsJson
			] as Operator
		);
	}

	if (operator.baseOperatorId) {
		operators.push(
			operatorsJson[
				operator.baseOperatorId as keyof typeof operatorsJson
			] as Operator
		);
	}

	if (operator.charId == "char_002_amiya") {
		operators.push(
			operatorsJson[
				"char_1001_amiya2" as keyof typeof operatorsJson
			] as Operator
		);

		operators.push(
			operatorsJson[
				"char_1037_amiya3" as keyof typeof operatorsJson
			] as Operator
		);
	}

	if (operator.charId == "char_1001_amiya2") {
		operators.push(
			operatorsJson[
				"char_002_amiya" as keyof typeof operatorsJson
			] as Operator
		);
		operators.push(
			operatorsJson[
				"char_1037_amiya3" as keyof typeof operatorsJson
			] as Operator
		);
	}

	if (operator.charId == "char_1037_amiya3") {
		operators.push(
			operatorsJson[
				"char_002_amiya" as keyof typeof operatorsJson
			] as Operator
		);
		operators.push(
			operatorsJson[
				"char_1001_amiya2" as keyof typeof operatorsJson
			] as Operator
		);
	}

	return operators;
};
