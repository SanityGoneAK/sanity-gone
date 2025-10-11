import * as OutputTypes from "~/types/output-types";

export function isOperator(
	char: OutputTypes.Character
): char is OutputTypes.Operator {
	return (char as OutputTypes.Operator).summons != null;
}

export function isSummon(
	char: OutputTypes.Character
): char is OutputTypes.Summon {
	return "operatorId" in char;
}
