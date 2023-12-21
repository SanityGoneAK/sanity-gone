import { promises as fs } from "fs";
import path from "path";

import cnCharacterTable from "./ArknightsGameData/zh_CN/gamedata/excel/character_table.json" assert { type: "json" };
import enCharacterTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/character_table.json" assert { type: "json" };
import krCharacterTable from "./ArknightsGameData_YoStar/ja_JP/gamedata/excel/character_table.json" assert { type: "json" };
import jpCharacterTable from "./ArknightsGameData_YoStar/ko_KR/gamedata/excel/character_table.json" assert { type: "json" };

import cnCharacterPatchTable from "./ArknightsGameData/zh_CN/gamedata/excel/char_patch_table.json" assert { type: "json" };
import enCharacterPatchTable from "./ArknightsGameData_YoStar/en_US/gamedata/excel/char_patch_table.json" assert { type: "json" };
import jpCharacterPatchTable from "./ArknightsGameData_YoStar/ja_JP/gamedata/excel/char_patch_table.json" assert { type: "json" };
import krCharacterPatchTable from "./ArknightsGameData_YoStar/ko_KR/gamedata/excel/char_patch_table.json" assert { type: "json" };

import rangeTable from "./ArknightsGameData/zh_CN/gamedata/excel/range_table.json" assert { type: "json" };

// import {
//     getReleaseOrderAndLimitedLookup,
//     getSkinObtainSourceAndCosts,
// } from "./scrape-prts.jsrts.js";
// import {
//     fetchJetroyzSkillTranslations,
//     fetchJetroyzTalentTranslations,
// } fro./fetch-jetroyz-translations.jsons.js";
// import { getAlterMapping } from "./get-alters.js";

const enPatchChars = enCharacterPatchTable.patchChars;
const cnPatchChars = cnCharacterPatchTable.patchChars;
const jpPatchChars = jpCharacterPatchTable.patchChars;
const krPatchChars = krCharacterPatchTable.patchChars;

/** @type {{ [characterId: string]: string }} */
const NAME_OVERRIDES = {
    char_376_therex: "Thermal-EX",
    char_4055_bgsnow: "Pozёmka",
};

const CHARACTER_LOCALES = {
    zh_CN: { ...cnCharacterTable, ...cnPatchChars },
    en_US: { ...enCharacterTable, ...enPatchChars },
    ja_JP: { ...jpCharacterTable, ...jpPatchChars },
    ko_KR: { ...krCharacterTable, ...krPatchChars },
};

/**
 * Creates `{dataDir}/operators.json`, Sanity;Gone's "gigafile" containing
 * - base operator data from character_table
 * - denormalized skill data from skill_table
 * - denormalized range data from range_table
 * - module data from uniequip_table and battle_equip_table
 * - this operator's summons from character_table
 *
 * @param {string} dataDir - output directory
 */
export async function createOperatorsJson(dataDir) {
    console.log(`Creating ${path.join(dataDir, "operators.json")}...`);

    // const [
    //     jetSkillTranslations,
    //     jetTalentTranslations,
    //     skinSourceAndCostLookup,
    //     releaseOrderAndLimitedLookup,
    //     opToRiicSkillsMap,
    // ] = await Promise.all([
    //     fetchJetroyzSkillTranslations(),
    //     fetchJetroyzTalentTranslations(),
    //     getSkinObtainSourceAndCosts(),
    //     getReleaseOrderAndLimitedLookup(),
    //     aggregateRiicData(),
    // ]);

    const summonIdToOperatorId = {};
    const denormalizedCharacters = Object.entries(CHARACTER_LOCALES["zh_CN"]);

    const transformations = [
        filterPlaceableObjects,
        localizeCharacterDetails,
        // addPhases
        // addSkills
        // addTalents
        // addVoices
        // addSkins
        // convertRarityIndex
        // addModules
        // addRiicSkills
        // addAlterInformation -> alterId and baseOperatorId
        // releaseOrderAndLimitedLookup based on CN Name
        aggregateSummons,
    ];

    const characters = transformations.reduce((acc, transformation) => {
        return transformation(acc, summonIdToOperatorId);
    }, denormalizedCharacters);

    const operatorsJson = Object.fromEntries(characters);
    await fs.writeFile(
        path.join(dataDir, "operators.json"),
        JSON.stringify(operatorsJson, null, 2)
    );
}

function filterPlaceableObjects(characters) {
    return characters.filter(
        ([charId, character]) =>
            character.profession !== "TRAP" &&
            !charId.startsWith("trap_") &&
            !character.isNotObtainable
    );
}

function localizeCharacterDetails(characters) {
    return characters.map(([charId, character]) => {
        return [
            charId,
            {
                ...character,
                name: getLocalesForValue(charId, "name"),
                description: getLocalesForValue(charId, "description"),
                tagList: getLocalesForValue(charId, "tagList"),
                itemUsage: getLocalesForValue(charId, "itemUsage"),
                itemDesc: getLocalesForValue(charId, "itemDesc"),
                itemObtainApproach: getLocalesForValue(
                    charId,
                    "itemObtainApproach"
                ),
                serverLocales: Object.keys(CHARACTER_LOCALES).filter(
                    (locale) => CHARACTER_LOCALES[locale][charId]
                ),
            },
        ];
    });
}

function aggregateSummons(characters, summonIdToOperatorId) {
    characters.forEach(([charId, character]) => {
        character.skills
            .filter((skill) => skill.overrideTokenKey != null)
            .forEach((skill) => {
                summonIdToOperatorId[skill.overrideTokenKey] = charId;
            });
    });

    return characters;
}

function getLocalesForValue(charId, value) {
    return Object.keys(CHARACTER_LOCALES).reduce((locales, locale) => {
        if (CHARACTER_LOCALES[locale][charId]) {
            locales[locale] = CHARACTER_LOCALES[locale][charId][value] ?? "";
        }

        if (value == "name" && !CHARACTER_LOCALES[locale][charId]) {
            locales[locale] = CHARACTER_LOCALES.zh_CN[charId].appellation;
        }

        if (value == "name" && charId == "char_1001_amiya2") {
            locales[locale] =
                CHARACTER_LOCALES[locale][charId][value] + " (Guard)";
        }

        if (
            value == "name" &&
            charId == "char_4055_bgsnow" &&
            locale == "en_US"
        ) {
            locales[locale] = "Pozёmka";
        }

        return locales;
    }, {});
}

function addPhases(characters) {
    return characters.map(([charId, character]) => {
        const phases = character.phases.map((phase) => ({
            ...phase,
            range: phase.rangeId ? rangeTable[phase.rangeId] : null,
        }));

        return [
            charId,
            {
                ...character,
            },
        ];
    });
}

// createOperatorsJson(path.join(__dirname, "../data"))
