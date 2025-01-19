import { useEffect, useState } from "react";

import * as Collapsible from "@radix-ui/react-collapsible";
import * as Popover from "@radix-ui/react-popover";

import useMediaQuery from "~/utils/media-query";

import OperatorFilters from "./OperatorFilters";
import OperatorSort from "./OperatorSort";
import OperatorViewSwitch from "./OperatorViewSwitch";
import { initializeFiltersFromUrl } from "~/pages/[locale]/operators/_store.ts";
const OperatorFilterBar = () => {
	const [open, setOpen] = useState(false);
	const isMobile = useMediaQuery("(max-width: 768px)");
	useEffect(() => {
		setOpen(isMobile ? open : true);
	},[isMobile, open])

	return (
		<div className="mb-6 flex w-full justify-between">
			<Collapsible.Root
				open={open}
				onOpenChange={setOpen}
				className="flex w-full flex-col justify-between md:flex-row"
			>
				<div className="mb-4 flex h-8 w-full items-center justify-between md:mb-0 md:h-auto">
					<h1 className="text-[32px] font-semibold not-italic leading-8 text-neutral-50">
						Operators
					</h1>
					<Collapsible.Trigger asChild>
						<button
							className="group flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800/[.66] data-[state=open]:bg-gradient-to-b data-[state=open]:from-purple-light data-[state=open]:to-purple md:hidden"
							aria-label="Open Filters"
						>
							<svg
								width="15"
								height="15"
								viewBox="0 0 15 15"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									className="group-data-[state=closed]:fill-neutral-50 group-data-[state=open]:fill-neutral-950"
									fillRule="evenodd"
									clipRule="evenodd"
									d="M6.98584 1.5H8.01416L8.30566 3L9.08789 3.2959C9.55939 3.4736 9.983 3.71757 10.3506 4.01953L10.998 4.5498L12.4395 4.05469L12.9536 4.94385L11.8022 5.9458L11.9341 6.77051V6.77197C11.9799 7.05318 12 7.28908 12 7.5C12 7.71092 11.9799 7.94679 11.9341 8.22803L11.8008 9.05273L12.9521 10.0547L12.438 10.9453L10.998 10.4487L10.3491 10.9805C9.98154 11.2824 9.55939 11.5264 9.08789 11.7041H9.08643L8.3042 12L8.0127 13.5H6.98584L6.69434 12L5.91211 11.7041C5.44061 11.5264 5.017 11.2824 4.64941 10.9805L4.00195 10.4502L2.56055 10.9453L2.04639 10.0562L3.19922 9.05273L3.06592 8.23096V8.22949C3.02071 7.94707 3 7.7105 3 7.5C3 7.28908 3.02006 7.05321 3.06592 6.77197L3.19922 5.94727L2.04639 4.94531L2.56055 4.05469L4.00195 4.55127L4.64941 4.01953C5.017 3.71757 5.44061 3.4736 5.91211 3.2959L6.69434 3L6.98584 1.5ZM4.5 7.5C4.5 5.85261 5.85261 4.5 7.5 4.5C9.14739 4.5 10.5 5.85261 10.5 7.5C10.5 9.14739 9.14739 10.5 7.5 10.5C5.85261 10.5 4.5 9.14739 4.5 7.5Z"
								/>
								<path
									className="group-data-[state=closed]:fill-neutral-50 group-data-[state=open]:fill-neutral-950"
									fillRule="evenodd"
									clipRule="evenodd"
									d="M5.38184 1.89258L5.74951 0H9.25049L9.61816 1.89258C10.2364 2.12582 10.8053 2.45076 11.3027 2.85938L13.1191 2.23389L14.8711 5.26465L13.415 6.53174V6.5332C13.4708 6.87628 13.5 7.19434 13.5 7.5C13.5 7.80612 13.471 8.12459 13.415 8.46826L14.8696 9.73535L13.1191 12.7661L11.3013 12.1392C10.8037 12.5479 10.2367 12.8742 9.61816 13.1074L9.25049 15H5.74951L5.38184 13.1074C4.76358 12.8742 4.19467 12.5492 3.69727 12.1406L1.88086 12.7661L0.128906 9.73535L1.58496 8.46973V8.46826C1.52986 8.12447 1.5 7.80658 1.5 7.5C1.5 7.19388 1.52899 6.87541 1.58496 6.53174L0.128906 5.26611L1.88086 2.23389L3.69873 2.86084C4.19609 2.45245 4.76371 2.12569 5.38184 1.89258ZM8.01416 1.5H6.98584L6.69434 3L5.91211 3.2959C5.44061 3.4736 5.017 3.71757 4.64941 4.01953L4.00195 4.55127L2.56055 4.05469L2.04639 4.94531L3.19922 5.94727L3.06592 6.77197C3.02006 7.05321 3 7.28908 3 7.5C3 7.7105 3.02071 7.94707 3.06592 8.22949V8.23096L3.19922 9.05273L2.04639 10.0562L2.56055 10.9453L4.00195 10.4502L4.64941 10.9805C5.017 11.2824 5.44061 11.5264 5.91211 11.7041L6.69434 12L6.98584 13.5H8.0127L8.3042 12L9.08643 11.7041H9.08789C9.55939 11.5264 9.98154 11.2824 10.3491 10.9805L10.998 10.4487L12.438 10.9453L12.9521 10.0547L11.8008 9.05273L11.9341 8.22803C11.9799 7.94679 12 7.71092 12 7.5C12 7.28908 11.9799 7.05318 11.9341 6.77197V6.77051L11.8022 5.9458L12.9536 4.94385L12.4395 4.05469L10.998 4.5498L10.3506 4.01953C9.983 3.71757 9.55939 3.4736 9.08789 3.2959L8.30566 3L8.01416 1.5Z"
								/>
							</svg>
						</button>
					</Collapsible.Trigger>
				</div>
				<Collapsible.CollapsibleContent asChild>
					<div className="flex flex-col gap-3 md:flex-row md:gap-6 items-center">
						<div className="hidden md:flex items-center">
							<Popover.Root>
								<Popover.Trigger asChild>
									<button
										className="group flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-600 data-[state=open]:bg-gradient-to-b data-[state=open]:from-purple-light data-[state=open]:to-purple"
										aria-label="Open Filters"
									>
										<svg
											width="15"
											height="15"
											viewBox="0 0 15 15"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												className="group-data-[state=closed]:fill-neutral-50 group-data-[state=open]:fill-neutral-950"
												fillRule="evenodd"
												clipRule="evenodd"
												d="M6.98584 1.5H8.01416L8.30566 3L9.08789 3.2959C9.55939 3.4736 9.983 3.71757 10.3506 4.01953L10.998 4.5498L12.4395 4.05469L12.9536 4.94385L11.8022 5.9458L11.9341 6.77051V6.77197C11.9799 7.05318 12 7.28908 12 7.5C12 7.71092 11.9799 7.94679 11.9341 8.22803L11.8008 9.05273L12.9521 10.0547L12.438 10.9453L10.998 10.4487L10.3491 10.9805C9.98154 11.2824 9.55939 11.5264 9.08789 11.7041H9.08643L8.3042 12L8.0127 13.5H6.98584L6.69434 12L5.91211 11.7041C5.44061 11.5264 5.017 11.2824 4.64941 10.9805L4.00195 10.4502L2.56055 10.9453L2.04639 10.0562L3.19922 9.05273L3.06592 8.23096V8.22949C3.02071 7.94707 3 7.7105 3 7.5C3 7.28908 3.02006 7.05321 3.06592 6.77197L3.19922 5.94727L2.04639 4.94531L2.56055 4.05469L4.00195 4.55127L4.64941 4.01953C5.017 3.71757 5.44061 3.4736 5.91211 3.2959L6.69434 3L6.98584 1.5ZM4.5 7.5C4.5 5.85261 5.85261 4.5 7.5 4.5C9.14739 4.5 10.5 5.85261 10.5 7.5C10.5 9.14739 9.14739 10.5 7.5 10.5C5.85261 10.5 4.5 9.14739 4.5 7.5Z"
											/>
											<path
												className="group-data-[state=closed]:fill-neutral-50 group-data-[state=open]:fill-neutral-950"
												fillRule="evenodd"
												clipRule="evenodd"
												d="M5.38184 1.89258L5.74951 0H9.25049L9.61816 1.89258C10.2364 2.12582 10.8053 2.45076 11.3027 2.85938L13.1191 2.23389L14.8711 5.26465L13.415 6.53174V6.5332C13.4708 6.87628 13.5 7.19434 13.5 7.5C13.5 7.80612 13.471 8.12459 13.415 8.46826L14.8696 9.73535L13.1191 12.7661L11.3013 12.1392C10.8037 12.5479 10.2367 12.8742 9.61816 13.1074L9.25049 15H5.74951L5.38184 13.1074C4.76358 12.8742 4.19467 12.5492 3.69727 12.1406L1.88086 12.7661L0.128906 9.73535L1.58496 8.46973V8.46826C1.52986 8.12447 1.5 7.80658 1.5 7.5C1.5 7.19388 1.52899 6.87541 1.58496 6.53174L0.128906 5.26611L1.88086 2.23389L3.69873 2.86084C4.19609 2.45245 4.76371 2.12569 5.38184 1.89258ZM8.01416 1.5H6.98584L6.69434 3L5.91211 3.2959C5.44061 3.4736 5.017 3.71757 4.64941 4.01953L4.00195 4.55127L2.56055 4.05469L2.04639 4.94531L3.19922 5.94727L3.06592 6.77197C3.02006 7.05321 3 7.28908 3 7.5C3 7.7105 3.02071 7.94707 3.06592 8.22949V8.23096L3.19922 9.05273L2.04639 10.0562L2.56055 10.9453L4.00195 10.4502L4.64941 10.9805C5.017 11.2824 5.44061 11.5264 5.91211 11.7041L6.69434 12L6.98584 13.5H8.0127L8.3042 12L9.08643 11.7041H9.08789C9.55939 11.5264 9.98154 11.2824 10.3491 10.9805L10.998 10.4487L12.438 10.9453L12.9521 10.0547L11.8008 9.05273L11.9341 8.22803C11.9799 7.94679 12 7.71092 12 7.5C12 7.28908 11.9799 7.05318 11.9341 6.77197V6.77051L11.8022 5.9458L12.9536 4.94385L12.4395 4.05469L10.998 4.5498L10.3506 4.01953C9.983 3.71757 9.55939 3.4736 9.08789 3.2959L8.30566 3L8.01416 1.5Z"
											/>
										</svg>
									</button>
								</Popover.Trigger>
								<Popover.Anchor className="mt-2" />
								<Popover.Portal>
									<Popover.Content>
										<OperatorFilters />
										<Popover.Arrow className="fill-neutral-950" />
									</Popover.Content>
								</Popover.Portal>
							</Popover.Root>
						</div>
						<div className="w-full">
							<OperatorSort />
						</div>
						<div className="block md:hidden w-full">
							<OperatorFilters />
						</div>
						<div className="hidden md:block">
							<OperatorViewSwitch />
						</div>
					</div>
				</Collapsible.CollapsibleContent>
			</Collapsible.Root>
		</div>
	);
};

export default OperatorFilterBar;
