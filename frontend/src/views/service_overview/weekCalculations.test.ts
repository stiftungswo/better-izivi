import moment from 'moment';
import {
  END_WEEK_BEYOND_YEAR,
  START_WEEK_BEFORE_YEAR,
  getEndWeek,
  getFirstDisplayedMonday,
  getStartWeek,
  getTotalWeeksInYear,
  isWeekDuringService,
} from './weekCalculations';

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

  it('marks every displayed week active for a service spanning the whole year and both boundaries at once', () => {
    // Begins before fetchYear and ends after it: START_WEEK_BEFORE_YEAR and
    // END_WEEK_BEYOND_YEAR combined should still cover every real week 1..53.
    const startWeek = getStartWeek('2025-01-01', FETCH_YEAR_2026);
    const endWeek = getEndWeek('2027-12-31', FETCH_YEAR_2026);
    expect(startWeek).toBe(START_WEEK_BEFORE_YEAR);
    expect(endWeek).toBe(END_WEEK_BEYOND_YEAR);
    const allWeeks = Array.from({ length: 53 }, (_, i) => i + 1);
    expect(activeWeeksOfService('2025-01-01', '2027-12-31', FETCH_YEAR_2026)).toEqual(allWeeks);
  });
});

describe('getTotalWeeksInYear regression: must not depend on any date other than fetchYear', () => {
  // Two prior designs both broke on this: anchoring on moment() (the live today-date) got the
  // wrong ISO week-year as its reference frame on real dates like 2022-01-01 (isoWeekYear()
  // 2021, not 2022); anchoring on an injectable referenceDate defaulting to moment() fixed
  // that but broke differently - e.g. referenceDate '2027-01-01' already has isoWeekYear()
  // 2026, so isoWeekYear(2026) was a no-op and isoWeeksInYear() picked up the stale calendar
  // year 2027, returning 52 instead of 53 (a CodeRabbit finding on this PR). Anchoring purely
  // on `${fetchYear}-01-04` (always ISO week 1 of ISO week-year fetchYear, by definition) has
  // no such external date to disagree with fetchYear in the first place.
  it('returns the correct ISO week count for known 52- and 53-week years', () => {
    expect(getTotalWeeksInYear(2026)).toBe(53);
    expect(getTotalWeeksInYear(2020)).toBe(53);
    expect(getTotalWeeksInYear(2025)).toBe(52);
    expect(getTotalWeeksInYear(2027)).toBe(52);
  });
});

describe('getFirstDisplayedMonday regression: must not depend on any date other than fetchYear', () => {
  // The old setWeekAndMonthHeaders() anchored on moment() (the live today-date), only
  // overwriting its calendar year - the same pattern that broke getNrWeeks(). E.g. real
  // "today" 2026-12-29 with fetchYear 2025 produced 2025-12-29, which is ISO week 1 of 2026,
  // not 2025 (a CodeRabbit finding on this PR), shifting month/week headers by a full year.
  it('returns the Monday of ISO week 1 for known years, matching each year\'s own ISO week-year', () => {
    const knownMondays: { [fetchYear: number]: string } = {
      2025: '2024-12-30',
      2026: '2025-12-29',
      2027: '2027-01-04',
    };
    for (const fetchYear of Object.keys(knownMondays).map(Number)) {
      const monday = moment(getFirstDisplayedMonday(fetchYear));
      expect(monday.format('YYYY-MM-DD')).toBe(knownMondays[fetchYear]);
      expect(monday.isoWeekYear()).toBe(fetchYear);
      expect(monday.isoWeek()).toBe(1);
      expect(monday.isoWeekday()).toBe(1);
    }
  });
});
