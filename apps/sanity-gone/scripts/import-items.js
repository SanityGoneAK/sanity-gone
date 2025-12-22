import { promises as fs } from "fs";
import path from "path";

import { items as cnItems } from "./data/cn/gamedata/excel/item_table.json";
import { items as enItems } from "./data/en/gamedata/excel/item_table.json";
import { items as jpItems } from "./data/jp/gamedata/excel/item_table.json";
import { items as krItems } from "./data/kr/gamedata/excel/item_table.json";
import { items as twItems } from "./data/tw/gamedata/excel/item_table.json";

const ITEM_LOCALES = {
	zh_CN: cnItems,
	en_US: enItems,
	ja_JP: jpItems,
	ko_KR: krItems,
	zh_TW: twItems,
};

const UNOFFICIAL_ITEM_NAME_TRANSLATIONS = {
};

/**
 * @param {string} itemId
 * @returns {boolean} whether to include this `itemId` in `items.json` or not
 */
function isItemWeCareAbout(itemId) {
	const entry = cnItems[itemId];
	return (
		itemId === "4001" || // LMD
		(entry.classifyType === "MATERIAL" &&
			// !itemId.startsWith("p_char_") && // character-specific potential tokens (we care about these now)
			!itemId.startsWith("tier") && // generic potential tokens
			!itemId.startsWith("voucher_full_")) || // vouchers for event welfare ops like Flamebringer
		entry.itemType === "ACTIVITY_POTENTIAL" // activity potential tokens (U-Official, Vigil, Lessing)
	);
}

/**
 * Creates `{dataDir}/items.json`, a mapping of material `itemId`s to:
 * - `iconId` (needed for determining image paths)
 * - `name` (using unofficial English translations if needed)
 * - `rarity`
 *
 * This is basically a highly stripped down version of `item_table.json`.
 *
 * @param {string} dataDir - output directory
 * @param {"zh_CN" | "en_US" | "ja_JP" | "ko_KR"} locale - output locale
 */
export async function createItemsJson(dataDir, locale) {
	console.log(`Creating ${path.join(dataDir, "items.json")}...`);

	const transformations = [filterItems, getLocalizedNameAndDesc, toEntries];

	const items = transformations.reduce((acc, transformation) => {
		return transformation(acc, locale);
	}, Object.keys(ITEM_LOCALES.zh_CN));

	await fs.writeFile(
		path.join(dataDir, "items.json"),
		JSON.stringify(Object.fromEntries(items), null, 2)
	);
}

function filterItems(items) {
	return items.filter((itemId) => isItemWeCareAbout(itemId));
}

function getLocalizedNameAndDesc(items, locale) {
	return items.map((itemId) => {
		let name = "";
		let description = "";
		let usage = "";

		if (itemId in UNOFFICIAL_ITEM_NAME_TRANSLATIONS) {
			name = UNOFFICIAL_ITEM_NAME_TRANSLATIONS[itemId][locale];
		} else {
			name = ITEM_LOCALES[locale][itemId]
				? ITEM_LOCALES[locale][itemId].name
				: ITEM_LOCALES["zh_CN"][itemId].name;
		}

		description = ITEM_LOCALES[locale][itemId]
			? ITEM_LOCALES[locale][itemId].description
			: ITEM_LOCALES["zh_CN"][itemId].description;

		usage = ITEM_LOCALES[locale][itemId]
			? ITEM_LOCALES[locale][itemId].usage
			: ITEM_LOCALES["zh_CN"][itemId].usage;

		return {
			itemId,
			name,
			description,
			usage,
		};
	});
}

function toEntries(items) {
	return items.map(({ itemId, name, description, usage }) => {
		const item = ITEM_LOCALES.zh_CN[itemId];

		return [
			itemId,
			{
				itemId,
				name,
				iconId: item.iconId,
				description,
				usage,
				rarity: parseInt(item.rarity.replace("TIER_", "")),
			},
		];
	});
}
