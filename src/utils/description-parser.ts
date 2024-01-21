import XRegExp from "xregexp";

import type { MatchRecursiveValueNameMatch } from "xregexp";

export interface InterpolatedValue {
	key: string;
	value: number;
	[otherProperties: string]: unknown;
}

// can't use import {...} for this CJS module in Vite
// eslint-disable-next-line import/no-named-as-default-member
const { matchRecursive } = XRegExp;

const descriptionTagLeftDelim = "<(?:@ba\\.|\\$|@cc\\.)[^>]+>";
const descriptionTagRightDelim = "</>";

const descriptionInterpolationRegex =
	/-?{-?(?<interpolationKey>[^}:]+)(?::(?<formatString>[^}]+))?}/;
/**
 * converts game-internal skill description representations into an html-formatted description.
 * there are three tag types that are all closed with "</>":
 * - <@ba.vup>: value up, for increases
 * - <@ba.vdown>: value down, for decreases
 * - <@ba.rem>: reminder, for reminder text
 * in addition, the "blackboard" property contains values that can be interpolated into the
 * skill description using curly braces (like {this}). the {curly brace syntax} also accepts a format string,
 * e.g. {foo:0%} will interpolate the numeric value "foo" in "blackboard" and display it as a percentage.
 */
export const descriptionToHtml = (
	description: string | null,
	interpolation: InterpolatedValue[]
): string => {
	if (!description) {
		return "";
	}

	let htmlDescription = description.slice();
	let recursiveMatch: MatchRecursiveValueNameMatch[] | null = null;
	let match: RegExpMatchArray | null = null;

	let addedClosingTags = 0;
	let forceContinue = false;

	do {
		forceContinue = false;
		try {
			recursiveMatch = matchRecursive(
				htmlDescription,
				descriptionTagLeftDelim,
				descriptionTagRightDelim,
				"g",
				{
					valueNames: [
						"between",
						"tagName",
						"tagContent",
						"closingTag",
					],
				}
			);
		} catch (e) {
			// This is a hack to get around the fact that the game sometimes
			// doesn't close its tags properly. If we encounter a tag that
			// doesn't have a closing tag, we'll just add one and try again.
			// Twice.

			// This is terrible. I'm sorry.
			console.log(`Auto-appending closing tag to ${htmlDescription}`);
			htmlDescription += "</>";
			addedClosingTags++;
			forceContinue = true;
			continue;
		}

		if (addedClosingTags >= 2) {
			throw new Error(`Couldn't parse description: ${description}`);
		}

		if (recursiveMatch.length > 0) {
			let resultingString = "";
			for (let i = 0; i < recursiveMatch.length; i++) {
				if (recursiveMatch[i].name === "between") {
					resultingString += recursiveMatch[i].value;
				} else if (recursiveMatch[i].name === "tagName") {
					const tagName = recursiveMatch[i].value.slice(1, -1);
					let className = "";
					switch (tagName) {
						// @ba are used on operator information
						case "@ba.vup":
							className = "value-up";
							break;
						case "@ba.vdown":
							className = "value-down";
							break;
						case "@ba.rem":
							className = "reminder-text";
							break;
						case "@ba.kw":
							className = "keyword";
							break;
						case "@ba.talpu":
							className = "potential";
							break;
						case "@ba.dt.element":
							className = "elemental-damage";
							break;
						// @cc tags are used for base
						case "@cc.vup":
							className = "base-value-up";
							break;
						case "@cc.vdown":
							className = "base-value-down";
							break;
						case "@cc.rem":
							className = "base-reminder-text";
							break;
						case "@cc.kw":
							className = "base-keyword";
							break;
						default:
							// some @ tag we don't recognize
							if (tagName.slice(0, 1) === "@") {
								console.warn(`Unrecognized tag: ${tagName}`);
							}
							// $cc - base tooltip
							// (i.e. Ursus Student Self-Governing Group / Perception Information)
							// you can click on them to view a base tooltip
							if (tagName.slice(0, 3) === "$cc") {
								className = "base-tooltip";
								break;
							}
							// $ and not $cc (so it's a tooltip in a skill, usually statuses)
							// you can click on them to view a tooltip (i.e. Bind)
							className = "skill-tooltip";
							break;
					}
					resultingString += `<span class="${className}">`;
				} else if (recursiveMatch[i].name === "tagContent") {
					resultingString += recursiveMatch[i].value;
				} else if (recursiveMatch[i].name === "closingTag") {
					resultingString += "</span>";
				}
			}

			htmlDescription = resultingString;
		}
	} while (forceContinue || (recursiveMatch?.length ?? 0 > 0));

	// replace any newlines with <br> tags to get past HTML whitespace collapsing
	htmlDescription = htmlDescription
		.replace(/\n/g, "<br>")
		.replace(/<\/br>/g, "<br>")
		.replace(/<(?!\/?span)(?!br)([^>]+)>/g, "&lt;$1&gt;");

	do {
		match = descriptionInterpolationRegex.exec(htmlDescription);
		if (match?.groups) {
			const key = match.groups.interpolationKey?.toLowerCase();
			const value = interpolation.find(
				(value) => value.key?.toLowerCase() === key
			)?.value;
			if (!value) {
				throw new Error(
					`Couldn't find matching interpolation key: ${key}`
				);
			}
			let interpolated = "";
			const { formatString } = match.groups;
			if (typeof formatString === "undefined") {
				interpolated = `${value}`;
			} else if (formatString === "0%") {
				// convert to percentage and suffix with "%"
				interpolated = `${Math.round(value * 100)}%`;
			} else if (formatString === "0.0") {
				// return as-is to one-decimal place
				interpolated = `${value.toFixed(1)}`;
			} else if (formatString === "0") {
				// return as an integer
				interpolated = `${value.toFixed(0)}`;
			} else {
				console.warn(
					`Unrecognized format string: ${match.groups.formatString}`
				);
			}
			htmlDescription = htmlDescription.replace(
				descriptionInterpolationRegex,
				interpolated
			);
		}
	} while (match);

	return htmlDescription;
};
