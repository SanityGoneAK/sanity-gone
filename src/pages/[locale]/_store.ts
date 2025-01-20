import { atom } from "nanostores";
import type { Locale } from "~/i18n/languages";

export const localeStore = atom<Locale>(
	typeof window !== "undefined" ? (window as any).locale : "en"
);
