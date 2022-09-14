import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Alert from 'reactstrap/lib/Alert';
import Form from 'reactstrap/lib/Form';
import { CheckboxField } from '../../../form/CheckboxField';
import { SelectField, TextField } from '../../../form/common';
import { DatePickerField } from '../../../form/DatePickerField';
import { ServiceSpecificationSelect } from '../../../form/entitiySelect/ServiceSpecificationSelect';
import { WiredField } from '../../../form/formik';
import { Service } from '../../../types';
import Effect, { OnChange } from '../../../utilities/Effect';

export const ServiceModalForm = (props: { serviceDateRangeChangeHandler: OnChange<Service>, mode: 'edit' | 'create' }) => {
  const { serviceDateRangeChangeHandler, mode } = props;
  const intl = useIntl();

  return (
    <>
      <Form>
        <Alert color="info">
          <FormattedMessage
            id="views.users.serviceModalForm.note"
            defaultMessage="Du kannst entweder das gewünschte Enddatum für deinen Einsatz eingeben, und die anrechenbaren Einsatztage werden gerechnet, oder die gewünschten Einsatztage eingeben, und das Enddatum wird berechnet. In beiden Fällen musst du das Startdatum bereits eingegeben haben."
          />
        </Alert>
        <WiredField
          horizontal
          component={ServiceSpecificationSelect}
          name={'service_specification_id'}
          label={
            intl.formatMessage({
              id: 'views.users.serviceModalForm.service_specification',
              defaultMessage: 'Pflichtenheft',
            })
          }
        />
        <WiredField
          horizontal
          component={SelectField}
          name={'service_type'}
          label={
            intl.formatMessage({
              id: 'views.users.serviceModalForm.service_type',
              defaultMessage: 'Einsatzart',
            })
          }
          options={[
            { id: 'normal', name: '' },
            {
              id: 'first', name:
                intl.formatMessage({
                  id: 'views.users.serviceModalForm.first_service',
                  defaultMessage: 'Erster Einsatz',
                }),
            },
            {
              id: 'last', name:
                intl.formatMessage({
                  id: 'views.users.serviceModalForm.last_service',
                  defaultMessage: 'Letzter Einsatz',
                }),
            },
          ]}
        />
        <Effect onChange={serviceDateRangeChangeHandler} />
        <WiredField
          horizontal
          component={DatePickerField}
          name={'beginning'}
          label={
            intl.formatMessage({
              id: 'views.users.serviceModalForm.service_start',
              defaultMessage: 'Einsatzbeginn',
            })
          }
        />
        <WiredField
          horizontal
          component={DatePickerField}
          name={'ending'}
          label={
            intl.formatMessage({
              id: 'views.users.serviceModalForm.service_end',
              defaultMessage: 'Einsatzende',
            })
          }
        />
        <WiredField
          horizontal
          component={TextField}
          name={'service_days'}
          label={
            intl.formatMessage({
              id: 'views.users.serviceModalForm.service_days',
              defaultMessage: 'Einsatztage',
            })
          }
        />
        <WiredField
          horizontal
          component={CheckboxField}
          name={'first_swo_service'}
          label={
            intl.formatMessage({
              id: 'views.users.serviceModalForm.is_first_service',
              defaultMessage: 'Erster SWO Einsatz?',
            })
          }
        />
        <WiredField
          horizontal
          component={CheckboxField}
          name={'starts_on_saturday'}
          label={
            intl.formatMessage(
              {
              id: 'views.users.serviceModalForm.starts_on_saturday',
              defaultMessage: 'Zwischen\u00ADeinsatz?',
                // This translation contains the unicode of https://en.wikipedia.org/wiki/Soft_hyphen
            })
          }
        />
         <Alert color="info">
          <FormattedMessage
            id="views.users.serviceModalForm.starts_on_saturday_explanation"
            defaultMessage="Bitte nur ankreuzen, wenn du diesen Einsatz direkt nach einem anderen Zivildiensteinsatz leisten wirst. (Einsatz beginnt dann an einem Samstag.)"
          />
        </Alert>
        <WiredField
          horizontal
          component={CheckboxField}
          name={'long_service'}
          label={
            intl.formatMessage({
              id: 'views.users.serviceModalForm.is_long_service',
              defaultMessage: 'Langer Einsatz?',
            })
          }
        />
        <WiredField
          horizontal
          disabled={mode === 'edit'}
          component={CheckboxField}
          name={'probation_period'}
          label={
            intl.formatMessage({
              id: 'views.users.serviceModalForm.is_trail_service',
              defaultMessage: 'Probe-einsatz?',
            })
          }
        />
      </Form>
    </>
  );
};
