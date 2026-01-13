import { useStore } from "@nanostores/react";
import { localeStore } from "~/pages/[locale]/_store.ts";
import Tooltip from "~/components/ui/Tooltip.tsx";
import { useTranslations } from "~/i18n/utils.ts";

// Literally just the tooltip for the "Both" on mobile.
// Had to move it to a tsx component because I don't think Astro lets you pass components as props.
const OperatorBothTooltip: React.FC = () => {
	const locale = useStore(localeStore);
	const t = useTranslations(locale);

	return (
		<Tooltip
			content={
				<span>{t("operators.details.general.melee_and_ranged")}</span>
			}
		>
			<span className="relative cursor-help after:absolute after:bottom-0 after:left-0 after:right-0 after:border-b after:border-dashed after:opacity-[33%]">
				Both
			</span>
		</Tooltip>
	);
};
export default OperatorBothTooltip;
