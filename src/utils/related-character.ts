import operatorsJson from "../../data/en_US/operators.json";

import type { Operator } from "../types/output-types";

export const getRelatedCharacter = (operator: Operator): Operator | null => {
	if (operator.alterId) {
		return operatorsJson[
			operator.alterId as keyof typeof operatorsJson
		] as Operator;
	}

	if (operator.baseOperatorId) {
		return operatorsJson[
			operator.baseOperatorId as keyof typeof operatorsJson
		] as Operator;
	}

	if (operator.charId == "char_002_amiya") {
		return operatorsJson[
			"char_1001_amiya2" as keyof typeof operatorsJson
		] as Operator;
	}

	if (operator.charId == "char_1001_amiya2") {
		return operatorsJson[
			"char_002_amiya" as keyof typeof operatorsJson
		] as Operator;
	}

	return null;
};
