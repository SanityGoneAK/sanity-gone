import { operatorStore } from "~/pages/[locale]/operators/_slugstore.ts";
import { useStore } from "@nanostores/react";

import { Buffer } from "buffer";

// @ts-expect-error i am NOT importing spine's types, they are not good in the old versions
import { spine } from "~/spine/spine-player.js";
import { useEffect } from "react";
import axios from "axios";
import { spineAtlas, spineSkel, spineSpriteSheet } from "~/utils/images.ts";

interface CharacterSpinePlayerProps {
	dynIllustId: string;
}

const CharacterSpinePlayer: React.FC<CharacterSpinePlayerProps> = (props) => {
	// const { skins } = useStore(operatorStore);
	// console.log(skins);

	// strip off the _1 or _2 from the end of the dynIllustId
	const dynIllustId = props.dynIllustId.replace(/_[12]$/, "");

	console.log(dynIllustId);

	useEffect(() => {
		// fetch and base64 encode the sprite sheet, to fix the issue with any hashtags in the URL

		// This implementation prevents the need to modify spine-player.js.
		// The alternative implementation is to use encodeURIComponent() on the URL path for the image in spine-player.js, line 2298.
		axios
			.get(spineSpriteSheet(dynIllustId), { responseType: "arraybuffer" })
			.then((response) => {
				const base64 = Buffer.from(response.data, "binary").toString(
					"base64"
				);
				const spriteSheet = `data:image/png;base64,${base64}`;

				const rawDataURIs: {
					[key: string]: string;
				} = {};
				// rawDataURIs[dynIllustId + ".png"] = spriteSheet;
				rawDataURIs[spineSpriteSheet(dynIllustId, true)] = spriteSheet;

				console.log(rawDataURIs);

				// @ts-expect-error spine
				const test = new spine.SpinePlayer("op-live2d", {
					atlasUrl: spineAtlas(dynIllustId),
					skelUrl: spineSkel(dynIllustId),
					rawDataURIs: rawDataURIs,
					premultipliedAlpha: false,
					alpha: true,
					backgroundColor: "#00000000",
					defaultMix: 0,
					fps: 60
				});
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	return (
		<>
			<div className="h-full w-full" id="op-live2d"></div>
			<script async></script>
			<link rel="stylesheet" href="/spine-player.css" />
		</>
	);
};

export default CharacterSpinePlayer;
