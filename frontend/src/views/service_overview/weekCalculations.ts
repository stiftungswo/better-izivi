import moment from 'moment';

/*
 * Pure ISO-week range helpers for the service overview ("Planung") page.
 *
 * Extracted from ServiceOverview.tsx so the week 53 boundary logic (ticket #0000541)
 * can be unit tested without mounting the full mobx/react component tree.
 */

// Sentinel returned when a service's ISO week-year is later than the displayed year,
// i.e. the service continues past the last displayed week.
export const END_WEEK_BEYOND_YEAR = 55;

// Sentinel returned when a service's ISO week-year is earlier than the displayed year,
// i.e. the service already started before the first displayed week.
export const START_WEEK_BEFORE_YEAR = -1;

export function getStartWeek(beginning: moment.MomentInput, fetchYear: number): number {
  const beginningMoment = moment(beginning);
  if (beginningMoment.isoWeekYear() < fetchYear) {
    return START_WEEK_BEFORE_YEAR;
  }
  if (beginningMoment.isoWeekYear() > fetchYear) {
    return END_WEEK_BEYOND_YEAR;
  }
  return beginningMoment.isoWeek();
}

export function getEndWeek(ending: moment.MomentInput, fetchYear: number): number {
  const endingMoment = moment(ending);
  if (endingMoment.isoWeekYear() > fetchYear) {
    return END_WEEK_BEYOND_YEAR;
  }
  if (endingMoment.isoWeekYear() < fetchYear) {
    return START_WEEK_BEFORE_YEAR;
  }
  return endingMoment.isoWeek();
}

export function isWeekStartWeek(week: number, startWeek: number): boolean {
  return week === startWeek;
}

export function isWeekMiddleWeek(week: number, startWeek: number, endWeek: number): boolean {
  return week > startWeek && week < endWeek;
}

export function isWeekEndWeek(week: number, endWeek: number): boolean {
  return week === endWeek;
}

export function isWeekDuringService(week: number, startWeek: number, endWeek: number): boolean {
  return isWeekStartWeek(week, startWeek) || isWeekMiddleWeek(week, startWeek, endWeek) || isWeekEndWeek(week, endWeek);
}

export function getTotalWeeksInYear(fetchYear: number): number {
  // January 4th always belongs to ISO week 1 of the ISO week-year matching its own calendar
  // year (that's the ISO 8601 definition of a year's first week), so this has no dependency
  // on the real-world "today" at all - unlike an approach anchored on moment() (the live
  // today-date) or on an injected reference date, either of which can disagree with fetchYear
  // in ways that silently produce the wrong week count depending on which day this runs, or
  // which specific date is passed in.
  return moment(`${fetchYear}-01-04`, 'YYYY-MM-DD').isoWeeksInYear();
}

export function getFirstDisplayedMonday(fetchYear: number): Date {
  // Same January 4th anchor as getTotalWeeksInYear, for the same reason: anchoring on
  // moment() (the live today-date) and only overwriting its calendar year can land on a date
  // whose ISO week-year doesn't match fetchYear at all (e.g. real "today" 2026-12-29 with
  // fetchYear 2025 produces 2025-12-29, which is ISO week 1 of 2026, not 2025), shifting the
  // month/week headers built from it by a full year on those specific real-world dates.
  return moment(`${fetchYear}-01-04`, 'YYYY-MM-DD').isoWeekday(1).toDate();
}
