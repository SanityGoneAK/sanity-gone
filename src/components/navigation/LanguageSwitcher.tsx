import DropdownArrow from "~/components/icons/DropdownArrow";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "~/components/ui/Dropdown";

import type { Locale } from "~/i18n/languages";

interface Props {
	languages: Record<
		Locale,
		{
			url: string;
			label: string;
		}
	>;
	currentLanguage: Locale;
}

const LanguageSwitcher: React.FC<Props> = ({ languages, currentLanguage }) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="grid w-full grid-cols-[auto,1fr,auto] items-center justify-items-start">
				<svg
					width={16}
					height={16}
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g
						clipPath="url(#prefix__clip0_5668_4533)"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="stroke-neutral-50"
					>
						<path d="M8 14.667A6.667 6.667 0 108 1.333a6.667 6.667 0 000 13.334zM1.333 8h13.334" />
						<path d="M8 1.333A10.2 10.2 0 0110.667 8 10.2 10.2 0 018 14.667 10.2 10.2 0 015.333 8 10.2 10.2 0 018 1.333z" />
					</g>
					<defs>
						<clipPath id="prefix__clip0_5668_4533">
							<path
								className="fill-neutral-50"
								d="M0 0h16v16H0z"
							/>
						</clipPath>
					</defs>
				</svg>
				{languages[currentLanguage].label}
				<DropdownArrow />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuRadioGroup value={currentLanguage}>
					{Object.entries(languages).map(([localePath, language]) => (
						<DropdownMenuRadioItem
							key={localePath}
							value={localePath}
							asChild
						>
							<a href={language.url}>{language.label}</a>
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default LanguageSwitcher;
