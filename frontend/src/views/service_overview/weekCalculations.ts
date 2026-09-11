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
