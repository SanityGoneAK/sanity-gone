import { atom } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";
import type { Locale } from "~/i18n/languages";

export const localeStore = atom<Locale>(
	typeof window !== "undefined" ? (window as any).locale : "en"
);

export const serverStore = persistentAtom<"Global" | "CN">(
	"server",
	"Global"
);
