import { useStore } from "@nanostores/react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";

import {
	$viewConfig,
	type ViewConfigValue,
} from "../../../pages/[locale]/operators/_store";

const OperatorViewSwitch = () => {
	const viewConfig = useStore($viewConfig);

	return (
		<div style={{ display: "flex", alignItems: "center" }}>
			<label
				className="font- mr-2 text-neutral-200"
				htmlFor="operator-view"
			>
				View
			</label>
			<ToggleGroup.Root
				defaultValue={viewConfig}
				onValueChange={(value: ViewConfigValue) =>
					$viewConfig.set(value)
				}
				className="flex h-8 w-20 justify-around overflow-hidden rounded-lg bg-neutral-800/[0.66]"
				type="single"
			>
				<ToggleGroup.Item
					className="group flex w-full items-center justify-center data-[state=on]:rounded-lg data-[state=on]:bg-gradient-to-b data-[state=on]:from-purple-light data-[state=on]:to-purple"
					value="large"
				>
					<svg
						width="20"
						height="16"
						viewBox="0 0 20 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="group-data-[state=off]:[&>*]:fill-neutral-200 group-data-[state=on]:[&>*]:fill-neutral-950"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M8.125 1.75H1.25L1.25 14.25H8.125V1.75ZM1.25 0.5C0.559644 0.5 0 1.05964 0 1.75V14.25C0 14.9404 0.559644 15.5 1.25 15.5H8.125C8.81536 15.5 9.375 14.9404 9.375 14.25V1.75C9.375 1.05964 8.81536 0.5 8.125 0.5H1.25Z"
							fill="currentColor"
						/>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M18.75 1.75H11.875V14.25H18.75V1.75ZM11.875 0.5C11.1846 0.5 10.625 1.05964 10.625 1.75V14.25C10.625 14.9404 11.1846 15.5 11.875 15.5H18.75C19.4404 15.5 20 14.9404 20 14.25V1.75C20 1.05964 19.4404 0.5 18.75 0.5H11.875Z"
							fill="currentColor"
						/>
					</svg>
				</ToggleGroup.Item>
				<ToggleGroup.Item
					value="compact"
					className="group flex w-full items-center justify-center data-[state=on]:rounded-lg data-[state=on]:bg-gradient-to-b data-[state=on]:from-purple-light data-[state=on]:to-purple"
				>
					<svg
						width="20"
						height="16"
						viewBox="0 0 20 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="group-data-[state=off]:[&>*]:fill-neutral-200 group-data-[state=on]:[&>*]:fill-neutral-950"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M4.58333 1.75H1.25L1.25 6.125H4.58333L4.58333 1.75ZM1.25 0.5C0.559644 0.5 0 1.05964 0 1.75V6.125C0 6.81536 0.559643 7.375 1.25 7.375H4.58333C5.27369 7.375 5.83333 6.81536 5.83333 6.125V1.75C5.83333 1.05964 5.27369 0.5 4.58333 0.5H1.25Z"
						/>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M11.6667 1.75H8.33333L8.33333 6.125H11.6667L11.6667 1.75ZM8.33333 0.5C7.64298 0.5 7.08333 1.05964 7.08333 1.75V6.125C7.08333 6.81536 7.64298 7.375 8.33333 7.375H11.6667C12.357 7.375 12.9167 6.81536 12.9167 6.125V1.75C12.9167 1.05964 12.357 0.5 11.6667 0.5H8.33333Z"
						/>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M18.75 1.75H15.4167L15.4167 6.125H18.75V1.75ZM15.4167 0.5C14.7263 0.5 14.1667 1.05964 14.1667 1.75V6.125C14.1667 6.81536 14.7263 7.375 15.4167 7.375H18.75C19.4404 7.375 20 6.81536 20 6.125V1.75C20 1.05964 19.4404 0.5 18.75 0.5H15.4167Z"
						/>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M4.58333 9.875H1.25L1.25 14.25H4.58333L4.58333 9.875ZM1.25 8.625C0.559644 8.625 0 9.18464 0 9.875V14.25C0 14.9404 0.559643 15.5 1.25 15.5H4.58333C5.27369 15.5 5.83333 14.9404 5.83333 14.25V9.875C5.83333 9.18464 5.27369 8.625 4.58333 8.625H1.25Z"
						/>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M11.6667 9.875H8.33333L8.33333 14.25H11.6667L11.6667 9.875ZM8.33333 8.625C7.64298 8.625 7.08333 9.18464 7.08333 9.875V14.25C7.08333 14.9404 7.64298 15.5 8.33333 15.5H11.6667C12.357 15.5 12.9167 14.9404 12.9167 14.25V9.875C12.9167 9.18464 12.357 8.625 11.6667 8.625H8.33333Z"
						/>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M18.75 9.875H15.4167L15.4167 14.25H18.75V9.875ZM15.4167 8.625C14.7263 8.625 14.1667 9.18464 14.1667 9.875V14.25C14.1667 14.9404 14.7263 15.5 15.4167 15.5H18.75C19.4404 15.5 20 14.9404 20 14.25V9.875C20 9.18464 19.4404 8.625 18.75 8.625H15.4167Z"
						/>
					</svg>
				</ToggleGroup.Item>
			</ToggleGroup.Root>
		</div>
	);
};

export default OperatorViewSwitch;
