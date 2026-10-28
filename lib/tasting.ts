// Fixed set of Tasting Questions. Labels and explanations live in messages/*.json under "tasting".
export const SCALES = ["intensity", "bitterness", "acidity", "body"] as const;
export type Scale = (typeof SCALES)[number];

export const NOTES = ["chocolate", "nutty", "fruity", "caramel", "floral", "burnt"] as const;
export type Note = (typeof NOTES)[number];
