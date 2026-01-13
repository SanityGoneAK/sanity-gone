/* eslint-env node */
module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	extends: [
		"eslint:recommended",
		"plugin:storybook/recommended",
		"plugin:prettier/recommended",
		"plugin:import/recommended",
		"plugin:import/typescript",
	],
	plugins: ["@typescript-eslint", "react", "react-hooks", "prettier"],
	settings: {
		react: {
			version: "detect",
		},
		"import/parsers": {
			"@typescript-eslint/parser": [".ts", ".tsx"],
		},
		"import/resolver": {
			typescript: {},
		},
	},
	overrides: [
		{
			files: ["*.ts", "*.tsx"],
			extends: [
				"plugin:react/recommended",
				"plugin:@typescript-eslint/recommended",
			],
			parserOptions: {
				project: true,
			},
			rules: {
				"react/jsx-uses-react": "off",
				"react/react-in-jsx-scope": "off",
				"react/prop-types": "off",
				"@typescript-eslint/restrict-template-expressions": [
					"error",
					{
						allowNumber: true,
					},
				],

				"@typescript-eslint/no-unused-vars": [
					"warn",
					{
						varsIgnorePattern: "^_",
					},
				],
				"react-hooks/rules-of-hooks": "error",
				"react-hooks/exhaustive-deps": "warn",
				"@typescript-eslint/no-explicit-any": "off",
				"@typescript-eslint/no-non-null-assertion": "off",
			},
		},
		{
			files: ["*.stories.tsx"],
			rules: {
				"react-hooks/rules-of-hooks": "off",
			},
		},
	],
	rules: {
		"no-unused-vars": [
			"warn",
			{
				varsIgnorePattern: "^_",
			},
		],
		"prettier/prettier": [
			"warn",
			{
				endOfLine: "auto",
			},
		],
		"react/no-unknown-property": ["error", { ignore: ["css"] }],
		"eol-last": "warn",
		"import/order": [
			"warn",
			{
				"newlines-between": "always",
				groups: [
					"builtin",
					"external",
					"internal",
					["parent", "sibling", "index"],
					["object", "type", "unknown"],
				],
				pathGroups: [
					{
						pattern: "react",
						group: "builtin",
					},
					{
						pattern: "react-dom",
						group: "builtin",
					},
				],
				pathGroupsExcludedImportTypes: [],
				alphabetize: {
					order: "asc",
					caseInsensitive: true,
				},
			},
		],
	},
};
