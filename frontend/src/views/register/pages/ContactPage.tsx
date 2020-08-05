import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { NumberField, TextField } from '../../../form/common';
import { WiredField } from '../../../form/formik';

export const ContactPage = () => {
  const intl = useIntl();

  return (
    <>
      <h3>
        <FormattedMessage
          id="izivi.frontend.register.contactPage.title"
          defaultMessage="Kontaktinformationen"
        />
      </h3>
      <br />
      <WiredField
        horizontal={true}
        component={TextField}
        name={'phone'}
        label={
          intl.formatMessage({
            id: 'izivi.frontend.register.contactPage.telephone',
            defaultMessage: 'Telefon',
          })
        }
        placeholder={'079 123 45 67'}
      />
      <WiredField
        horizontal={true}
        component={TextField}
        name={'address'}
        label={
          intl.formatMessage({
            id: 'izivi.frontend.register.contactPage.address',
            defaultMessage: 'Adresse',
          })
        }
        placeholder={
          intl.formatMessage({
            id: 'izivi.frontend.register.contactPage.address_placeholder',
            defaultMessage: 'Strasse, Hausnummer',
          })
        }
      />
      <WiredField
        horizontal={true}
        component={TextField}
        name={'city'}
        label={
          intl.formatMessage({
            id: 'izivi.frontend.register.contactPage.city',
            defaultMessage: 'Stadt',
          })
        }
        placeholder={
          intl.formatMessage({
            id: 'izivi.frontend.register.contactPage.city_placeholder',
            defaultMessage: 'Stadt',
          })
        }
      />
      <WiredField
        horizontal={true}
        component={NumberField}
        name={'zip'}
        label={
          intl.formatMessage({
            id: 'izivi.frontend.register.contactPage.zip',
            defaultMessage: 'Postleitzahl',
          })
        }
        placeholder={
          intl.formatMessage({
            id: 'izivi.frontend.register.contactPage.zip_placeholder',
            defaultMessage: 'z.B. 8000',
          })
        }
      />
      <WiredField
        horizontal={true}
        component={TextField}
        name={'hometown'}
        label={
          intl.formatMessage({
            id: 'izivi.frontend.register.contactPage.hometown',
            defaultMessage: 'Heimatort',
          })
        }
        placeholder={
          intl.formatMessage({
            id: 'izivi.frontend.register.contactPage.hometown_placeholder',
            defaultMessage: 'Heimatort',
          })
        }
      />
    </>
  );
};
