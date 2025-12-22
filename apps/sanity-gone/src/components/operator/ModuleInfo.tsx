import { useMemo } from "react";

import {
	ArtsResistanceIcon,
	AttackPowerIcon,
	AttackSpeedIcon,
	BlockIcon,
	DefenseIcon,
	DPCostIcon,
	HealthIcon,
	HourglassIcon,
} from "~/components/icons";
import { getModuleStatIncrease } from "~/utils/character-stats";
import { moduleImage, moduleTypeImage } from "~/utils/images.ts";

import type * as OutputTypes from "~/types/output-types";
import { useStore } from "@nanostores/react";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { useTranslations } from "~/i18n/utils.ts";
import type { ui } from "~/i18n/ui.ts";
import { cx } from "~/utils/styles.ts";
import { descriptionToHtml } from "~/utils/description-parser.ts";

// TODO: Do we want to handle modules such as Pozy Y?
// a.k.a. show exact token stat changes for modules that
// affect tokens

// If we do, props might need to include the token data and we might
// want to add a characterstats to the panel page. I don't know though

interface Props {
	operator: OutputTypes.Operator;
	module: OutputTypes.Module;
	stage: number; // 1, 2, 3
	potential: number; // zero-indexed (0, 1, 2, 3, 4, 5)
}

