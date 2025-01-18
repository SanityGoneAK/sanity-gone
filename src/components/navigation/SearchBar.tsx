import React, { useCallback, useRef, useState } from "react";

import { Combobox } from "@headlessui/react";
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import {
	InstantSearch,
	useHits,
	useSearchBox,
	type UseSearchBoxProps,
} from "react-instantsearch";

import { defaultLang, type Locale, localeToTag } from "~/i18n/languages.ts";
import { useTranslations } from "~/i18n/utils.ts";
import {
	operatorAvatar,
	operatorBranchIcon,
	operatorClassIcon,
} from "~/utils/images.ts";
import { slugify, subclassSlugify } from "~/utils/strings.ts";
import { cx } from "~/utils/styles.ts";

import SearchIcon from "../icons/SearchIcon.tsx";

import type { BaseHit } from "instantsearch.js";
import type { ui } from "~/i18n/ui.ts";
import type {
	SearchResult,
	ClassSearchResult,
	BranchSearchResult,
	OperatorSearchResult,
} from "~/types/output-types.ts";

interface Props {
	locale: Locale;
	placeholder: string;
	onSelected?: () => void;
}

const { searchClient } = instantMeiliSearch(
	import.meta.env.PUBLIC_MEILISEARCH_URL,
	import.meta.env.PUBLIC_MEILISEARCH_KEY
);

const queryHook: UseSearchBoxProps["queryHook"] = (query, search) => {
	search(query);
};

const CustomSearchInput: React.FC<{
	placeholder: string;
	inputRef: React.RefObject<HTMLInputElement>;
}> = ({ placeholder, inputRef }) => {
	const { query, refine } = useSearchBox({
		queryHook,
	});

	function setQuery(newQuery: string) {
		refine(newQuery);
	}

	return (
		<Combobox.Input
			autoComplete="off"
			autoCorrect="off"
			autoCapitalize="off"
			type="search"
			ref={inputRef}
			placeholder={placeholder ?? "Search"}
			aria-label="Search operators and guides"
			className="search-input h-full w-full bg-[transparent] text-neutral-100 outline-0 placeholder:leading-4 placeholder:text-neutral-200 focus-visible:outline-none"
			onChange={(event) => {
				setQuery(event.currentTarget.value);
			}}
		/>
	);
};

