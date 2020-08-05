import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { PasswordField } from '../../../form/common';
import { WiredField } from '../../../form/formik';

export const CommunityPasswordPage = () => {
  const intl = useIntl();

  return (
    <>
      <h3>
        <FormattedMessage
          id="izivi.frontend.register.communityPasswordPage.title"
          defaultMessage="Community Passwort"
        />
      </h3>
      <WiredField
        horizontal={true}
        component={PasswordField}
        name={'community_password'}
        className={'mt-2'}
        placeholder={
          intl.formatMessage({
            id: 'izivi.frontend.register.communityPasswordPage.community_password_info',
            defaultMessage: 'Dieses erhältst du von der Einsatzleitung welche dich berechtigt einen Account zu eröffnen',
          })
        }
      />
    </>
  );
};
