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
 */
export async function createItemsJson(dataDir) {
    console.log(`Creating ${path.join(dataDir, "items.json")}...`);

    const transformations = [
        filterItems,
        getLocalizedName,
        toEntries,
    ];

    const items = transformations.reduce((acc, transformation) => {
        return transformation(acc);
    }, Object.keys(ITEM_LOCALES.zh_CN));

    await fs.writeFile(
        path.join(dataDir, "items.json"),
        JSON.stringify(Object.fromEntries(items), null, 2)
    );
}

function filterItems(items) {
    return items.filter((itemId) => isItemWeCareAbout(itemId));
}

function getLocalizedName(items) {
    return items.map((itemId) => {
        const name = Object.keys(ITEM_LOCALES).reduce((locales, locale) => {
            if (ITEM_LOCALES[locale][itemId]) {
                locales[locale] = ITEM_LOCALES[locale][itemId].name ?? "";
                return locales;
            }

            console.warn("No translation available for item ID: " + itemId);
        }, {});

        return {
            itemId,
            name,
        }
    });
}

function toEntries(items) {
    return items.map(({itemId, name}) => {
        const item = ITEM_LOCALES.zh_CN[itemId];

        return [
            itemId,
            {
                itemId,
                name,
                iconId: item.iconId,
                rarity: parseInt(item.rarity.replace('TIER_', '')),
            }
        ]
    })
}