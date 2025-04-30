import { atom, computed } from "nanostores";

import enOperatorsJson from "data/en_US/operators.json";
import jpOperatorsJson from "data/ja_JP/operators.json";
import krOperatorsJson from "data/ko_KR/operators.json";
import cnOperatorsJson from "data/zh_CN/operators.json";
import { localeStore } from "~/pages/[locale]/_store.ts";

import type { Locale } from "~/i18n/languages";
import type * as OutputTypes from "~/types/output-types.ts";

const operatorsMap: Record<Locale, any> = {
	en: enOperatorsJson,
	ko: krOperatorsJson,
	ja: jpOperatorsJson,
	"zh-cn": cnOperatorsJson,
};

export const operatorStore = atom<OutputTypes.Operator>(
	typeof window !== "undefined" ? (window as any).operator : ""
);
