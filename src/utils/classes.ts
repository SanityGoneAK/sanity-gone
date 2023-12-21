const professionLookup: Record<string, string> = {
  Vanguard: "PIONEER",
  Guard: "WARRIOR",
  Specialist: "SPECIAL",
  Defender: "TANK",
  Supporter: "SUPPORT",
  Sniper: "SNIPER",
  Medic: "MEDIC",
  Caster: "CASTER",
};

const reverseProfessionLookup = Object.fromEntries(
  Object.entries(professionLookup).map(([k, v]) => [v, k])
);

export const classToProfession = (className: string): string =>
  professionLookup[className];

export const professionToClass = (profession: string): string =>
  reverseProfessionLookup[profession];
