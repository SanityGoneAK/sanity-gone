/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { useCallback, useEffect, useRef, useState } from "react";

interface Props<T> {
	labels: Array<T>;
	value: T;
	onChange: (newValue: T) => void;
	disabled?: boolean;
}

const eventsToStartAnimatingOn = ["click", "touchstart", "hover"];

const PillButtonGroup = <T extends string | number = string>({
	labels,
	value,
	onChange,
	disabled,
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
		thumbLeftRef.current!.style.transform = `translateX(${distance}px)`;
		const scaleFactor = buttonWidths.current[index] - 16;
		thumbRef.current!.style.transform = `translateX(${
			distance + 8
		}px) scaleX(${scaleFactor})`;
		thumbRightRef.current!.style.transform = `translateX(${
			scaleFactor + distance - 8
		}px)`;

		let thumbSideBorderRadius: string;
		if (index === 0) {
			thumbSideBorderRadius = "32px 8px 8px 32px";
		} else if (index === labels.length - 1) {
			thumbSideBorderRadius = "8px 32px 32px 8px";
		} else {
			thumbSideBorderRadius = "8px";
		}
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
				className="inline-block rounded-[32px] bg-neutral-900"
				role="group"
			>
				{labels.map((label, i) => (
					<button
						key={label}
						onClick={() => onChange(label)}
						aria-pressed={value === label}
						// what in god's name is going on here
						className={`relative z-20
						cursor-pointer rounded-lg border-none bg-none px-2.5 py-[4.5px]
						text-base font-semibold leading-[27px] text-neutral-400 transition-[background-color,color]
						duration-200 first-of-type:rounded-l-[32px]
						last-of-type:rounded-r-[32px] disabled:cursor-not-allowed
						aria-pressed:text-neutral-950
						disabled:aria-pressed:bg-neutral-200
						[&:not([aria-pressed="true"],:disabled)]:hover:bg-purple/10
						[&:not([aria-pressed="true"],:disabled)]:hover:text-purple`}
						ref={(el) => {
							buttonWidths.current[i] =
								el?.getBoundingClientRect().width;
						}}
						disabled={disabled}
					>
						{label}
					</button>
				))}
			</div>
			<div
				ref={thumbContainerRef}
				className="absolute bottom-0 left-0 right-0 top-0 z-10 inline-block overflow-hidden rounded-[32px]"
				aria-hidden="true"
				style={{ display: "none" }}
			>
				<span
					className="absolute left-0 box-border inline-block h-full w-6 origin-[center_left] rounded-l-lg
				bg-gradient-to-b from-purple-light to-purple px-0 py-[4.5px] text-base font-semibold leading-[27px]"
					ref={thumbLeftRef}
				/>
				<span
					className="absolute left-0 box-border inline-block h-full w-[1px] origin-[center_left]
				bg-gradient-to-b from-purple-light to-purple px-0 py-[4.5px] text-base font-semibold leading-[27px]"
					ref={thumbRef}
				/>
				<span
					className="absolute left-0 box-border inline-block h-full w-6 origin-[center_left] rounded-r-lg
				bg-gradient-to-b from-purple-light to-purple px-0 py-[4.5px] text-base font-semibold leading-[27px]"
					ref={thumbRightRef}
				/>
			</div>
		</div>
	);
};
export default PillButtonGroup;
