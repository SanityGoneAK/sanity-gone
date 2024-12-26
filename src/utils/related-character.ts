import operatorsJson from "../../data/en_US/operators.json";

import type { Operator } from "../types/output-types";

export const getRelatedCharacter = (operator: Operator): Operator[] => {
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
