import defaultSlugify from "slugify";
export function toTitleCase(string: string) {
	return `${string.charAt(0).toUpperCase()}${string.slice(1).toLowerCase()}`;
}
export function slugify(someString: string) {
	return defaultSlugify(someString, { lower: true, remove: /[']/g });
}

// custom slugify exclusively for subclasses in the URL
// (preserves dashes and nukes spaces, which regular slugify cannot do w/ just options)
export function subclassSlugify(toSlug: string): string {
	return toSlug.toLowerCase().replace(/[^a-z\d-]/g, "_");
}
