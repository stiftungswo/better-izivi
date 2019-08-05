import { Formik, FormikActions } from 'formik';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Button from 'reactstrap/lib/Button';
import Container from 'reactstrap/lib/Container';
import Form from 'reactstrap/lib/Form';
import * as yup from 'yup';
import { CheckboxField } from '../../form/CheckboxField';
import { NumberField, PasswordField, TextField } from '../../form/common';
import { WiredField } from '../../form/formik';
import IziviContent from '../../layout/IziviContent';
import { ApiStore } from '../../stores/apiStore';
import { MainStore } from '../../stores/mainStore';
import { RegisterFormHeader } from './RegisterFormHeader';

const registerSchema = yup.object({
  zdp: yup.number().required(),
  first_name: yup.string().required(),
  last_name: yup.string().required(),
  email: yup
    .string()
    .email()
    .required(),
  password: yup
    .string()
    .required()
    .min(7, 'hi'),
  password_confirm: yup
    .string()
    .required()
    .test('passwords-match', 'Passwörter müssen übereinstimmen', function(value) {
      return this.parent.password === value;
    }),
  community_pw: yup.string().required(),
});

const template = {
  zdp: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirm: '',
  community_pw: '',
  newsletter: true,
};

type FormValues = typeof template;

interface RegisterProps extends RouteComponentProps {
  apiStore?: ApiStore;
  mainStore?: MainStore;
}

@inject('apiStore', 'mainStore')
@observer
class Register extends React.Component<RegisterProps> {
  login = async (values: FormValues, actions: FormikActions<FormValues>) => {
    try {
      await this.props.apiStore!.postRegister(values);
      this.props.history.push(this.getReferrer());
    } catch ({ error }) {
      if (error.toString().includes('400')) {
        this.props.mainStore!.displayError('Ungültiger Benutzername/Passwort');
      } else {
        this.props.mainStore!.displayError('Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
      }
    } finally {
      actions.setSubmitting(false);
    }
  }

  getReferrer() {
    const { state, search } = this.props.location;
    // check for referer in router state (from ProtectedRoute in index.js)
    if (state && state.referrer) {
      return state.referrer;
    }

    // check for the old 'path' query parameter
    const query = new URLSearchParams(search);
    const apiStore = this.props.apiStore!;

    if (query.has('path')) {
      let url = query.get('path');
      if (url && url.startsWith('/login')) {
        url = apiStore.isAdmin ? '/' : '/profile';
      }
      return url;
    }
    return apiStore.isAdmin ? '/' : '/profile';
  }

  render(): React.ReactNode {
    return (
      <IziviContent card showBackgroundImage title={'Registrieren'}>
        <div>
          <RegisterFormHeader/>
          <Container>
            <hr />
            <Formik
              initialValues={template}
              validationSchema={registerSchema}
              onSubmit={this.login}
              render={formikProps => (
                <Form onSubmit={formikProps.handleSubmit}>
                  <h3>Persönliche Informationen</h3>
                  <br />
                  <WiredField
                    horizontal={true}
                    component={NumberField}
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
                    component={PasswordField}
                    name={'community_pw'}
                    label={'Community Passwort'}
                    placeholder={'Dieses erhältst du von der Einsatzleitung welche dich berechtigt einen Account zu eröffnen'}
                  />
                  <WiredField
                    horizontal={true}
                    component={CheckboxField}
                    name={'newsletter'}
                    label={'Ja, ich möchte den SWO Newsletter erhalten'}
                  />
                  <Button color={'primary'} disabled={formikProps.isSubmitting} onClick={formikProps.submitForm}>
                    Registrieren
                  </Button>
                  <br />
                </Form>
              )}
            />
          </Container>
        </div>
      </IziviContent>
    );
  }
}

export { Register };
