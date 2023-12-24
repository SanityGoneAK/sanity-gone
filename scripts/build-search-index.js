import algoliasearch from "algoliasearch"

import { professionToClass } from "../src/utils/classes";
import { subProfessionIdToBranch } from "../src/utils/branches";
import { fetchContentfulGraphQl } from "../src/utils/fetch";

import operatorsJson from "../data/operators.json";
import branchesJson from "../data/branches.json";

/** @typedef {import("../src/types/output-types").SearchResult} SearchResult */

/**
 * Creates `{dataDir}/search.json`, a FlexSearch index used for Sanity;Gone's search bar.
 *
 * @param {string} dataDir - output directory
 */
export async function buildSearchIndex(dataDir) {
  /** @type {SearchResult[]} */
  const searchArray = [];

  const contentfulQuery = `
  query {
    operatorAnalysisCollection {
      items {
        operator {
          name
          slug
        }
      }
    }
  }
  `;
  /** @type any */
  const { operatorAnalysisCollection } = await fetchContentfulGraphQl(
    contentfulQuery
  );

  const operatorsWithGuides = Object.fromEntries(
    operatorAnalysisCollection.items.map((item) => [
      item.operator.name,
      item.operator.slug,
    ])
  );

  Object.values(operatorsJson)
    .filter((e) => !e.isNotObtainable)
    .forEach((op) => {
      searchArray.push({
        objectID: op.charId,
        type: "operator",
        charId: op.charId,
        name: op.name,
        class: professionToClass(op.profession),
        subclass: subProfessionIdToBranch(op.subProfessionId),
        rarity: op.rarity,
        hasGuide: !!operatorsWithGuides[op.name.en_US]
      });
    });
  [
    "Vanguard",
    "Guard",
    "Specialist",
    "Defender",
    "Supporter",
    "Sniper",
    "Medic",
    "Caster",
  ].forEach((className) => {
    searchArray.push({
      objectID: className,
      type: "class",
      name: className,
      class: className,
    });
  });
  Object.entries(branchesJson).forEach(([branchName, branch]) => {
    searchArray.push({
      objectID: branchName,
      type: "branch",
      name: branch.branchName,
      class: branch.class,
      subProfession: branchName,
    });
  });

  const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_SECRET);
  const index = client.initIndex(process.env.ALGOLIA_INDEX);
  index.clearObjects()

  index.saveObjects(searchArray).then(({ objectIDs }) => {
    console.log(`Created index in Algolia, added ${objectIDs.length} records`)
  });

}
