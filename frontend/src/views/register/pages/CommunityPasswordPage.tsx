import * as React from 'react';
import { PasswordField } from '../../../form/common';
import { WiredField } from '../../../form/formik';

export const CommunityPasswordPage = () => {
  return (
    <>
      <h3>Community Passwort</h3>
      <WiredField
        horizontal={true}
        component={PasswordField}
        name={'community_password'}
        className={'mt-2'}
        placeholder={'Dieses erhältst du von der Einsatzleitung welche dich berechtigt einen Account zu eröffnen'}
      />
    </>
  );
};
