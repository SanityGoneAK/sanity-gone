import { load } from "cheerio";

import axios from "./axios";
import { charSkins as cnCharSkins } from "./ArknightsGameData/zh_CN/gamedata/excel/skin_table.json";

const PRTS_BASE_URL = "https://prts.wiki";
const PRTS_OPERATOR_LIST_URL = `${PRTS_BASE_URL}/w/%E5%B9%B2%E5%91%98%E4%B8%8A%E7%BA%BF%E6%97%B6%E9%97%B4%E4%B8%80%E8%A7%88`;
const PRTS_SKIN_BRAND_LIST_URL = `${PRTS_BASE_URL}/w/%E6%97%B6%E8%A3%85%E5%9B%9E%E5%BB%8A`;

export enum SkinSource {
    ContingencyContractStore = "Contingency Contract Store",
    OutfitStore = "Outfit Store",
    RedemptionCode = "Redemption Code",
    IntegratedStrategies = "Integrated Strategies",
    Event = "Event",
    RealWorldPromotion = "Real-world Promotion",
    Unknown = "Unknown",
}

export enum SkinCostTokenType {
    OriginiumPrime = "Originium Prime",
    ContingencyContractToken = "Contingency Contract Token",
}

export async function getReleaseOrderAndLimitedLookup() {
    const res = await axios.get(PRTS_OPERATOR_LIST_URL);
    const $ = load(res.data);

    const releaseDateLimitedLookup: {
        [cnName: string]: {
            isLimited: boolean;
            releaseOrder: number;
        };
    } = {};
    $("#mw-content-text tr:has(td)").each((i, el) => {
        const [
            cnName,
            _rarity,
            _releaseDateTime,
            _launchObtainSource,
            obtainSource,
            _announcement,
        ] = $(el)
            .find("td")
            .map((_, el) => $(el).text());
        releaseDateLimitedLookup[cnName] = {
            isLimited: obtainSource.startsWith("限定"),
            releaseOrder: i + 1,
        };
    });

    return releaseDateLimitedLookup;
}

export async function getSkinObtainSourceAndCosts() {
    const res = await axios.get(PRTS_SKIN_BRAND_LIST_URL);
    const $ = load(res.data);

    const brandLinks = $(".brandbtncontroler")
        .find("a")
        .map((_, el) => el.attribs.href)
        .toArray();

    const allSkinEntries = (
        await Promise.all(
            brandLinks.map(async (brandLink) => {
                const res = await axios.get(`${PRTS_BASE_URL}${brandLink}`);
                const $ = load(res.data);
                const brandSkinEntries = $("h2 + .wikitable").map((_i, el) => {
                    const cnSkinName = $(el)
                        .find("th:first")
                        // need to remove `<span>this is a live2d skin etc etc</span>`
                        .find("span")
                        .remove()
                        .end()
                        .text()
                        .trim();
                    const cnOriginalObtainSources = $(el)
                        .find('th:contains("获得途径") + td')
                        // need to remove `<span>redemption code information goes here</span>`
                        .find("span")
                        .remove()
                        .end()
                        .text()
                        .trim()
                        .split("/");
                    const allObtainSources = new Set<SkinSource>();
                    cnOriginalObtainSources.forEach((cnOriginalObtainSource) => {
                        switch (cnOriginalObtainSource) {
                            case "机密圣所":
                            case "危机合约":
                                allObtainSources.add(SkinSource.ContingencyContractStore);
                                break;
                            case "采购中心":
                                allObtainSources.add(SkinSource.OutfitStore);
                                break;
                            case "兑换码":
                            case "特典兑换":
                                allObtainSources.add(SkinSource.RedemptionCode);
                                break;
                            case "集成战略":
                                allObtainSources.add(SkinSource.IntegratedStrategies);
                                break;
                            case "活动获得":
                                allObtainSources.add(SkinSource.Event);
                                break;
                            case "线下礼包":
                                allObtainSources.add(SkinSource.RealWorldPromotion);
                                break;
                            default:
                                console.warn(
                                    `Unknown obtain source: ${cnOriginalObtainSource}`
                                );
                                break;
                        }
                    });

                    let cost: number | null = null;
                    let tokenType: SkinCostTokenType | null = null;

                    if (allObtainSources.has(SkinSource.OutfitStore)) {
                        tokenType = SkinCostTokenType.OriginiumPrime;
                        const mostRecentCostTh = $(el)
                            .find(
                                'th:contains("获取时限") img[alt^="图标 源石"], th:contains("复刻时限") img[alt^="图标 源石"]'
                            )
                            .last()
                            .closest("th");
                        const rawCostString = mostRecentCostTh.find("> div").text().trim();
                        let costString = rawCostString;
                        // if the cost is listed as '18→15', return 15
                        const match = rawCostString.match(/\d+\s*→(\d+)/);
                        if (match) {
                            costString = match[1];
                        }
                        cost = Number(costString);
                        if (Number.isNaN(cost)) {
                            console.warn(`Invalid cost: ${costString}`);
                        }
                    }

                    // if `allObtainSources.has(SkinSource.ContingencyContractStore)`, then we need to find the token cost for it
                    // if not, we still need to check if this can be purchased from the contingency contract store
                    // (e.g. when event skins can later be obtained via the CC store)
                    const contingencyContractCostTh = $(el)
                        .find(
                            'th:contains("获取时限") img[alt^="图标 合约赏金"], th:contains("复刻时限") img[alt^="图标 合约赏金"], th:contains("获取时限") img[alt^="图标 晶体合约赏金"]'
                        )
                        .last()
                        .closest("th");
                    if (contingencyContractCostTh.length) {
                        allObtainSources.add(SkinSource.ContingencyContractStore);
                        tokenType = SkinCostTokenType.ContingencyContractToken;
                        const costString = contingencyContractCostTh
                            .find("> div")
                            .text()
                            .trim();
                        cost = Number(costString);
                        if (Number.isNaN(cost) || cost === 0) {
                            console.warn(`Invalid cost: ${costString}`);
                        }
                    } else if (allObtainSources.has(SkinSource.ContingencyContractStore)) {
                        // uh oh, it's a CC skin but we couldn't find the cost
                        console.warn(`Couldn't find cost for CC skin: ${cnSkinName}`)
                    }

                    let obtainSources = [...allObtainSources];
                    if (!allObtainSources.size) {
                        console.warn("Unknown obtain source");
                        obtainSources = [SkinSource.Unknown];
                    }
                    return {
                        cnSkinName,
                        obtainSources,
                        cost,
                        tokenType,
                    };
                });

                return brandSkinEntries.toArray();
            })
        )
    ).flat();

    // correlate cn skin names in order to find skinIds
    const cnSkinNameToSkinId = Object.fromEntries(
        Object.entries(cnCharSkins)
            .filter(([_, { displaySkin }]) => {
                return displaySkin.skinName != null;
            })
            // n.b. trim() is required because HG messed up and included trailing whitespace for "廊下游 "
            .map(([skinId, { displaySkin }]) => [
                displaySkin.skinName!.trim(),
                skinId,
            ])
    );

    return Object.fromEntries(
        allSkinEntries.map(({ cnSkinName, ...rest }) => {
            const skinId = cnSkinNameToSkinId[cnSkinName];
            if (skinId == null) {
                throw new Error(`Couldn't find skin ID for: ${cnSkinName}`);
            }
            return [skinId, rest];
        })
    );
}
