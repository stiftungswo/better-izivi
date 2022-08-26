import * as React from 'react';
import { FormattedMessage} from 'react-intl';
import Button from 'reactstrap/lib/Button';
import { NumberField, TextField } from '../../../../form/common';
import { WiredField } from '../../../../form/formik';
import { MainStore } from '../../../../stores/mainStore';
import { ExpenseSheetHints, SickDaysDime } from '../../../../types';
import { expenseSheetFormSegment } from './expenseSheetFormSegment';

type func = (value: string) => void;

export const AbsolvedDaysBreakdownSegment = expenseSheetFormSegment(
  ({ hints, sickDays, mainStore, onSaveSickDays, buttonDeactive }:
   { hints: ExpenseSheetHints, sickDays: SickDaysDime, mainStore: MainStore, buttonDeactive: boolean, onSaveSickDays: func }) => (
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
        <WiredField
          disabled
          horizontal
          component={TextField}
          name={'sick_days_dime'}
          value={sickDays.sick_days}
          label={
            mainStore.intl.formatMessage({
              id: 'views.expense_sheets.absolvedDaysBreakdownSegment.sick_days_dime',
              defaultMessage: 'Anzahl Krankheitstage eingetragen im Dime',
            })}
        />
        <Button
          key={'submitButton'}
          color={'success'}
          disabled={buttonDeactive}
          onClick={() => onSaveSickDays(sickDays.sick_days)}
        >
          <FormattedMessage
            id="views.expense_sheets.expenseSheetFormButtons.save_dime_sick_days"
            defaultMessage="Krankheitstage aus Dime übernehmen"
          />
        </Button>
      </>
    ),
);
