import { useStore } from "@nanostores/react";

import Tooltip from "~/components/ui/Tooltip";
import { operatorStore } from "~/pages/[locale]/operators/_store";
import { subProfessionIdToBranch } from "~/utils/branches.ts";
import { operatorBranchIcon } from "~/utils/images.ts";

import TraitInfo from "./TraitInfo";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { useTranslations } from "~/i18n/utils.ts";
import type { ui } from "~/i18n/ui.ts";
import { type Locale, localeToTag } from "~/i18n/languages.ts";

const OperatorBranchAndTrait: React.FC = () => {
	const operator = useStore(operatorStore);
	const locale = useStore(localeStore) as Locale;
	return (
		<div className="grid grid-flow-col items-center gap-x-1 sm:gap-x-2">
			<img
				className="h-5 w-full"
				src={operatorBranchIcon(operator.subProfessionId)}
				alt=""
			/>
			<Tooltip
				content={
					<TraitInfo subProfessionId={operator.subProfessionId} />
				}
			>
				<span
					className="relative cursor-help after:absolute after:bottom-0 after:left-0 after:right-0
							   after:border-b after:border-dashed after:opacity-[33%]"
				>
					{subProfessionIdToBranch(operator.subProfessionId, localeToTag[locale])}
				</span>
			</Tooltip>
		</div>
	);
};
export default OperatorBranchAndTrait;
