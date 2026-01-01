import enBranchesJson from "../../data/en_US/branches.json";
import cnBranchesJson from "../../data/zh_CN/branches.json";
import jpBranchesJson from "../../data/ja_JP/branches.json";
import krBranchesJson from "../../data/ko_KR/branches.json";
import twBranchesJson from "../../data/zh_TW/branches.json";

const BRANCH_LOCALES = {
	zh_CN: cnBranchesJson,
	en_US: enBranchesJson,
	ja_JP: jpBranchesJson,
	ko_KR: krBranchesJson,
	zh_TW: twBranchesJson,
};

const lookups = Object.fromEntries(
	["zh_CN", "en_US", "ja_JP", "ko_KR", "zh_TW"].map((locale) => {
		const branches = BRANCH_LOCALES[locale as keyof typeof BRANCH_LOCALES];
		return [
			locale,
			Object.fromEntries(
				Object.keys(branches).map((branch) => {
					return [
						branch,
						branches[branch as keyof typeof branches].branchName,
					];
				})
			),
		];
	})
);
const reverseLookups = Object.fromEntries(
	Object.entries(lookups).map(([locale, lookup]) => [
		locale,
		Object.fromEntries(Object.entries(lookup).map(([k, v]) => [v, k])),
	])
);

export const subProfessionIdToBranch = (
	subProfessionId: string,
	locale = "en_US"
): string => lookups[locale][subProfessionId];

export const branchToSubProfessionId = (
	branch: string,
	locale = "en_US"
): string => reverseLookups[locale][branch];
