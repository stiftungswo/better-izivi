import { END_WEEK_BEYOND_YEAR, START_WEEK_BEFORE_YEAR, getEndWeek, getStartWeek, isWeekDuringService } from './weekCalculations';

// Ticket #0000541: a service ending Mon-Thu of a year's 53rd ISO week (e.g. 2026-12-31)
// was only shown/summed for its first week, while ending on the Fri-Sun of that same
// ISO week (e.g. 2027-01-01 / 2027-01-03) worked. Root cause: the old code compared
// calendar `.year()` against fetchYear instead of `.isoWeekYear()`, and those disagree
// exactly across that boundary.
const FETCH_YEAR_2026 = 2026;

function activeWeeksOfService(beginning: string, ending: string, fetchYear: number): number[] {
  const startWeek = getStartWeek(beginning, fetchYear);
  const endWeek = getEndWeek(ending, fetchYear);
  const weeks: number[] = [];
  for (let week = 1; week <= 53; week++) {
    if (isWeekDuringService(week, startWeek, endWeek)) {
      weeks.push(week);
    }
  }
  return weeks;
}

describe('weekCalculations regression: ISO week 53 boundary (ticket #0000541)', () => {
  it('includes all weeks up to Thursday 2026-12-31 (previously only showed the first week)', () => {
    expect(activeWeeksOfService('2026-12-07', '2026-12-31', FETCH_YEAR_2026)).toEqual([50, 51, 52, 53]);
  });

  it('still includes all weeks when ending Sunday 2026-12-27 (was already correct)', () => {
    expect(activeWeeksOfService('2026-12-07', '2026-12-27', FETCH_YEAR_2026)).toEqual([50, 51, 52]);
  });

  it('still includes all weeks when ending Friday 2027-01-01 (was already correct)', () => {
    expect(activeWeeksOfService('2026-12-07', '2027-01-01', FETCH_YEAR_2026)).toEqual([50, 51, 52, 53]);
  });

  it('still includes all weeks when ending Sunday 2027-01-03 (same ISO week 53 as 2026-12-31)', () => {
    expect(activeWeeksOfService('2026-12-07', '2027-01-03', FETCH_YEAR_2026)).toEqual([50, 51, 52, 53]);
  });

  it('treats an ending that truly rolls into the next ISO week-year as extending through the displayed year', () => {
    // 2027-01-04 is ISO week 1 of 2027 -> the service continues past the last displayed week.
    expect(getEndWeek('2027-01-04', FETCH_YEAR_2026)).toBe(END_WEEK_BEYOND_YEAR);
    expect(activeWeeksOfService('2026-12-07', '2027-01-04', FETCH_YEAR_2026)).toEqual([50, 51, 52, 53]);
  });

  it('treats a beginning that truly precedes the displayed ISO week-year as starting before the year', () => {
    // 2025-12-28 is ISO week 52 of 2025 -> before fetchYear 2026 starts.
    expect(getStartWeek('2025-12-28', FETCH_YEAR_2026)).toBe(START_WEEK_BEFORE_YEAR);
  });

  it('treats a beginning in late December that already belongs to ISO week 1 of fetchYear as starting in week 1', () => {
    // 2025-12-29 is ISO week 1 of ISO week-year 2026, despite its calendar year still being 2025.
    expect(getStartWeek('2025-12-29', FETCH_YEAR_2026)).toBe(1);
  });

  it('treats a beginning that truly starts after the displayed ISO week-year as not yet active (CodeRabbit finding)', () => {
    // 2025-12-29 through 2026-01-05 is entirely within ISO week-year 2026, so for
    // fetchYear 2025 this service hasn't started yet and shouldn't show as active at all.
    expect(getStartWeek('2025-12-29', 2025)).toBe(END_WEEK_BEYOND_YEAR);
    expect(activeWeeksOfService('2025-12-29', '2026-01-05', 2025)).toEqual([]);
  });

  it('treats an ending that truly precedes the displayed ISO week-year as already over (CodeRabbit finding)', () => {
    // 2025-12-01 through 2025-12-28 is entirely within ISO week-year 2025, so for
    // fetchYear 2026 this service already ended and shouldn't show as active at all.
    expect(getEndWeek('2025-12-28', 2026)).toBe(START_WEEK_BEFORE_YEAR);
    expect(activeWeeksOfService('2025-12-01', '2025-12-28', 2026)).toEqual([]);
  });
});
