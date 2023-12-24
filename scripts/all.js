import { promises as fs } from "fs";
import path from "path";

import { createOperatorsJson } from "./import-operators.js";
import { createBranchesJson } from "./import-branches.js";
import { createItemsJson } from "./import-items.js";
// import { createMapsJson } from "./create-maps-json.js";
// import { createEnemiesJson } from "./create-enemies-json.js";

const dataDir = path.join(__dirname, "../data");

(async () => {
	await fs.mkdir(dataDir, { recursive: true });
	await Promise.all([
		createOperatorsJson(dataDir),
		createBranchesJson(dataDir),
		createItemsJson(dataDir),
		// createMapsJson(dataDir),
		// createEnemiesJson(dataDir),
	]);

	// unfortunately build-search-index depends on branches.json,
	// so we have to wait to import it until branches.json has been written
	const { buildSearchIndex } = await import("./build-search-index.js");
	console.log("Building search index...");
	await buildSearchIndex(dataDir);

	console.log("✅ Done.");
})();
