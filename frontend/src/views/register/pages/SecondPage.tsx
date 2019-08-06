import * as React from 'react';
import { CheckboxField } from '../../../form/CheckboxField';
import { NumberField, PasswordField, TextField } from '../../../form/common';
import { WiredField } from '../../../form/formik';

export const SecondPage = () => {
  return (
    <>
      <h3>Persönliche Informationen</h3>
      <br />
      <WiredField
        horizontal={true}
        component={(p: any) => <NumberField {...p} autofocus />}
        name={'zdp'}
        label={'Zivildienstnummer (ZDP)'}
        placeholder={'Dies ist deine Zivildienst-Nummer, welche du auf deinem Aufgebot wiederfindest'}
      />
      <WiredField horizontal={true} component={TextField} name={'first_name'} label={'Vorname'} placeholder={'Dein Vorname'} />
      <WiredField horizontal={true} component={TextField} name={'last_name'} label={'Nachname'} placeholder={'Dein Nachname'} />
      <WiredField
        horizontal={true}
        component={TextField}
        name={'email'}
        label={'Email'}
        placeholder={'Wird für das zukünftige Login sowie das Versenden von Systemnachrichten benötigt'}
      />
      <WiredField
        horizontal={true}
        component={PasswordField}
        name={'password'}
        label={'Passwort (mind. 7 Zeichen)'}
        placeholder={'Passwort mit mindestens 7 Zeichen'}
      />
      <WiredField
        horizontal={true}
        component={PasswordField}
        name={'password_confirm'}
        label={'Passwort Bestätigung'}
        placeholder={'Wiederhole dein gewähltes Passwort'}
      />
      <WiredField
        horizontal={true}
        component={CheckboxField}
        name={'newsletter'}
        label={'Ja, ich möchte den SWO Newsletter erhalten'}
      />
    </>
  );
};
