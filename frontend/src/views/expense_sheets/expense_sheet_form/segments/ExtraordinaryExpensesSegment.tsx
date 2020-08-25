import * as React from 'react';
import { TextField } from '../../../../form/common';
import CurrencyField from '../../../../form/CurrencyField';
import { WiredField } from '../../../../form/formik';
import { MainStore } from '../../../../stores/mainStore';
import { expenseSheetFormSegment } from './expenseSheetFormSegment';

export const ExtraordinaryExpensesSegment = expenseSheetFormSegment(
  ({ mainStore }: { mainStore: MainStore }) => (
    <>
      <WiredField
        horizontal
        component={CurrencyField}
        name={'extraordinary_expenses'}
        label={
          mainStore.intl.formatMessage({
            id: 'views.expense_sheets.ExtraordinaryExpensesSegment.extraordinary_expenses',
            defaultMessage: 'Ausserordentliche Spesen',
          })
        }
      />
      <WiredField
        horizontal
        component={TextField}
        name={'extraordinary_expenses_comment'}
        label={
          mainStore.intl.formatMessage({
            id: 'views.expense_sheets.ExtraordinaryExpensesSegment.extraordinary_expenses_comment',
            defaultMessage: 'Bemerkung',
          })
        }
      />
    </>
  ),
);
