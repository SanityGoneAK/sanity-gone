/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { EliteZeroIcon, EliteOneIcon, EliteTwoIcon } from "~/components/icons";
import { cx } from "~/utils/styles.ts";

interface Props<T> {
	labels: Array<T>;
	value: T;
	onChange: (newValue: T) => void;
	disabled?: boolean;
	elite?: boolean; // if true, the button group will be styled as an elite button group
}

const eventsToStartAnimatingOn = ["click", "touchstart", "hover"];

const buttonVariants = cva("", {
	variants: {
		variant: {
			primary: "bg-purple-light",
			danger: "bg-red-light",
			info: "bg-blue-light",
			warning: "bg-yellow",
		},
	},
	defaultVariants: {
		variant: "primary",
	},
});

const PillButtonGroup = <T extends string | number = string>({
	labels,
	value,
	onChange,
	disabled,
	elite,
}: Props<T>) => {
	const [isAnimating, setIsAnimating] = useState(false);
	const buttonWidths = useRef(Array(labels.length));

	const thumbContainerRef = useRef<HTMLDivElement>(null);
	// we have to split the thumb (the active button indicator) into 3 parts
	// so that when we use scaleX, we only scale the rectangular center part;
	// otherwise the border radii get squished
	// see https://css-tricks.com/animating-css-width-and-height-without-the-squish-effect/
	const thumbLeftRef = useRef<HTMLSpanElement>(null);
	const thumbRef = useRef<HTMLSpanElement>(null);
	const thumbRightRef = useRef<HTMLSpanElement>(null);

	const rootRef = useRef<HTMLDivElement>(null);

	// translate the thumb to the correct position when index changes
	useEffect(() => {
		const index = labels.indexOf(value);
		if (index < 0) {
			throw new Error(`${value} is not contained in labels: ${labels}`);
		}

		const distance = buttonWidths.current
			.slice(0, index)
			.reduce((a, b) => a + b, 0);

		if (index === 0) {
			thumbLeftRef.current!.style.transform = `translateX(${distance}px)`;
		} else {
			thumbLeftRef.current!.style.transform = `translateX(${distance + 1}px)`;
		}
		const scaleFactor = buttonWidths.current[index] - 16;
		thumbRef.current!.style.transform = `translateX(${
			distance + 8
		}px) scaleX(${scaleFactor})`;
		thumbRightRef.current!.style.transform = `translateX(${
			scaleFactor + distance - 8 + (elite ? 1 : 0) // elite needs an extra pixel for some reason
		}px)`;

		const thumbSideBorderRadius = "4px";
		// if (index === 0) {
		// 	thumbSideBorderRadius = "4px";
		// } else if (index === labels.length - 1) {
		// 	thumbSideBorderRadius = "4px";
		// } else {
		// 	thumbSideBorderRadius = "4px";
		// }
		thumbLeftRef.current!.style.borderRadius = thumbSideBorderRadius;
		thumbRightRef.current!.style.borderRadius = thumbSideBorderRadius;
	}, [labels, value]);

	const beginAnimating = useCallback(() => {
		thumbLeftRef.current!.style.transition = "all 200ms";
		thumbRef.current!.style.transition = "all 200ms";
		thumbRightRef.current!.style.transition = "all 200ms";
		setIsAnimating(true);
	}, []);

	useEffect(() => {
		if (!isAnimating) {
			eventsToStartAnimatingOn.forEach((type) => {
				rootRef.current?.addEventListener(type, beginAnimating);
			});
			return () => {
				eventsToStartAnimatingOn.forEach((type) => {
					// eslint-disable-next-line react-hooks/exhaustive-deps
					rootRef.current?.removeEventListener(type, beginAnimating);
				});
			};
		} else {
			eventsToStartAnimatingOn.forEach((type) => {
				rootRef.current?.removeEventListener(type, beginAnimating);
			});
		}
	}, [beginAnimating, isAnimating]);

	useEffect(() => {
		// once thumb parts have been translated, show the thumb
		thumbContainerRef.current!.style.display = "";
	}, []);

	return (
		<div
			className="relative isolate inline-block w-fit select-none"
			ref={rootRef}
		>
			<div
				className="inline-block rounded border border-neutral-600"
				role="group"
			>
				{labels.map((label, i) => (
					<button
						key={label}
						onClick={() => onChange(label)}
						aria-pressed={value === label}
						// what in god's name is going on here
						className={cx(
							`relative z-20 cursor-pointer rounded border-none bg-none text-base font-semibold text-neutral-200 transition-[background-color,color] duration-200 disabled:cursor-not-allowed aria-pressed:text-neutral-950 disabled:aria-pressed:bg-neutral-200 [&:not([aria-pressed="true"],:disabled)]:hover:bg-blue-light/10 [&:not([aria-pressed="true"],:disabled)]:hover:text-blue-light`,
							elite
								? "h-[40px] w-10 items-center"
								: "px-2.5 py-[4.5px] leading-[27px]"
						)}
						ref={(el) => {
							buttonWidths.current[i] =
								el?.getBoundingClientRect().width;
						}}
						disabled={disabled}
					>
						{elite ? (
							<div className="flex h-full w-full items-center justify-center">
								{label === 0 && (
									<EliteZeroIcon
										className={cx(
											"h-[22px] w-6 fill-none",
											value === label
												? "stroke-neutral-900"
												: "stroke-neutral-200"
										)}
									/>
								)}
								{label === 1 && (
									<EliteOneIcon
										className={cx(
											"h-[22px] w-6",
											value === label
												? "fill-neutral-900"
												: "fill-neutral-200"
										)}
									/>
								)}
								{label === 2 && (
									<EliteTwoIcon
										className={cx(
											"h-[22px] w-6",
											value === label
												? "fill-neutral-900"
												: "fill-neutral-200"
										)}
									/>
								)}
							</div>
						) : (
							label
						)}
					</button>
				))}
			</div>
			<div
				ref={thumbContainerRef}
				className="absolute inset-0 z-10 inline-block overflow-hidden rounded border border-transparent"
				aria-hidden="true"
				style={{ display: "none" }}
			>
				<span
					className={cx(
						"absolute box-border inline-block h-full w-6 origin-[center_left] rounded px-0 py-[4.5px] text-base font-semibold leading-[27px]",
						elite ? "left-[-1px] bg-yellow" : "left-0 bg-blue-light"
					)}
					ref={thumbLeftRef}
				/>
				<span
					className={cx(
						"absolute left-0 box-border inline-block h-full w-[1px] origin-[center_left] rounded px-0 py-[4.5px] text-base font-semibold leading-[27px]",
						elite ? "left-[-1px] bg-yellow" : "left-0 bg-blue-light"
					)}
					ref={thumbRef}
				/>
				<span
					className={cx(
						"absolute left-[-1px] box-border inline-block h-full w-6 origin-[center_left] rounded px-0 py-[4.5px] text-base font-semibold leading-[27px]",
						elite ? "left-[-1px] bg-yellow" : "left-0 bg-blue-light"
					)}
					ref={thumbRightRef}
				/>
			</div>
		</div>
	);
};
export default PillButtonGroup;
