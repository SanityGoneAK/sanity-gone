import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	{
		ignores: [
			"./scripts/ArknightsGameData/**",
			"./scripts/ArknightsGameData_YoStar/**",
		],
	},
	...fixupConfigRules(
		compat.extends(
			"eslint:recommended",
			"plugin:storybook/recommended",
			"plugin:prettier/recommended",
			"plugin:import/recommended",
			"plugin:import/typescript"
		)
	),
	{
		plugins: {
			"@typescript-eslint": typescriptEslint,
			react,
			"react-hooks": fixupPluginRules(reactHooks),
			prettier: fixupPluginRules(prettier),
		},

		languageOptions: {
			parser: tsParser,
		},

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

			"react/no-unknown-property": [
				"error",
				{
					ignore: ["css"],
				},
			],

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
	},
	...compat
		.extends(
			"plugin:react/recommended",
			"plugin:@typescript-eslint/recommended"
		)
		.map((config) => ({
			...config,
			files: ["**/*.ts", "**/*.tsx"],
		})),
	{
		files: ["**/*.ts", "**/*.tsx"],

		languageOptions: {
			ecmaVersion: 5,
			sourceType: "script",

			parserOptions: {
				project: true,
			},
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
		files: ["**/*.stories.tsx"],

		rules: {
			"react-hooks/rules-of-hooks": "off",
		},
	},
];
