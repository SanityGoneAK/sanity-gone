export const serverLookup: Record<string, string> = {
    zh: "Chinese",
    en: "English",
    jp: "Japanese",
    kr: "Korean",
};
const reverseServerLookup = Object.fromEntries(
    Object.entries(serverLookup).map(([k, v]) => [v, k])
);

export const localeToServer = (locale: string): string =>
    serverLookup[locale];

export const serverToLocale = (server: string): string =>
    reverseServerLookup[server];
