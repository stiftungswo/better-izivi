import * as React from 'react';
import { useIntl } from 'react-intl';
import { NumberField } from '../../../../form/common';
import { WiredField } from '../../../../form/formik';
import { MainStore } from '../../../../stores/mainStore';
import { ExpenseSheetHints } from '../../../../types';
import { expenseSheetFormSegment } from './expenseSheetFormSegment';

export const AbsolvedDaysBreakdownSegment = expenseSheetFormSegment(
  ({ hints, mainStore }: { hints: ExpenseSheetHints, mainStore: MainStore }) => (
      <>
        <WiredField
          horizontal
          appendedLabels={[
            mainStore.intl.formatMessage({
              id: 'views.expense_sheets.absolvedDaysBreakdownSegment.work_days_sugestion',
              defaultMessage: 'Vorschlag: {workDaysSuggestion} Tage',
            }, { workDaysSuggestion: hints.suggestions.work_days },
            )]}
          component={NumberField}
          name={'work_days'}
          label={
            mainStore.intl.formatMessage({
              id: 'views.expense_sheets.absolvedDaysBreakdownSegment.worked',
              defaultMessage: 'Gearbeitet',
            })}
        />
        <WiredField
          horizontal
          appendedLabels={[
            mainStore.intl.formatMessage({
              id: 'views.expense_sheets.absolvedDaysBreakdownSegment.free_days_suggestion',
              defaultMessage: 'Vorschlag: {freeDaysSuggestion} Tage',
            }, { freeDaysSuggestion: hints.suggestions.workfree_days },
            )]}
          component={NumberField}
          name={'workfree_days'}
          label={
            mainStore.intl.formatMessage({
              id: 'views.expense_sheets.absolvedDaysBreakdownSegment.workfree',
              defaultMessage: 'Arbeitsfrei',
            })}
        />
        <WiredField
          horizontal
          appendedLabels={[
            mainStore.intl.formatMessage({
              id: 'views.expense_sheets.absolvedDaysBreakdownSegment.remaining_sick_days',
              defaultMessage: 'Übriges Guthaben: {remainingSickDays} Tage',
            }, { remainingSickDays: hints.remaining_days.sick_days },
            )]}
          component={NumberField}
          name={'sick_days'}
          label={
            mainStore.intl.formatMessage({
              id: 'views.expense_sheets.absolvedDaysBreakdownSegment.sick',
              defaultMessage: 'Krank',
            })}
        />
      </>
    ),
);
