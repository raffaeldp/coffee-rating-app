// Fixed set of Tasting Questions. Labels and explanations live in messages/*.json under "tasting".
export const SCALES = ["intensity", "bitterness", "acidity", "body"] as const;
export type Scale = (typeof SCALES)[number];

// A Rating's stars: 0.5 to 5 in half-star steps
export const isValidStars = (n: number) => Number.isInteger(n * 2) && n >= 0.5 && n <= 5;

export const NOTES = ["chocolate", "nutty", "fruity", "caramel", "floral", "burnt"] as const;
export type Note = (typeof NOTES)[number];
