import * as React from 'react';
import { TextField } from '../../../../form/common';
import CurrencyField from '../../../../form/CurrencyField';
import { WiredField } from '../../../../form/formik';
import { MainStore } from '../../../../stores/mainStore';
import { expenseSheetFormSegment } from './expenseSheetFormSegment';

export const DrivingExpensesSegment = expenseSheetFormSegment(
  ({ mainStore }: { mainStore: MainStore }) => (
    <>
      <WiredField
        horizontal
        component={CurrencyField}
        name={'driving_expenses'}
        label={
          mainStore.intl.formatMessage({
            id: 'views.expense_sheets.DrivingExpensesSegment.driving_expenses',
            defaultMessage: 'Fahrspesen',
          })
        }
      />
      <WiredField
        horizontal
        component={TextField}
        name={'driving_expenses_comment'}
        label={
          mainStore.intl.formatMessage({
            id: 'views.expense_sheets.DrivingExpensesSegment.driving_expenses_comment',
            defaultMessage: 'Bemerkung',
          })
        }
      />
    </>
  ),
);
