const jetSkillDescriptionRegex =
	/{{(?<tagName>[^}]+)}(:(?<formatString>[0-9.%f]+))?}/;

/**
 * Jetroyz's skill translations use a strange description syntax that doesn't match
 * what is used in gamedata/excel/skill_table.json. This function converts Jetroyz's
 * ad-hoc description syntax to one that matches the gamedata.
 *
 * @param description - the original description
 * @returns a description that conforms to gamedata description syntax
 */
export function fixJetSkillDescriptionTags(description: string) {
	let newDescription = description;
	// need to convert tag formatting used in Jet's TL json data
	// from e.g. {{attack@atk_scale}:.0%} to {attack@atk_scale:0%}
	// to match formatting used in skill_table.json
	let match: RegExpMatchArray | null = null;
	do {
		match = jetSkillDescriptionRegex.exec(newDescription);
		if (match?.groups) {
			const { tagName, formatString } = match.groups;

			let newFormatString: string | null = null;
			if (formatString === ".0%") {
				newFormatString = "0%";
			} else if (formatString === ".0f") {
				newFormatString = null;
			} else if (formatString != null) {
				newFormatString = formatString;
			}

			newDescription = newDescription.replace(
				jetSkillDescriptionRegex,
				`{${tagName}${newFormatString ? `:${newFormatString}` : ""}}`
			);
		}
	} while (match);
	return newDescription;
}
