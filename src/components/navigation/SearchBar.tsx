import React, { useCallback, useRef, useState } from "react";
import { Combobox } from "@headlessui/react";
import SearchIcon from "../icons/SearchIcon.tsx";
import type { SearchResult } from "../../types/output-types.ts";
import { clsx as cx } from "clsx";
import {
	InstantSearch,
	useHits,
	useSearchBox,
	type UseSearchBoxProps,
} from "react-instantsearch";
import type { BaseHit } from "instantsearch.js";
import { slugify, subclassSlugify } from "../../utils/strings.ts";
import algoliasearch from "algoliasearch/lite";
import type {
	ClassSearchResult,
	BranchSearchResult,
	OperatorSearchResult,
} from "../../types/output-types.ts";
import {
	operatorAvatar,
	operatorBranchIcon,
	operatorClassIcon,
} from "../../utils/images.ts";

interface Props {
	placeholder: string;
	onSelected?: () => void;
}

const searchClient = algoliasearch(
	import.meta.env.PUBLIC_ALGOLIA_APP_ID,
	import.meta.env.PUBLIC_ALGOLIA_PUBLIC
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
			className="search-input bg-[transparent] outline-0 w-full h-full text-neutral-100 focus-visible:outline-none placeholder:text-neutral-200 placeholder:leading-4"
			onChange={(event) => {
				setQuery(event.currentTarget.value);
			}}
		/>
	);
};

const CustomHits: React.FC<{ onSelected?: () => void }> = ({ onSelected }) => {
	const { hits, results, sendEvent } = useHits<BaseHit & SearchResult>();

	let operatorResults: OperatorSearchResult[] = [];
	let classResults: (ClassSearchResult | BranchSearchResult)[] = [];

	const rarityClasses = {
		6: "text-orange",
		5: "text-yellow",
		4: "text-purple",
		3: "text-blue",
		2: "",
		1: "",
	};

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

			if (option.type === "operator") {
				window.location.href = `/operators/${slugify(
					option.name.en_US ?? ""
				)}`;
			} else if (option.type === "class") {
				window.location.href = `/operators#${slugify(option.class)}`;
			} else {
				window.location.href = `/operators#${slugify(
					option.class.en_US ?? ""
				)}-${subclassSlugify(option.name.en_US ?? "")}`;
			}
			onSelected && onSelected();
		},
		[onSelected]
	);

	return (
		<Combobox.Options<"div">
			as="div"
			className="flex absolute flex-col top-[calc(100%+1px)] w-full left-[-1px] m-0 p-0 bg-neutral-500 rounded-b border border-neutral-400 overflow-hidden"
		>
			{operatorResults.length > 0 && (
				<ul
					role="group"
					aria-labelledby="search-results-classes"
					className="list-none m-0 p-0"
				>
					<li
						role="presentation"
						id="search-results-classes"
						className="h-9 pl-4 flex items-center bg-neutral-500 text-sm leading-[18px] text-neutral-200"
					>
						Operators
					</li>
					{operatorResults.slice(0, 5).map((result) => (
						<Combobox.Option<"li", SearchResult | null>
							className="h-16 pl-4 grid hover:[&:not([aria-disabled=true])]:bg-neutral-400 data-[headlessui-state~='active']:bg-neutral-400 aria-disabled:opacity-25 grid-cols-[auto_1fr] grid-rows-[repeat(2,_min-content)] content-center gap-x-4 [&:aria-disabled=true]:opacity-25 [&:not([aria-disabled=true])]:cursor-pointer"
							key={result.charId}
							value={result}
							onClick={() => handleOptionSelected(result)}
						>
							<img
								className="h-10 rounded object-contain row-span-2 bg-neutral-600"
								alt=""
								src={operatorAvatar(result.charId)}
								width={40}
								height={40}
							/>
							<span className="text-neutral-100">
								{result.name.en_US}
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
									{result.class}&nbsp; •&nbsp;{" "}
									{result.subclass.en_US}
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
					className="list-none m-0 p-0"
				>
					<li
						role="presentation"
						id="search-results-classes"
						className="h-9 pl-4 flex items-center bg-neutral-500 text-sm leading-[18px] text-neutral-200"
					>
						Classes
					</li>
					{classResults.slice(0, 3).map((result) => (
						<Combobox.Option<"li", SearchResult | null>
							className="h-16 pl-4 grid hover:[&:not([aria-disabled=true])]:bg-neutral-400 data-[headlessui-state~='active']:bg-neutral-400 aria-disabled:opacity-25 grid-cols-[auto_1fr] grid-rows-[repeat(2,_min-content)] content-center gap-x-4 [&:aria-disabled=true]:opacity-25 [&:not([aria-disabled=true])]:cursor-pointer"
							key={
								"subProfession" in result
									? result.subProfession
									: result.class
							}
							value={result}
							onClick={() => handleOptionSelected(result)}
						>
							<img
								className="h-10 rounded object-contain row-span-2"
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
									? result.name
									: result.name.en_US}
							</span>
							<span className="text-sm leading-[18px] text-neutral-200">
								{result.type === "class"
									? "Class"
									: `${result.class.en_US} Branch`}
							</span>
						</Combobox.Option>
					))}
				</ul>
			)}
			{hits.length === 0 && (
				<Combobox.Option<"li", SearchResult | null>
					className="h-9 pl-2 flex items-center bg-neutral-500 text-sm leading-[18px] text-neutral-200"
					value={null}
				>
					No results found!
				</Combobox.Option>
			)}
		</Combobox.Options>
	);
};

const SearchBar: React.FC<Props> = ({ placeholder, onSelected }) => {
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<div className="flex items-center h-full w-full px-3 sm:pl-6">
			<form
				role="search"
				className="relative flex flex-row items-center w-[512px] h-9 rounded-[18px] border-neutral-100/[0] bg-neutral-400/[0.33] px-4 border hover:[&:not(:focus-within)]:border-neutral-200/[0.8] focus-within:border-neutral-100/[0.9] focus-within:[&:has(input[data-headlessui-state='open'])]:rounded-b-none"
				onClick={() => inputRef.current?.focus()}
			>
				<SearchIcon className="mr-4" />
				<Combobox<SearchResult>>
					{({ activeOption }) => (
						<InstantSearch
							searchClient={searchClient}
							indexName={import.meta.env.PUBLIC_ALGOLIA_INDEX}
						>
							<CustomSearchInput
								placeholder={placeholder}
								inputRef={inputRef}
							/>
							<CustomHits onSelected={onSelected} />
						</InstantSearch>
					)}
				</Combobox>
			</form>
		</div>
	);
};

export default SearchBar;
