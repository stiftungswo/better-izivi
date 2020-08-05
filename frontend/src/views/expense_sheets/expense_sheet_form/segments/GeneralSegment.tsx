import { Field } from 'formik';
import * as React from 'react';
import { NumberField } from '../../../../form/common';
import { DatePickerField } from '../../../../form/DatePickerField';
import { WiredField } from '../../../../form/formik';
import { MainStore } from '../../../../stores/mainStore';
import { Service } from '../../../../types';
import { expenseSheetFormSegment } from './expenseSheetFormSegment';

export const GeneralSegment = expenseSheetFormSegment(
  ({ service, mainStore }: { service: Service, mainStore: MainStore }) => (
    <>
      <WiredField
        horizontal
        component={DatePickerField}
        name={'beginning'}
        label={
          mainStore.intl.formatMessage({
            id: 'izivi.frontend.views.expense_sheets.GeneralSegment.beginning',
            defaultMessage: 'Start Spesenblattperiode',
          })}
      />
      <WiredField horizontal component={DatePickerField} name={'ending'} label={'Ende Spesenblattperiode'} />

      <Field
        disabled
        horizontal
        component={NumberField}
        label={
          mainStore.intl.formatMessage({
            id: 'izivi.frontend.views.expense_sheets.GeneralSegment.holiday_claim',
            defaultMessage: 'Ferienanspruch für Einsatz',
          })}
        value={service.eligible_paid_vacation_days}
      />
      <WiredField
        disabled
        horizontal
        component={NumberField}
        name={'duration'}
        label={
          mainStore.intl.formatMessage({
            id: 'izivi.frontend.views.expense_sheets.GeneralSegment.duration',
            defaultMessage: 'Dauer Spesenblattperiode',
          })}
      />
    </>
  ),
);
