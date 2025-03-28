import { useEffect, useRef, useState } from "react";

import { Slider } from "@mui/base/Slider";

import Input from "~/components/ui/Input";
import { cx } from "~/utils/styles.ts";
import { useStore } from "@nanostores/react";
import { localeStore } from "~/pages/[locale]/_store.ts";
import { useTranslations } from "~/i18n/utils.ts";
import type { ui } from "~/i18n/ui.ts";

const masteryLevelRegexString = "[Mm](?<masteryLevel>[123])";
const masteryLevelRegex = new RegExp(masteryLevelRegexString);

interface SliderWithInputProps {
	type: "level" | "skill";
	max: number;
	value: number;
	onChange: (value: number) => void;
	hideMax?: boolean;
	inputClasses?: string;
	sliderClasses?: string;
}

function skillLevelNumberToMasteryLevel(level: number): string {
	if (level > 7) {
		return `M${level - 7}`;
	}
	return `${level}`;
}

const SliderWithInput: React.FC<SliderWithInputProps> = (props) => {
	const { type, max, value, onChange, hideMax, inputClasses, sliderClasses } = props;

	const locale = useStore(localeStore);
	const t = useTranslations(locale);

	const [rawInput, setRawInput] = useState(`${value}`);
	useEffect(() => {
		setRawInput(
			type === "skill"
				? skillLevelNumberToMasteryLevel(value)
				: `${value}`
		);
	}, [type, value]);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (
		e
	) => {
		if (e.target.value.length > `${max}`.length) {
			return;
		}

		setRawInput(e.target.value);
		const match = masteryLevelRegex.exec(e.target.value);
		const newValue = match?.groups?.masteryLevel
			? Number(match.groups.masteryLevel) + 7
			: Number(e.target.value);
		if (1 <= newValue && newValue <= max) {
			onChange(newValue);
		}
	};

	const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
		if (!inputRef.current?.validity.valid || e.target.value === "") {
			setRawInput(
				type === "skill"
					? skillLevelNumberToMasteryLevel(value)
					: `${value}`
			);
		}
	};

	const shortLabel =
		type === "level" ? "Lv" : t("operators.details.skills.rank");
	const label = type === "level" ? "Operator Level" : "Skill Rank";

	return (
		// return a fragment instead of a div, so the two components can be positioned individually
		<>
			{/* @ts-expect-error something with MUI */}
			<Slider<"input">
				aria-label={`${label} slider`}
				slotProps={{
					root: {
						className:
							"inline-flex mr-6 items-center h-4 relative cursor-pointer w-unset",
					},
					track: {
						className: cx(
							"block absolute h-[2px] rounded-sm",
							type === "level"
								? "bg-gradient-to-r from-yellow to-yellow-light"
								: "bg-gradient-to-r from-blue to-blue-light"
						),
					},
					rail: {
						className:
							"block absolute w-[calc(100%+1.5rem)] h-1 bg-neutral-500",
					},
					thumb: {
						className: `h-2 w-6 p-3 box-content absolute grid my-0 mx-[-12px] rounded-xl outline-offset-[-12px]
							after:rounded-sm after:bg-neutral-200
							hover:outline hover:outline-[12px] hover:outline-neutral-50/[0.05]
							[&.Mui-active]:outline [&.Mui-active]:outline-[12px] [&.Mui-active]:outline-neutral-50/[0.1]
							[html[data-focus-source=key]_&.Mui-focusVisible]:outline
							[html[data-focus-source=key]_&.Mui-focusVisible]:outline-3
							[html[data-focus-source=key]_&.Mui-focusVisible]:outline-blue
							`,
						// the default Mui-focusVisible style triggers even when using the mouse,
						// which clashes with the .active style; so we have to constrain it to when it receives focus
						// via keyboard
					},
				}}
				slots={{
					root: "div",
				}}
				onChange={(_, value) => onChange(value as number)}
				min={1}
				max={max}
				value={value}
				className={sliderClasses}
			/>
			<div className="flex flex-shrink-0 items-center gap-x-2">
				<span
					className={`text-neutral-200 ${type === "skill" ? "hidden sm:inline" : ""}`}
				>
					{shortLabel ?? label}
				</span>
				<Input
					aria-label={label}
					className={inputClasses ?? "w-10"}
					onFocus={(e) => e.target.select()}
					onBlur={handleBlur}
					onChange={handleInputChange}
					min={1}
					max={max}
					value={rawInput}
					ref={inputRef}
					type={type === "level" ? "number" : "text"}
					pattern={
						type === "skill" ? masteryLevelRegexString : undefined
					}
				/>
				{!hideMax && (
					<>
						<span className="text-neutral-400">/</span>
						<span className="text-neutral-200">{max}</span>
					</>
				)}
			</div>
		</>
	);
};
export default SliderWithInput;
