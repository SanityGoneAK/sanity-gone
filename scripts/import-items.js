import { promises as fs } from "fs";
import path from "path";

import { items as cnItems } from "./ArknightsGameData/zh_CN/gamedata/excel/item_table.json";
import { items as enItems } from "./ArknightsGameData_YoStar/en_US/gamedata/excel/item_table.json";
import { items as jpItems } from "./ArknightsGameData_YoStar/ja_JP/gamedata/excel/item_table.json";
import { items as krItems } from "./ArknightsGameData_YoStar/ko_KR/gamedata/excel/item_table.json";

const ITEM_LOCALES = {
	zh_CN: cnItems,
	en_US: enItems,
	ja_JP: jpItems,
	ko_KR: krItems,
};

const UNOFFICIAL_ITEM_NAME_TRANSLATIONS = {
	31073: {
		zh_CN: "褐素纤维",
		en_US: "Brown Fiber",
		ja_JP: "茶色繊維",
		ko_KR: "갈색 섬유",
	},
	31074: {
		zh_CN: "固化纤维板",
		en_US: "Cured Fiberboard",
		ja_JP: "硬化ファイバーボード",
		ko_KR: "경화 섬유보드",
	},
	31083: {
		zh_CN: "环烃聚质",
		en_US: "Cycloalkane Polymer",
		ja_JP: "シクロアルカンポリマー",
		ko_KR: "졸로알케인 고분자",
	},
	31084: {
		zh_CN: "环烃预制体",
		en_US: "Cycloalkane Prefab",
		ja_JP: "シクロアルカンプリファブ",
		ko_KR: "졸로알케인 프리팹",
	},
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
			!itemId.startsWith("p_char_") && // character-specific potential tokens
			!itemId.startsWith("tier") && // generic potential tokens
			!itemId.startsWith("voucher_full_")) // vouchers for event welfare ops like Flamebringer
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

	const transformations = [filterItems, getLocalizedName, toEntries];

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

function getLocalizedName(items, locale) {
	return items.map((itemId) => {
		let name = "";

		if (itemId in UNOFFICIAL_ITEM_NAME_TRANSLATIONS) {
			name = UNOFFICIAL_ITEM_NAME_TRANSLATIONS[itemId][locale];
		}

		if (ITEM_LOCALES[locale][itemId]) {
			name = ITEM_LOCALES[locale][itemId]
				? ITEM_LOCALES[locale][itemId].name
				: ITEM_LOCALES["zh_CN"][itemId];
		}

		return {
			itemId,
			name,
		};
	});
}

function toEntries(items) {
	return items.map(({ itemId, name }) => {
		const item = ITEM_LOCALES.zh_CN[itemId];

		return [
			itemId,
			{
				itemId,
				name,
				iconId: item.iconId,
				rarity: parseInt(item.rarity.replace("TIER_", "")),
			},
		];
	});
}
