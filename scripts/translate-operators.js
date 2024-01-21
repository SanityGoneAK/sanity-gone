import OpenAI from "openai";
import { promises as fs } from "fs";
import path from "path";

/**
 * @param {"zh_CN" | "en_US" | "ja_JP" | "ko_KR"} locale - output locale
 */
export async function translateOperators(locale) {
	if (locale === "zh_CN") {
		return;
	}

	const operatorsTlJson = await Promise.all(
		Object.entries(await import(`../data/${locale}/operators.json`))
			.filter(
				([charId, operator]) =>
					operator.serverLocales &&
					operator.serverLocales.length === 1 &&
					operator.serverLocales.some(
						(serverLocale) => serverLocale === "zh_CN"
					)
			)
			.map(async ([charId, character]) => {
				return [
					charId,
					{
						charId,
						name: character.name,
						itemUsage: await translateString(
							locale,
							character.itemUsage
						),
						itemDesc: await translateString(
							locale,
							character.itemDesc
						),
						itemObtainApproach: await translateString(
							locale,
							character.itemObtainApproach
						),
						description: await translateString(
							locale,
							character.description
						),
					},
				];
			})
	);

	fs.writeFile(
		path.join(__dirname, "../data/", locale, "operators-tl.json"),
		JSON.stringify(Object.fromEntries(await operatorsTlJson), null, 2)
	);
}

async function translateString(locale, string) {
	const localeMap = {
		en_US: "English",
		ja_JP: "Japanese",
		ko_KR: "Korean",
	};

	const localeExamples = {
		en_US: "Restores the HP of allied units and recovers <@ba.dt.element>Elemental Damage</> by 50% of ATK (can recover <@ba.dt.element>Elemental Damage</> of unhurt allied units)",
		ja_JP: "味方のHPを回復し、同時に対象に蓄積された<@ba.dt.element>元素損傷</>を自身の攻撃力の50％の値分治療する（HP最大の味方も<@ba.dt.element>元素損傷</>の治療対象となる）",
		ko_KR: "아군 유닛의 HP 회복, 동시에 공격력의 50%에 해당하는 <@ba.dt.element>원소 피해</> 회복 (부상이 없는 아군 유닛의 <@ba.dt.element>원소 피해</>도 회복 가능)",
	};

	const openai = new OpenAI({
		baseURL: "http://localhost:1234/v1",
		apiKey: "not-needed",
	});

	return (
		await openai.chat.completions.create({
			messages: [
				{
					role: "system",
					content: `You are an accurate translator of content for a game. Some of the content in game has specific formats, you will preserve this format while also translating the text accurately.
                Translate ALWAYS From Chinese to ${localeMap[locale]}. DO NOT UNDER ANY CIRCUMSTANCE add anything to the response that is not the translation of the text given.
                Translations should be in a Informal or Conversational style
				
                Some examples of translations are 
				FROM: 恢复友方单位生命，并回复相当于攻击力50%的<@ba.dt.element>元素损伤</>（可以回复未受伤友方单位的<@ba.dt.element>元素损伤</>）to
				TO: ${localeExamples[locale]}
                
                When responding do not include any formatting just the translated text`,
				},
				{
					role: "user",
					content: `${string}`,
				},
			],
		})
	).choices[0].message.content;
}
