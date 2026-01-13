import { MeiliSearch } from "meilisearch";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

import enBranchesJson from "../data/en_US/branches.json";
import cnBranchesJson from "../data/zh_CN/branches.json";
import jpBranchesJson from "../data/ja_JP/branches.json";
import krBranchesJson from "../data/ko_KR/branches.json";
import twBranchesJson from "../data/zh_TW/branches.json"

import enOperatorsJson from "../data/en_US/operators.json";
import cnOperatorsJson from "../data/zh_CN/operators.json";
import jpOperatorsJson from "../data/ja_JP/operators.json";
import krOperatorsJson from "../data/ko_KR/operators.json";
import twOperatorsJson from "../data/zh_TW/operators.json";

import { subProfessionIdToBranch } from "../src/utils/branches";
import { professionToClass } from "../src/utils/classes";

const BRANCH_LOCALES = {
	zh_CN: cnBranchesJson,
	en_US: enBranchesJson,
	ja_JP: jpBranchesJson,
	ko_KR: krBranchesJson,
	zh_TW: twBranchesJson,
};

const OPERATOR_LOCALES = {
	zh_CN: cnOperatorsJson,
	en_US: enOperatorsJson,
	ja_JP: jpOperatorsJson,
	ko_KR: krOperatorsJson,
	zh_TW: twOperatorsJson,
};

/** @typedef {import("../src/types/output-types").SearchResult} SearchResult */
export async function buildSearchIndex() {
	/** @type {SearchResult[]} */
	const searchArray = [];

	Object.values(OPERATOR_LOCALES.zh_CN)
		.filter((e) => !e.isNotObtainable)
		.filter((op) => op.profession !== "TOKEN")
		.forEach((op) => {
			searchArray.push({
				objectID: op.charId,
				type: "operator",
				charId: op.charId,
				name: Object.fromEntries(
					["zh_CN", "en_US", "ja_JP", "ko_KR", "zh_TW"].map((locale) => [
						locale,
						OPERATOR_LOCALES[locale][op.charId].name,
					])
				),
				class: professionToClass(op.profession),
				subclass: Object.fromEntries(
					["zh_CN", "en_US", "ja_JP", "ko_KR", "zh_TW"].map((locale) => [
						locale,
						subProfessionIdToBranch(op.subProfessionId, locale),
					])
				),
				rarity: op.rarity,
				hasGuide: false,
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
				["zh_CN", "en_US", "ja_JP", "ko_KR", "zh_TW"].map((locale) => [
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
	await client.deleteIndex("operators");
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
