import { promises as fs } from "fs";
import path from "path";
import {
	getReleaseOrderAndLimitedLookup,
	getSkinObtainSourceAndCosts,
} from "./scrape-prts";

export async function createPrtsScrapeJson() {
	const [releaseOrderAndLimitedLookup, skinObtainSourceAndCosts] =
		await Promise.all([
			getReleaseOrderAndLimitedLookup(),
			getSkinObtainSourceAndCosts(),
		]);

	const outDir = path.join(__dirname, "../data");
	await fs.mkdir(outDir, { recursive: true });
	const outPath = path.join(outDir, "prts-scrape.json");

	await fs.writeFile(
		outPath,
		JSON.stringify(
			{ releaseOrderAndLimitedLookup, skinObtainSourceAndCosts },
			null,
			2
		)
	);
}
