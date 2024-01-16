import { useEffect, useRef, useState } from "react";

import { Slider } from "@mui/base";

import { cx } from "~/utils/styles.ts";

const masteryLevelRegexString = "[Mm](?<masteryLevel>[123])";
const masteryLevelRegex = new RegExp(masteryLevelRegexString);

interface SliderWithInputProps {
	type: "level" | "skill";
	max: number;
	value: number;
	onChange: (value: number) => void;
	hideMax?: boolean;
}

function skillLevelNumberToMasteryLevel(level: number): string {
	if (level > 7) {
		return `M${level - 7}`;
	}
	return `${level}`;
}

const SliderWithInput: React.FC<SliderWithInputProps> = (props) => {
	const { type, max, value, onChange, hideMax } = props;
	const [rawInput, setRawInput] = useState(`${value}`);
	useEffect(() => {
		setRawInput(
			type === "skill"
				? skillLevelNumberToMasteryLevel(value)
				: `${value}`
		);
	}, [type, value]);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		import("ally.js/src/style/focus-source").then((focusSource) =>
			focusSource.default()
		);
	}, []);

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

	const shortLabel = type === "level" ? "Lv" : "Rank";
	const label = type === "level" ? "Operator Level" : "Skill Rank";

	return (
		<div className="flex items-center gap-x-4">
			<Slider
				aria-label={`${label} slider`}
				slotProps={{
					root: {
						className:
							"inline-flex mr-6 items-center h-4 relative cursor-pointer w-unset lg:w-full grow lg:grow-0",
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
				onChange={(_, value) => onChange(value as number)}
				min={1}
				max={max}
				value={value}
			/>
			<div className="flex items-center gap-x-2">
				<span className="text-neutral-200">{shortLabel ?? label}</span>
				<input
					aria-label={label}
					className="box-border inline-flex h-8 w-10 rounded-lg bg-neutral-900 px-2.5 py-2 text-center text-base font-normal text-neutral-50"
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
						<span>/</span>
						<span>{max}</span>
					</>
				)}
			</div>
		</div>
	);
};
export default SliderWithInput;
