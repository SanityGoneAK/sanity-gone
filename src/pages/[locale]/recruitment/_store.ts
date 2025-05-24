import enRecruitmentJson from "data/en_US/recruitment.json";
import jpRecruitmentJson from "data/ja_JP/recruitment.json";
import krRecruitmentJson from "data/ko_KR/recruitment.json";
import cnRecruitmentJson from "data/zh_CN/recruitment.json";
import type { Locale } from "~/i18n/languages.ts";
import { serverStore } from "~/pages/[locale]/_store.ts";
import { computed } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";


const recruitmentMap: Record<"CN"|"Global", any> = {
  Global: enRecruitmentJson,
  CN: cnRecruitmentJson
};


export const $recruitment = computed(
  [serverStore], (server) => {
    return recruitmentMap[server];
  });

export const TAG_GROUPS = {
  aceship: {
    profession: [1, 2, 3, 4, 5, 6, 7, 8],
    position: [9, 10],
    qualification: [17, 14, 11],
    affix: [12, 13, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
  },
  krooster: {
    rarity: [11, 14, 17, 28],
    position: [9, 10],
    profession: [6, 3, 1, 4, 2, 7, 5, 8],
    affix: [21, 12, 18, 19, 24, 22, 25, 15, 13, 26, 23, 27, 16, 20, 29],
  },
  akgcc: {
    rarity: [28, 17, 14, 11],
    position: [9, 10],
    profession: [8, 1, 3, 2, 6, 4, 5, 7],
    affix: [21, 12, 24, 22, 18, 19, 29, 25, 15, 13, 26, 23, 27, 16, 20]
  },
  arkntools: {
    rarity: [11, 14, 17, 28],
    profession: [1, 2, 3, 4, 5, 6, 7, 8],
    position: [9, 10],
    affix: [12, 13, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29],
  }
}

export const orderTypeStore = persistentAtom<keyof typeof TAG_GROUPS>('recruitmentOrderType', "aceship");
export const selectedOrderType = computed(orderTypeStore, (orderType) => {
  return TAG_GROUPS[orderType];
})