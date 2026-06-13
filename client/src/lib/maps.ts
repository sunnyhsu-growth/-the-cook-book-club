// Pick a store type from the recipe's cuisine so the map points at a shop likely
// to carry the ingredients, then let Google Maps find the closest one "near me".
const ASIAN = new Set(['chinese', 'japanese', 'korean', 'thai', 'vietnamese']);
const MED = new Set(['middle eastern', 'mediterranean', 'greek']);

export function groceryQuery(tags: string[]): string {
  const t = (tags || []).map((x) => x.toLowerCase());
  if (t.some((x) => ASIAN.has(x))) return 'asian grocery store';
  if (t.includes('indian')) return 'indian grocery store';
  if (t.includes('mexican')) return 'mexican grocery store';
  if (t.some((x) => MED.has(x))) return 'mediterranean grocery store';
  return 'grocery store';
}

// Google Maps search centered on the user's location (Maps resolves "near me").
export function groceryMapsUrl(tags: string[]): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${groceryQuery(tags)} near me`,
  )}`;
}

// Find where to buy a single ingredient nearby.
export function ingredientMapsUrl(item: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${item} near me`,
  )}`;
}
