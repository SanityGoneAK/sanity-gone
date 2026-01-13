import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
} from "@headlessui/react";

interface AccordionProps {
	title: string;
	icon?: React.ReactNode;
	fill?: boolean;
	children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = (props) => {
	const { title, icon, children, fill } = props;

	return (
		<Disclosure>
			{/* need relative to get z-index to work (DisclosurePanel is also relative), this way the transition's BG is properly hidden */}
			<DisclosureButton className={`group relative z-10 mb-0 flex h-[60px] w-full items-center gap-3 rounded bg-neutral-600 px-4 text-base font-semibold leading-none data-[open]:rounded-b-none
				stroke-neutral-200 data-[open]:stroke-neutral-50 text-neutral-200 data-[open]:text-neutral-50 transition duration-200 ${fill ? "fill-neutral-200 data-[open]:fill-neutral-50" : ""}`}>
				{icon}

				<span>{title}</span>
				<div className="flex-grow"></div>
				<svg
					className="flex-none rotate-180 transition-transform duration-200 ease-out group-data-[open]:rotate-0 group-data-[open]:transform"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M17 11L12 6L7 11"
						// stroke="#E8E8F2"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M17 18L12 13L7 18"
						// stroke="#E8E8F2"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</DisclosureButton>
			<DisclosurePanel
				className="relative z-0 origin-top bg-neutral-800 p-4 transition duration-200 ease-out data-[closed]:-translate-y-6 data-[closed]:opacity-0 motion-reduce:transition-none"
				transition
			>
				{children}
			</DisclosurePanel>
		</Disclosure>
	);
};

export default Accordion;
