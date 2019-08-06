import * as React from 'react';
import { PasswordField } from '../../../form/common';
import { WiredField } from '../../../form/formik';

export const FirstPage = () => {
  return (
    <>
      <h3>Community Passwort</h3>
      <WiredField
        horizontal={true}
        component={(p: any) => <PasswordField {...p} autofocus />}
        name={'community_pw'}
        label={'Community Passwort'}
        placeholder={'Dieses erhältst du von der Einsatzleitung welche dich berechtigt einen Account zu eröffnen'}
      />
    </>
  );
};
