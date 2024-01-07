import branches from "../../data/branches.json";

const subProfessionLookup: Record<string, string> = Object.fromEntries(
	Object.keys(branches).map((branch) => {
		return [
			branch,
			branches[branch as keyof typeof branches].branchName.en_US,
		];
	})
);
const reverseSubProfessionLookup = Object.fromEntries(
	Object.entries(subProfessionLookup).map(([k, v]) => [v, k])
);
export const subProfessionIdToBranch = (subProfessionId: string): string =>
	subProfessionLookup[subProfessionId];
export const branchToSubProfessionId = (branch: string): string =>
	reverseSubProfessionLookup[branch];
