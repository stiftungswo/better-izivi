import * as React from 'react';
import { NumberField, TextField } from '../../../../form/common';
import { WiredField } from '../../../../form/formik';
import { MainStore } from '../../../../stores/mainStore';
import { expenseSheetFormSegment } from './expenseSheetFormSegment';

export const PaidVacationSegment = expenseSheetFormSegment(
  ({ mainStore }: { mainStore: MainStore }) => (
    <>
      <WiredField
        horizontal
        component={NumberField}
        name={'paid_vacation_days'}
        label={
          mainStore.intl.formatMessage({
            id: 'izivi.frontend.views.expense_sheets.paidVacationSegment.vacation',
            defaultMessage: 'Ferien',
          })
        }
      />
      <WiredField
        horizontal
        component={TextField}
        name={'paid_vacation_comment'}
        label={
          mainStore.intl.formatMessage({
            id: 'izivi.frontend.views.expense_sheets.paidVacationSegment.comment',
            defaultMessage: 'Bemerkung',
          })
        }
      />
    </>
  ),
);
