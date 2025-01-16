import { MeiliSearch } from "meilisearch";

import enBranchesJson from "../data/en_US/branches.json";
import cnBranchesJson from "../data/zh_CN/branches.json";
import jpBranchesJson from "../data/ja_JP/branches.json";
import krBranchesJson from "../data/ko_KR/branches.json";

import enOperatorsJson from "../data/en_US/operators.json";
import cnOperatorsJson from "../data/zh_CN/operators.json";
import jpOperatorsJson from "../data/ja_JP/operators.json";
import krOperatorsJson from "../data/ko_KR/operators.json";

import { subProfessionIdToBranch } from "../src/utils/branches";
import { professionToClass } from "../src/utils/classes";
import { fetchContentfulGraphQl } from "../src/utils/fetch";

const BRANCH_LOCALES = {
	zh_CN: cnBranchesJson,
	en_US: enBranchesJson,
	ja_JP: jpBranchesJson,
	ko_KR: krBranchesJson,
};

const OPERATOR_LOCALES = {
	zh_CN: cnOperatorsJson,
	en_US: enOperatorsJson,
	ja_JP: jpOperatorsJson,
	ko_KR: krOperatorsJson,
};

/** @typedef {import("../src/types/output-types").SearchResult} SearchResult */
/**
<<<<<<< Updated upstream
=======
 * Creates `{dataDir}/search.json`, a FlexSearch index used for Sanity;Gone's search bar.
 * no it doesn't lol
>>>>>>> Stashed changes
 *
 * @param {"zh_CN" | "en_US" | "ja_JP" | "ko_KR"} locale - output locale
 */

export async function buildSearchIndex() {
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
	const { operatorAnalysisCollection } =
		await fetchContentfulGraphQl(contentfulQuery);

	const operatorsWithGuides = Object.fromEntries(
		operatorAnalysisCollection.items.map((item) => [
			item.operator.name,
			item.operator.slug,
		])
	);

	Object.values(OPERATOR_LOCALES.zh_CN)
		.filter((e) => !e.isNotObtainable)
		.filter((op) => op.profession !== "TOKEN")
		.forEach((op) => {
			searchArray.push({
				objectID: op.charId,
				type: "operator",
				charId: op.charId,
				name: Object.fromEntries(
					["zh_CN", "en_US", "ja_JP", "ko_KR"].map((locale) => [
						locale,
						OPERATOR_LOCALES[locale][op.charId].name,
					])
				),
				class: professionToClass(op.profession),
				subclass: Object.fromEntries(
					["zh_CN", "en_US", "ja_JP", "ko_KR"].map((locale) => [
						locale,
						subProfessionIdToBranch(op.subProfessionId, locale),
					])
				),
				rarity: op.rarity,
				hasGuide: !!operatorsWithGuides[op.name],
			});
		});

	[
		...new Set(
			Object.values(BRANCH_LOCALES.zh_CN).map((item) => item.class)
		),
	].forEach((className) => {
		// TODO localize class names
		searchArray.push({
			objectID: className,
			type: "class",
			name: className,
			class: className,
		});
	});

	Object.entries(BRANCH_LOCALES.zh_CN).forEach(([branchName, branch]) => {
		searchArray.push({
			objectID: branchName,
			type: "branch",
			name: Object.fromEntries(
				["zh_CN", "en_US", "ja_JP", "ko_KR"].map((locale) => [
					locale,
					BRANCH_LOCALES[locale][branchName].branchName,
				])
			),
			class: branch.class,
			subProfession: branchName,
		});
	});

	// searchArray.forEach((item) => {
	// 	console.log(item);
	// });

	const client = new MeiliSearch({
		host: process.env.PUBLIC_MEILISEARCH_URL,
		apiKey: process.env.MEILISEARCH_KEY,
	});
	await client.createIndex("operators", {
		primaryKey: "objectID",
	});
	const index = client.index("operators");
	index.addDocuments(searchArray).then(() => {
		console.log("Created index in MeiliSearch");
	});

	// This is no longer needed since the key has already been created
	// client
	// 	.createKey({
	// 		actions: ["search", "indexes.get"],
	// 		indexes: ["operators"],
	// 		name: "public",
	// 		uid: "54058be6-5807-405e-add7-27cd85e3f8fc",
	// 		description: "Public key for operators search",
	// 		expiresAt: null,
	// 	})
	// 	.then((key) => {
	// 		console.log(key);
	// 		console.log("Key created");
	// 	});
	// client.getKey("54058be6-5807-405e-add7-27cd85e3f8fc").then((key) => {
	// 	console.log(key);
	// 	console.log("Key retrieved");
	// });

	// index.saveObjects(searchArray).then(({ objectIDs }) => {
	// 	console.log(
	// 		`Created index in Algolia, added ${objectIDs.length} records`
	// 	);
	// });
}

// buildSearchIndex();