const ModuleInfo: React.FC<Props> = ({
	operator,
	module,
	stage,
	potential,
}) => {
	const locale = useStore(localeStore);
	const t = useTranslations(locale);

	const moduleId = module.moduleId;
	const {
		atk,
		max_hp,
		def,
		attack_speed,
		magic_resistance,
		cost,
		respawn_time,
		block_cnt,
		max_deck_stack_cnt,
		max_deploy_count,
	} = useMemo(() => {
		return getModuleStatIncrease(operator, moduleId, stage);
	}, [operator, moduleId, stage]);

	const activeCandidate = module.phases[stage - 1].candidates.find(
		(phase) => phase.requiredPotentialRank === potential
	)!;

	const statChanges = [
		atk,
		max_hp,
		def,
		attack_speed,
		magic_resistance,
		cost,
		respawn_time,
		block_cnt,
		max_deck_stack_cnt,
		max_deploy_count,
	];

	const statChangeCount = statChanges.filter((change) => change !== 0).length;

	/**
	 * This component is used to display one of the stat changes for a module.
	 *
	 * Yes, this is a bit of a mess. Modules is like a messy King Midas.
	 * Everything it touches turns into a mess.
	 *
	 * @param props.changeNum The number of the stat change to display (1-indexed).
	 * @returns The JSX for the stat change.
	 */
	const StatChange = (props: { changeNum: number; className?: string }) => {
		const { changeNum, className } = props;

		// get the nth stat change
		let changes = 0;
		let changeIndex = -1;
		for (let i = 0; i < statChanges.length; i++) {
			if (statChanges[i] !== 0) {
				changes++;
				if (changes === changeNum) {
					changeIndex = i;
					break;
				}
			}
		}

		if (changeIndex === -1) {
			return null;
		}

		const icon = (() => {
			switch (changeIndex) {
				case 0:
					return <AttackPowerIcon />;
				case 1:
					return <HealthIcon />;
				case 2:
					return <DefenseIcon />;
				case 3:
					return <AttackSpeedIcon />;
				case 4:
					return <ArtsResistanceIcon />;
				case 5:
					return <DPCostIcon />;
				case 6:
					return <HourglassIcon />;
				case 7:
					return <BlockIcon />;
				default:
					return <></>;
			}
		})();

		const statName = (() => {
			switch (changeIndex) {
				case 0:
					return t("operators.details.modules.attack");
				case 1:
					return t("operators.details.modules.health");
				case 2:
					return t("operators.details.modules.defense");
				case 3:
					return t("operators.details.modules.aspd");
				case 4:
					return t("operators.details.modules.res");
				case 5:
					return t("operators.details.modules.dp");
				case 6:
					return t("operators.details.modules.redeployment_time");
				case 7:
					return t("operators.details.modules.block");
				default:
					return "";
			}
		})();

		// don't use the plus if it's a negative stat change (DP and redeployment time)
		const usePlus = [
			t("operators.details.modules.attack"),
			t("operators.details.modules.health"),
			t("operators.details.modules.defense"),
			t("operators.details.modules.aspd"),
			t("operators.details.modules.res"),
			t("operators.details.modules.block"),
		].includes((statName as ReturnType<typeof t>) || "");

		return (
			<div
				className={`flex h-8 items-center justify-start gap-x-2 rounded ${className}`}
			>
				{icon}
				<dt className="text-neutral-200">{statName}</dt>
				<dd className="ml-auto text-lg font-semibold leading-none">
					{usePlus ? "+" : ""}
					{statChanges[changeIndex]}
				</dd>
			</div>
		);
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2">
				<img
					className="h-6"
					src={moduleTypeImage(module.moduleIcon.toLowerCase())}
					alt=""
				/>
				<h2 className="font-serif text-lg font-semibold leading-none">
					{module.moduleName}
				</h2>
				<p className="font-semibold text-neutral-200">
					{module.moduleIcon}
				</p>
			</div>

			<dl
				className={cx(
					"grid grid-cols-1",
					statChangeCount === 2 || statChangeCount === 4
						? "sm:grid-cols-[1fr_1fr]"
						: "",
					statChangeCount === 3 ? "sm:grid-cols-[1fr_1fr_1fr]" : ""
				)}
			>
				{/* absolute nightmare fuel handling here. it's lowkey too annoying to make any sort of
				generalizable layout here */}
				{statChangeCount === 2 && (
					<>
						<StatChange
							changeNum={1}
							className="border-neutral-500 sm:border-r sm:pr-6"
						/>
						<StatChange changeNum={2} className="sm:pl-6" />
					</>
				)}
				{statChangeCount === 3 && (
					<>
						<StatChange
							changeNum={1}
							className="border-neutral-500 sm:border-r sm:pr-6"
						/>
						<StatChange
							changeNum={2}
							className="border-neutral-500 sm:border-r sm:px-6"
						/>
						<StatChange changeNum={3} className="sm:pl-6" />
					</>
				)}
				{/* Why do operators with 4 stat changes exist? *dies of Nian* */}
				{statChangeCount === 4 && (
					<>
						<StatChange
							changeNum={1}
							className="border-neutral-500 sm:border-r sm:pr-6"
						/>
						<StatChange changeNum={2} className="sm:pl-6" />
						<StatChange
							changeNum={3}
							className="border-neutral-500 sm:border-r sm:pr-6"
						/>
						<StatChange changeNum={4} className="sm:pl-6" />
					</>
				)}
			</dl>
			<div className="flex flex-col gap-2 self-start">
				<div>
					<h3 className="mb-1 text-sm text-neutral-200">
						{t("operators.details.modules.trait")}
						{activeCandidate.traitEffectType === "update" && (
							<span>
								{" "}
								({t("operators.details.modules.added")})
							</span>
						)}
						{activeCandidate.traitEffectType === "override" && (
							<span>
								{" "}
								({t("operators.details.modules.updated")})
							</span>
						)}
					</h3>
					<p
						dangerouslySetInnerHTML={{
							__html:
								activeCandidate.traitEffect ??
								t("operators.details.modules.no_effect"),
						}}
						className="highlight-desc module-desc"
					></p>
				</div>
				{activeCandidate.talentEffect && (
					<div>
						<h3 className="mb-1 text-sm text-neutral-200">
							{
								activeCandidate.talentEffect
									? activeCandidate.talentIndex === -1
										? t(
												"operators.details.modules.new_talent"
											) // there is a new talent
										: `${t("operators.details.modules.talent")} ${
												activeCandidate.talentIndex + 1
											}` // this is the talent modified
									: t(
											"operators.details.modules.talent"
										) /* no talent modifications */
							}
							{activeCandidate.talentEffect &&
								(activeCandidate.talentIndex === -1 ? ( // new talent added
									<span>
										{" "}
										({t("operators.details.modules.added")})
									</span>
								) : (
									// current talent updated
									<span>
										{" "}
										(
										{t("operators.details.modules.updated")}
										)
									</span>
								))}
						</h3>
						<p
							dangerouslySetInnerHTML={{
								__html:
									activeCandidate.talentEffect ??
									t("operators.details.modules.no_effect"),
							}}
						></p>
					</div>
				)}
			</div>
			<div className="flex h-full flex-col overflow-hidden rounded-lg bg-neutral-800">
				<img
					className="h-[182px] flex-grow"
					src={moduleImage(moduleId)}
					alt=""
				/>
			</div>
		</div>
	);
};

export default ModuleInfo;
