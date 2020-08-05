import * as React from 'react';
import { NumberField, TextField } from '../../../../form/common';
import { WiredField } from '../../../../form/formik';
import { MainStore } from '../../../../stores/mainStore';
import { expenseSheetFormSegment } from './expenseSheetFormSegment';

export const UnpaidVacationSegment = expenseSheetFormSegment(
  ({ mainStore }: { mainStore: MainStore }) => (
    <>
      <WiredField
        horizontal
        component={NumberField}
        name={'unpaid_vacation_days'}
        label={
          mainStore.intl.formatMessage({
            id: 'izivi.frontend.views.expense_sheets.unpaidVacationSegment.vacation',
            defaultMessage: 'Persönlicher Urlaub',
          })
        }
      />
      <WiredField
        horizontal
        component={TextField}
        name={'unpaid_vacation_comment'}
        label={
          mainStore.intl.formatMessage({
            id: 'izivi.frontend.views.expense_sheets.unpaidVacationSegment.comment',
            defaultMessage: 'Bemerkung',
          })
        }
      />
    </>
  ),
);
