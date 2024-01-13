import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "~/components/ui/Dropdown";

interface Props {
	languages: {
		[localePath: string]: {
			url: string;
			label: string;
		};
	};
	currentLanguage: string;
}

const LanguageSwitcher: React.FC<Props> = ({ languages, currentLanguage }) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="flex w-full items-center gap-2 rounded-lg bg-neutral-600 px-3 py-2 text-left leading-4 text-neutral-50 ">
					<svg
						width={16}
						height={16}
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g
							clipPath="url(#prefix__clip0_5668_4533)"
							stroke="#E8E8F2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M8 14.667A6.667 6.667 0 108 1.333a6.667 6.667 0 000 13.334zM1.333 8h13.334" />
							<path d="M8 1.333A10.2 10.2 0 0110.667 8 10.2 10.2 0 018 14.667 10.2 10.2 0 015.333 8 10.2 10.2 0 018 1.333z" />
						</g>
						<defs>
							<clipPath id="prefix__clip0_5668_4533">
								<path fill="#fff" d="M0 0h16v16H0z" />
							</clipPath>
						</defs>
					</svg>
					{languages[currentLanguage].label}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-neutral-600 shadow-md">
				{Object.entries(languages).map(([localePath, language]) => (
					<DropdownMenuItem key={localePath} asChild>
						<a className="cursor-pointer" href={language.url}>
							{language.label}
						</a>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default LanguageSwitcher;
