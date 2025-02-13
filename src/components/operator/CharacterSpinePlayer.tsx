import { operatorStore } from "~/pages/[locale]/operators/_slugstore.ts";
import { useStore } from "@nanostores/react";

import { Buffer } from "buffer";

// @ts-expect-error i am NOT importing spine's types, they are not good in the old versions
import { spine } from "~/spine/spine-player.js";
import { useEffect } from "react";
import axios from "axios";
import { baseURL, spineAtlas, spineSkel, spineSpriteSheet } from "~/utils/images.ts";

interface CharacterSpinePlayerProps {
	dynIllustId: string;
}

const specialCases: {
	[key: string]: {
		atlasUrl?: string;
		skelUrl?: string;
		pngUrl?: string;
		assetName?: string;
	};
} = {
	"dyn_illust_char_4058_pepe": {
		skelUrl: `${baseURL}/arts/dynchars/dyn_illust_char_4058_pepe.json`,
	},
	"dyn_illust_char_437_mizuki_sale#7": {
		skelUrl: `${baseURL}/unknown/spine/dyn_illust_char_437_mizuki_sale%237.skel`,
	},
	"dyn_illust_char_1020_reed2_summer#17": {
		skelUrl: `${baseURL}/arts/dynchars/dyn_illust_char_1020_reed2_summer%2317.json`,
	}
}

const CharacterSpinePlayer: React.FC<CharacterSpinePlayerProps> = (props) => {
	// const { skins } = useStore(operatorStore);
	// console.log(skins);

	// strip off the _1 or _2 from the end of the dynIllustId
	const dynIllustId = props.dynIllustId.replace(/_[12]$/, "");

	console.log(dynIllustId);

	const atlasUrl = specialCases[dynIllustId]?.atlasUrl ?? spineAtlas(dynIllustId);
	const skelUrl = specialCases[dynIllustId]?.skelUrl ?? spineSkel(dynIllustId);

	// console.log(skelUrl);

	const pngUrl = specialCases[dynIllustId]?.pngUrl ?? spineSpriteSheet(dynIllustId);
	const assetName = specialCases[dynIllustId]?.assetName ?? spineSpriteSheet(dynIllustId, true);

	useEffect(() => {
		// fetch and base64 encode the sprite sheet, to fix the issue with any hashtags in the URL

		// This implementation prevents the need to modify spine-player.js.
		// The alternative implementation is to use encodeURIComponent() on the URL path for the image in spine-player.js, line 2298.
		axios
			.get(pngUrl, { responseType: "arraybuffer" })
			.then((response) => {
				const base64 = Buffer.from(response.data, "binary").toString(
					"base64"
				);
				const spriteSheet = `data:image/png;base64,${base64}`;

				const rawDataURIs: {
					[key: string]: string;
				} = {};
				// rawDataURIs[dynIllustId + ".png"] = spriteSheet;
				rawDataURIs[assetName] = spriteSheet;

				// console.log(rawDataURIs);

				const config: {
					[key: string]: any;
				} = {
					atlasUrl: atlasUrl,
					rawDataURIs: rawDataURIs,
					premultipliedAlpha: false,
					alpha: true,
					backgroundColor: "#00000000",
					defaultMix: 0,
					fps: 60,
					// viewport: {
					// 	padLeft: 0,
					// 	padRight: 0,
					// 	padTop: 0,
					// 	padBottom: 0
					// }
				};

				if(skelUrl.endsWith(".json")) {
					config["jsonUrl"] = skelUrl;
				} else {
					config["skelUrl"] = skelUrl;
				}

				// @ts-expect-error spine
				const test = new spine.SpinePlayer("op-live2d", config);
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	return (
		<>
			<div className="h-full w-full" id="op-live2d"></div>
			<link rel="stylesheet" href="/spine-player.css" />
		</>
	);
};

export default CharacterSpinePlayer;