const CustomHits: React.FC<{
	onSelected?: (options: SearchResult) => void;
	locale: Locale;
}> = ({ onSelected, locale }) => {
	const { hits, results, sendEvent } = useHits<BaseHit & SearchResult>();

	const operatorResults: OperatorSearchResult[] = [];
	const classResults: (ClassSearchResult | BranchSearchResult)[] = [];

	const rarityClasses = {
		6: "text-orange",
		5: "text-yellow",
		4: "text-purple",
		3: "text-blue",
		2: "",
		1: "",
	};
	const t = useTranslations(locale as keyof typeof ui);

	hits.forEach((result) => {
		if (result.type === "operator") {
			operatorResults.push(result);
		} else {
			classResults.push(result);
		}
	});

	const handleOptionSelected = useCallback(
		(option: SearchResult | null) => {
			if (!option) return;

			return onSelected && onSelected(option);
		},
		[locale, onSelected]
	);

	return (
		<Combobox.Options<"div">
			as="div"
			className="absolute left-[-1px] top-[calc(100%+1px)] z-50 m-0 flex w-full flex-col overflow-hidden rounded-b border border-neutral-400 bg-neutral-500 p-0 w-[calc(100%+2px)] md:w-[32rem]"
		>
			{operatorResults.length > 0 && (
				<ul
					role="group"
					aria-labelledby="search-results-classes"
					className="m-0 list-none p-0"
				>
					<li
						role="presentation"
						id="search-results-classes"
						className="flex h-9 items-center bg-neutral-500 pl-4 text-sm leading-[18px] text-neutral-200"
					>
						{t("nav.operators")}
					</li>
					{operatorResults.slice(0, 5).map((result) => (
						<Combobox.Option<"li", SearchResult | null>
							className="grid h-16 grid-cols-[auto_1fr] grid-rows-[repeat(2,_min-content)] content-center gap-x-4 pl-4 aria-disabled:opacity-25 data-[headlessui-state~='active']:bg-neutral-400 [&:aria-disabled=true]:opacity-25 [&:not([aria-disabled=true])]:cursor-pointer hover:[&:not([aria-disabled=true])]:bg-neutral-400"
							key={result.charId}
							value={result}
							onClick={() => handleOptionSelected(result)}
						>
							<img
								className="row-span-2 h-10 rounded bg-neutral-600 object-contain"
								alt=""
								src={operatorAvatar(result.charId)}
								width={40}
								height={40}
							/>
							<span className="text-neutral-100">
								{result.name[localeToTag[locale]]}
							</span>
							<p className="text-sm leading-[18px] text-neutral-200">
								<span
									className={cx(
										"inline-block w-6 text-neutral-100",
										rarityClasses[
											result.rarity as keyof typeof rarityClasses
										]
									)}
								>
									{result.rarity}★
								</span>
								<span>
									{t("operators." + result.class?.toLowerCase() as keyof (typeof ui)[typeof defaultLang])}&nbsp; •&nbsp;{" "}
									{result.subclass[localeToTag[locale]]}
								</span>
							</p>
						</Combobox.Option>
					))}
				</ul>
			)}
			{classResults.length > 0 && (
				<ul
					role="group"
					aria-labelledby="search-results-classes"
					className="m-0 list-none p-0"
				>
					<li
						role="presentation"
						id="search-results-classes"
						className="flex h-9 items-center bg-neutral-500 pl-4 text-sm leading-[18px] text-neutral-200"
					>
						{t("nav.classes")}
					</li>
					{classResults.slice(0, 3).map((result) => (
						<Combobox.Option<"li", SearchResult | null>
							className="grid h-16 grid-cols-[auto_1fr] grid-rows-[repeat(2,_min-content)] content-center gap-x-4 pl-4 aria-disabled:opacity-25 data-[headlessui-state~='active']:bg-neutral-400 [&:aria-disabled=true]:opacity-25 [&:not([aria-disabled=true])]:cursor-pointer hover:[&:not([aria-disabled=true])]:bg-neutral-400"
							key={
								"subProfession" in result
									? result.subProfession
									: result.class
							}
							value={result}
							onClick={() => handleOptionSelected(result)}
						>
							<img
								className="row-span-2 h-10 rounded object-contain"
								alt=""
								src={
									result.type === "class"
										? operatorClassIcon(
												result.class.toLowerCase()
											)
										: operatorBranchIcon(
												result.subProfession
											)
								}
								width={40}
								height={40}
							/>
							<span className="text-neutral-100">
								{result.type === "class"
									? // TODO might wanna localize this first part
										result.name
									: result.name[localeToTag[locale]]}
							</span>
							<span className="text-sm leading-[18px] text-neutral-200">
								{result.type === "class"
									? t('operators.index.filters.class')
									: `${t("operators." + result.class?.toLowerCase() as keyof (typeof ui)[typeof defaultLang])} ${t('operators.index.filters.branch')}`}
							</span>
						</Combobox.Option>
					))}
				</ul>
			)}
			{hits.length === 0 && (
				<Combobox.Option<"li", SearchResult | null>
					className="flex h-9 items-center bg-neutral-500 pl-2 text-sm leading-[18px] text-neutral-200"
					value={null}
				>
					No results found!
				</Combobox.Option>
			)}
		</Combobox.Options>
	);
};

const SearchBar: React.FC<Props> = ({ locale, placeholder }) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const onSelected = (option: SearchResult) => {
		if (!option) {
			return;
		}

		if (option.type === "operator") {
			window.location.href = `/${locale}/operators/${slugify(
				option.name.en_US ?? ""
			)}`;
		} else if (option.type === "class") {
			window.location.href = `/${locale}/operators#${slugify(
				option.class
			)}`;
		} else {
			window.location.href = `/${locale}/operators#${slugify(
				option.class ?? ""
			)}-${subclassSlugify(option.name.en_US ?? "")}`;
		}
	};

	return (
		<div className="flex h-full w-full items-center px-3 md:pl-6">
			<form
				role="search"
				className="relative flex h-9 flex-grow flex-row items-center rounded border border-neutral-100/[0]
				px-4 focus-within:border-neutral-200/[0.9] focus-within:bg-neutral-500 md:w-[32rem] md:flex-grow-0
				focus-within:[&:has(input[data-open])]:rounded-b-none hover:[&:not(:focus-within)]:bg-neutral-500"
				onClick={() => inputRef.current?.focus()}
			>
				<SearchIcon className="mr-4" />
				<Combobox<SearchResult> immediate onChange={onSelected}>
					{({ activeOption }) => (
						// @ts-expect-error react19 error
						<InstantSearch
							future={{ preserveSharedStateOnUnmount: true }}
							searchClient={searchClient}
							indexName={import.meta.env.PUBLIC_MEILISEARCH_INDEX}
						>
							<CustomSearchInput
								placeholder={placeholder}
								// @ts-expect-error react19 error
								inputRef={inputRef}
							/>
							<CustomHits
								onSelected={onSelected}
								locale={locale}
							/>
						</InstantSearch>
					)}
				</Combobox>
			</form>
		</div>
	);
};

export default SearchBar;
