export const horseOptions = ["담운마", "금표마", "백룡마", "현풍마", "적토마"] as const;

export type HorseName = (typeof horseOptions)[number];

export const horseEnhancementOptions = [0, 1, 2, 3, 4, 5] as const;

export const headArmorJobs = ["유비", "조조", "손권"] as const;

export function canEquipHeadArmor(job: string | null | undefined) {
  return headArmorJobs.includes(job as (typeof headArmorJobs)[number]);
}
