import * as React from 'react';
import { NumberField } from '../../../../form/common';
import { WiredField } from '../../../../form/formik';
import { MainStore } from '../../../../stores/mainStore';
import { ExpenseSheetHints } from '../../../../types';
import { expenseSheetFormSegment } from './expenseSheetFormSegment';

export const CompanyHolidaysSegment = expenseSheetFormSegment(
  ({ hints, mainStore }: { hints: ExpenseSheetHints, mainStore: MainStore }) => (
    <>
      <WiredField
        horizontal
        appendedLabels={[
          mainStore.intl.formatMessage({
            id: 'izivi.frontend.views.expense_sheets.CompanyHolidaysSegment.unpaid_company_holidays',
            defaultMessage: 'Vorschlag: {unpaidCompanyHolidays} Tage',
          }, { unpaidCompanyHolidays: hints.suggestions.unpaid_company_holiday_days },
          )]}
        component={NumberField}
        name={'unpaid_company_holiday_days'}
        label={
          mainStore.intl.formatMessage({
            id: 'izivi.frontend.views.expense_sheets.absolvedDaysBreakdownSegment.unpaid_company_holiday_days',
            defaultMessage: 'Betriebsferien (Urlaub)',
          })}
      />
      <WiredField
        horizontal
        appendedLabels={[
          mainStore.intl.formatMessage({
            id: 'izivi.frontend.views.expense_sheets.CompanyHolidaysSegment.paid_company_holidays',
            defaultMessage: 'Vorschlag: {paidCompanyHolidays} Tage',
          }, { paidCompanyHolidays: hints.suggestions.paid_company_holiday_days },
        )]}
        component={NumberField}
        name={'paid_company_holiday_days'}
        label={
          mainStore.intl.formatMessage({
            id: 'izivi.frontend.views.expense_sheets.absolvedDaysBreakdownSegment.paid_company_holiday_days',
            defaultMessage: 'Betriebsferien (Ferien)',
          })}
      />
    </>
  ),
);
