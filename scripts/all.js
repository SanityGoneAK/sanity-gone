import { promises as fs } from "fs";
import path from "path";

import { createOperatorsJson } from "./import-operators.js";
import { createBranchesJson } from "./import-branches.js";
import { createItemsJson } from "./import-items.js";
import { translateOperators } from "./translate-operators.js";
// import { createMapsJson } from "./create-maps-json.js";
// import { createEnemiesJson } from "./create-enemies-json.js";

(async () => {
	["zh_CN", "en_US", "ja_JP", "ko_KR"].forEach(async (locale) => {
		const dataDir = path.join(__dirname, "../data/", locale);
		await fs.mkdir(dataDir, { recursive: true });
		await Promise.all([
			createOperatorsJson(dataDir, locale),
			createBranchesJson(dataDir, locale),
			createItemsJson(dataDir, locale),
			// createMapsJson(dataDir),
			// createEnemiesJson(dataDir),
		]);
	});

	// dont translate operators for now

	// ["en_US", "ja_JP", "ko_KR"].forEach(async (locale) => {
	// 	await Promise.all([translateOperators(locale)]);
	// });

	// unfortunately build-search-index depends on branches.json,
	// so we have to wait to import it until branches.json has been written
	// const { buildSearchIndex } = await import("./build-search-index.js");
	// console.log("Building search index...");
	// await buildSearchIndex(dataDir);

	console.log("✅ Done.");
})();
