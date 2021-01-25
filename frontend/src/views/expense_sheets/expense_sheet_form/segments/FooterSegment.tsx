import * as React from 'react';
import { CheckboxField } from '../../../../form/CheckboxField';
import { TextField } from '../../../../form/common';
import CurrencyField from '../../../../form/CurrencyField';
import { WiredField } from '../../../../form/formik';
import { MainStore } from '../../../../stores/mainStore';
import { expenseSheetFormSegment } from './expenseSheetFormSegment';

export const FooterSegment = expenseSheetFormSegment(
  ({ mainStore }: { mainStore: MainStore }) => (
    <>
      <WiredField
        horizontal
        component={CheckboxField}
        name={'ignore_first_day'}
        label={
          mainStore.intl.formatMessage({
            id: 'views.expense_sheets.FooterSegment.ignore_first_day',
            defaultMessage: 'Erster Tag nicht speziell behandeln',
          })
        }
      />
      <WiredField
        horizontal
        component={CheckboxField}
        name={'ignore_last_day'}
        label={
          mainStore.intl.formatMessage({
            id: 'views.expense_sheets.FooterSegment.ignore_last_day',
            defaultMessage: 'Letzter Tag nicht speziell behandeln',
          })
        }
      />
      <WiredField
        disabled
        horizontal
        component={CurrencyField}
        name={'total'}
        label={
          mainStore.intl.formatMessage({
            id: 'views.expense_sheets.FooterSegment.total',
            defaultMessage: 'Total',
          })}
      />
      <WiredField
        horizontal
        component={TextField}
        name={'bank_account_number'}
        label={
          mainStore.intl.formatMessage({
            id: 'views.expense_sheets.FooterSegment.bank_account_number',
            defaultMessage: 'Konto-Nr.',
          })}
      />
    </>
  ),
);
