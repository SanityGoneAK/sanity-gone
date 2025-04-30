import type { APIRoute } from "astro";
import enOperatorsJson from "data/en_US/operators.json";
import krOperatorsJson from "data/ko_KR/operators.json";
import jpOperatorsJson from "data/ja_JP/operators.json";
import cnOperatorsJson from "data/zh_CN/operators.json";
import type { Locale } from "~/i18n/languages";
import type * as OutputTypes from "~/types/output-types";

const operatorsMap: Record<Locale, any> = {
	en: enOperatorsJson,
	ko: krOperatorsJson,
	ja: jpOperatorsJson,
	"zh-cn": cnOperatorsJson,
};
import { allLanguages } from "~/i18n/languages";

export const GET: APIRoute = ({ params, request }) => {
	const locale = params.locale as Locale;
	const char_id = params.id;

	const operator = operatorsMap[locale][char_id as any];
	return new Response(JSON.stringify(operator));
};

export function getStaticPaths() {
	return Object.keys(allLanguages).flatMap((lang) => {
		return Object.entries(enOperatorsJson).map(
			([operatorId, operator]: [string, OutputTypes.Operator]) => {
				return {
					params: {
						locale: lang,
						id: operator.charId,
					},
					props: { operatorId },
				};
			}
		);
	});
}
