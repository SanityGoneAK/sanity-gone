import { atom } from "nanostores";

export const localeStore = atom<string>(
  typeof window !== "undefined" ? (window as any).locale : "en"
);