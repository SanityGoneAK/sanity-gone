import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
} from "@headlessui/react";

interface AboutProps {
	memberGroups: {
		title: string;
		members: { name: string; role: string; imageFilename: string }[];
	}[];
}

const About: React.FC<AboutProps> = (props) => {
	const { memberGroups } = props;
	return (
		<div>
			<div className="bg-neutral-600 bg-opacity-50 px-3">
				{memberGroups.map(({ title, members }) => {
					return (
						<Disclosure key={title}>
							<DisclosureButton className="flex h-6 w-full items-center gap-8 py-6">
								<h3 className="flex-none">{title}</h3>
								<span className="h-[1px] w-full flex-grow bg-neutral-200"></span>
								<svg
									className="flex-none"
									width="13"
									height="14"
									viewBox="0 0 13 14"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M0.250971 3.7388C0.585598 3.4204 1.12813 3.4204 1.46276 3.7388L6.5 8.53169L11.5372 3.7388C11.8719 3.4204 12.4144 3.4204 12.749 3.7388C13.0837 4.05719 13.0837 4.57341 12.749 4.89181L7.1059 10.2612C6.77127 10.5796 6.22873 10.5796 5.8941 10.2612L0.250971 4.89181C-0.0836563 4.57341 -0.0836563 4.05719 0.250971 3.7388Z"
										fill="#E8E8F2"
										fillOpacity="0.8"
									/>
								</svg>
							</DisclosureButton>
							<DisclosurePanel>
								<ul className="">
									{members.map(
										({ name, role, imageFilename }) => {
											return (
												<li className="" key={name}>
													<img
														className=""
														src={`/member-avatars/${imageFilename}`}
														alt=""
														width={48}
														height={48}
													/>
													<div className="">
														<span className="">
															{name}
														</span>
														<span className="">
															{role}
														</span>
													</div>
												</li>
											);
										}
									)}
								</ul>
							</DisclosurePanel>
						</Disclosure>
					);
				})}
			</div>
			<div className="bg-neutral-800 p-3">
				<h3 className="uppercase text-2xl py-3">Special thanks</h3>
				<ul className="">
					<li>
						<b>cortz</b>, <b>Alyeska</b>, and <b>Dimbreath</b> for
						their help in the early stages of development (this was like 3 websites ago)
					</li>
					<li>
						<b>Kengxxiao</b> for their{" "}
						<a
							className="emphasized-link"
							href="https://github.com/Kengxxiao/ArknightsGameData"
							target="_blank"
							rel="noreferrer noopener"
						>
							Arknights game data repository
						</a>
					</li>
					<li>
						<b>Jetroyz</b> for translations of not-yet-released
						operator skills and talents
					</li>
					<li>
						<b>Aceship</b> for Arknights assets and community
						support
					</li>
				</ul>
			</div>
		</div>
	);
};

export default About;
