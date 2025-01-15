import enBranchesJson from "../../../data/en_US/branches.json";
import krBranchesJson from "../../../data/ko_KR/branches.json";
import cnBranchesJson from "../../../data/zh_CN/branches.json";
import jpBranchesJson from "../../../data/ja_JP/branches.json";
import { useStore } from "@nanostores/react";
import { localeStore } from "~/pages/[locale]/_store.ts";
import type { Locale } from "~/i18n/languages.ts";

interface Props {
	subProfessionId: string;
}

const TraitInfo: React.FC<Props> = ({ subProfessionId }) => {
	const locale = useStore(localeStore);
	const branchMap = {
		en: enBranchesJson,
		kr: krBranchesJson,
		'zh-cn': cnBranchesJson,
		jp: jpBranchesJson,
	}
	const branchesJson = branchMap[locale as keyof typeof branchMap];
	const { trait } =
		branchesJson[subProfessionId as keyof typeof branchesJson];
	return <span dangerouslySetInnerHTML={{ __html: trait }} />;
};
export default TraitInfo;
