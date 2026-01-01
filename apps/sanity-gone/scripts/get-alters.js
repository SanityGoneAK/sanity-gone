import cnCharacterTable from "./data/arknights-gamedata/cn/gamedata/excel/character_table.json";
import { spCharGroups } from "./data/arknights-gamedata/cn/gamedata/excel/char_meta_table.json"

const alterNameRegex = /(\S+)\s+the\s+/i;

/**
 * Returns a mapping of base operator ID to its alter ID (if it exists),
 * as well as a reverse mapping of alter ID to its base operator ID.
 *
 * Note that Amiya (Caster) / Amiya (Guard) are *not* considered a
 * base operator / alter pairing.
 *
 * @returns {{
 * 	baseOpIdToAlterId: { [baseOpId: string]: string },
 *  alterIdToBaseOpId: { [alterId: string]: string },
 * }}
 */
export function getAlterMapping() {
	const nameToId = {};
	const nameToAlters = {};
	const operators = Object.entries(cnCharacterTable).filter(
		([_, char]) => char.profession !== "TOKEN" && char.profession !== "TRAP"
	);
	operators.forEach(([opId, op]) => {
		if (!spCharGroups[opId]) {
			const result = Object.entries(spCharGroups).find(
				([, alterIdsList]) => alterIdsList.includes(opId),
			);
			const original = operators.find(([originalOperatorId, _]) => originalOperatorId === result[0]);
			nameToAlters[original[1].appellation] = opId;
		}

		nameToId[op.appellation] = opId;
	});

	const baseOpIdToAlterId = Object.fromEntries(
		Object.entries(nameToAlters).map(([baseOpName, alterIds]) => {
			return [nameToId[baseOpName], alterIds];
		})
	);

	const alterIdToBaseOpId = Object.fromEntries(
		Object.entries(baseOpIdToAlterId).map(([k, v]) => [v, k])
	);

	return { baseOpIdToAlterId, alterIdToBaseOpId };
}