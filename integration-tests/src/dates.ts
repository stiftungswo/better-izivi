function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * A valid "normal" service date range: begins on a Monday, ends 25 days
 * later on a Friday (the minimum length Service#length_is_valid allows).
 * `weeksFromNow` shifts the whole range into a dedicated slice of the
 * calendar so unrelated tests never collide on the same user's services.
 */
export function normalServiceRange(weeksFromNow: number): { beginning: string; ending: string } {
  const now = new Date();
  const daysUntilNextMonday = ((1 - now.getDay() + 7) % 7) || 7;

  const beginning = new Date(now);
  beginning.setDate(now.getDate() + daysUntilNextMonday + weeksFromNow * 7);

  const ending = new Date(beginning);
  ending.setDate(beginning.getDate() + 25);

  return { beginning: toISODate(beginning), ending: toISODate(ending) };
}

export { toISODate };
