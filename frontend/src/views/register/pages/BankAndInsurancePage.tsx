import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { TextField } from '../../../form/common';
import { WiredField } from '../../../form/formik';

export const BankAndInsurancePage = () => {
  const intl = useIntl();

  return (
    <>
      <h3>
        <FormattedMessage
          id="izivi.frontend.register.bankAndInsurancePage.title"
          defaultMessage="Bank- und Versicherungsinformationen"
        />
      </h3>

      <br />
      <WiredField
        horizontal={true}
        component={TextField}
        name={'bank_iban'}
        label={
          intl.formatMessage({
            id: 'izivi.frontend.register.bankAndInsurancePage.iban',
            defaultMessage: 'IBAN',
          })
        }
        placeholder={
          intl.formatMessage({
            id: 'izivi.frontend.register.bankAndInsurancePage.iban_needed',
            defaultMessage: 'Deine IBAN wird für das Auszahlen der Spesen benötigt',
          })
        }
      />
      <WiredField
        horizontal={true}
        component={TextField}
        name={'health_insurance'}
        label={
          intl.formatMessage({
            id: 'izivi.frontend.register.bankAndInsurancePage.healt_insurance',
            defaultMessage: 'Krankenkasse',
          })
        }
        placeholder={
          intl.formatMessage({
            id: 'izivi.frontend.register.bankAndInsurancePage.name_and_location_health_insurance',
            defaultMessage: 'Name & Ort der Krankenkasse',
          })
        }
      />
    </>
  );
};
