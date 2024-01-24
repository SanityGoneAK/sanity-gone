import algoliasearch from "algoliasearch";

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
 *
 * @param {"zh_CN" | "en_US" | "ja_JP" | "ko_KR"} locale - output locale
 */
export async function buildSearchIndex(locale) {
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

	Object.values(OPERATOR_LOCALES[locale])
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
				hasGuide: !!operatorsWithGuides[op.name],
			});
		});

	[
		...new Set(
			Object.values(BRANCH_LOCALES[locale]).map((item) => item.class)
		),
	].forEach((className) => {
		searchArray.push({
			objectID: className,
			type: "class",
			name: className,
			class: className,
		});
	});

	Object.entries(BRANCH_LOCALES[locale]).forEach(([branchName, branch]) => {
		searchArray.push({
			objectID: branchName,
			type: "branch",
			name: branch.branchName,
			class: branch.class,
			subProfession: branchName,
		});
	});

	const client = algoliasearch(
		process.env.ALGOLIA_APP_ID,
		process.env.ALGOLIA_SECRET
	);
	const INDEX_LOCALE = {
		zh_CN: process.env.ALGOLIA_CN_INDEX,
		en_US: process.env.ALGOLIA_EN_INDEX,
		ja_JP: process.env.ALGOLIA_JP_INDEX,
		ko_KR: process.env.ALGOLIA_KR_INDEX,
	};
	const index = client.initIndex(INDEX_LOCALE[locale]);
	index.clearObjects();

	index.saveObjects(searchArray).then(({ objectIDs }) => {
		console.log(
			`Created index in Algolia, added ${objectIDs.length} records`
		);
	});
}
