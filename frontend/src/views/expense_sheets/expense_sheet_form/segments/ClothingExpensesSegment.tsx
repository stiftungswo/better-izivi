import * as React from 'react';
import CurrencyField from '../../../../form/CurrencyField';
import { WiredField } from '../../../../form/formik';
import { MainStore } from '../../../../stores/mainStore';
import { ExpenseSheetHints } from '../../../../types';
import { expenseSheetFormSegment } from './expenseSheetFormSegment';

export const ClothingExpensesSegment = expenseSheetFormSegment(
  ({ hints, mainStore }: { hints: ExpenseSheetHints, mainStore: MainStore }) => (
    <>
      <WiredField
        horizontal
        appendedLabels={[
          mainStore.intl.formatMessage({
            id: 'views.expense_sheets.ClothingExpensesSegment.hint_clothing_expenses',
            defaultMessage: 'Vorschlag: {hintClothingExpenses} ({hintUnpaidClothingExpenseDays} Tage)',
          }, {
            hintClothingExpenses: mainStore!.formatCurrency(hints.suggestions.clothing_expenses),
            hintUnpaidClothingExpenseDays: hints.suggestions.unpaid_clothing_expenses_days,
          },
        )]}
        component={CurrencyField}
        name={'clothing_expenses'}
        label={
          mainStore.intl.formatMessage({
            id: 'views.expense_sheets.absolvedDaysBreakdownSegment.clothing_expenses',
            defaultMessage: 'Kleiderspesen',
          })}
      />
    </>
  ),
);
