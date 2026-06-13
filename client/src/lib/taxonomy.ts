// Single source of truth for recipe categorization.
// COURSES are Title Case (stored in the `category` column, used as section headings
// and the form dropdown). CUISINES / DIETARY are lowercase to match the existing
// `tags[]` data and the chips' `capitalize` styling.

export const COURSES = [
  'Breakfast',
  'Mains',
  'Soups & Salads',
  'Sides',
  'Appetizers & Snacks',
  'Desserts',
  'Baking',
  'Drinks',
  'Sauces & Basics',
] as const;
export type Course = (typeof COURSES)[number];

export const CUISINES = [
  'italian',
  'french',
  'mexican',
  'american',
  'chinese',
  'japanese',
  'korean',
  'thai',
  'vietnamese',
  'indian',
  'middle eastern',
  'mediterranean',
  'greek',
  'spanish',
  'caribbean',
  'other',
] as const;

export const DIETARY = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'low-carb',
  'high-protein',
] as const;

const CUISINE_SET = new Set<string>(CUISINES);
const DIETARY_SET = new Set<string>(DIETARY);

export type Facet = 'course' | 'cuisine' | 'dietary';

// Classify a freeform tag into a facet group (case-insensitive).
export function classifyTag(tag: string): 'cuisine' | 'dietary' | 'other' {
  const t = tag.trim().toLowerCase();
  if (CUISINE_SET.has(t)) return 'cuisine';
  if (DIETARY_SET.has(t)) return 'dietary';
  return 'other';
}

export const UNCATEGORIZED = 'Other';
