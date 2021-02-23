import * as React from 'react';
import { SelectField, TextField } from '../../form/common';
import { DatePickerField } from '../../form/DatePickerField';
import { WiredField } from '../../form/formik';
import { MainStore } from '../../stores/mainStore';

export const HolidayTableRow = (params: { buttons: React.ReactElement[], mainStore: MainStore }) => {
  const { buttons } = params;
  const { mainStore } = params;

  return (
    <tr>
      <td>
        <WiredField component={DatePickerField} name={'beginning'} />
      </td>
      <td>
        <WiredField component={DatePickerField} name={'ending'} />
      </td>
      <td>
        <WiredField
          component={SelectField}
          name={'holiday_type_id'}
          options={[
            {
              id: 'company_holiday',
              name: mainStore.intl.formatMessage({
                id: 'views.holidays.holidayTableRow.company_holiday',
                defaultMessage: 'Betriebsferien',
              }),
            },
            {
              id: 'public_holiday',
              name: mainStore.intl.formatMessage({
                id: 'views.holidays.holidayTableRow.public_holiday',
                defaultMessage: 'Feiertag',
              }),
            },
          ]}
        />
      </td>
      <td>
        <WiredField
          style={{display: 'inline'}}
          component={TextField}
          name={'description'}
        />
      </td>

      {buttons.map((button, index) => <td key={`button-${index}`}>{button}</td>)}
    </tr>
  );
};
