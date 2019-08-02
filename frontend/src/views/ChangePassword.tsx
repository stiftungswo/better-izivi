import { Formik, FormikActions } from 'formik';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { Form } from 'reactstrap';
import Button from 'reactstrap/lib/Button';
import * as yup from 'yup';
import { PasswordField } from '../form/common';
import { WiredField } from '../form/formik';
import IziviContent from '../layout/IziviContent';
import { ApiStore } from '../stores/apiStore';
import { DomainStore } from '../stores/domainStore';
import { MainStore } from '../stores/mainStore';

const changePasswordSchema = yup.object({
  current_password: yup.string().required('Pflichtfeld'),
  password: yup
    .string()
    .required('Pflichtfeld')
    .min(7, 'Passwort muss mindestens 7 Zeichen sein'),
  password_confirmation: yup
    .string()
    .required('Pflichtfeld')
    .min(7, 'Passwort muss mindestens 7 Zeichen sein')
    .test('passwords-match', 'Passwörter müssen übereinstimmen', function(value) {
      return this.parent.password === value;
    }),
});

const template = {
  current_password: '',
  password: '',
  password_confirmation: '',
};

type FormValues = typeof template;

interface ChangePasswordProps {
  apiStore?: ApiStore;
  mainStore?: MainStore;
}

interface ChangePasswordState {
  success: boolean;
}

@inject('apiStore', 'mainStore')
@observer
class ChangePassword extends React.Component<ChangePasswordProps, ChangePasswordState> {
  constructor(props: ChangePasswordProps) {
    super(props);
    this.state = {
      success: false,
    };
  }

  changePassword = async (values: FormValues, actions: FormikActions<FormValues>) => {
    try {
      await this.props.apiStore!.putChangePassword(values);
      this.setState({ success: true });
    } catch (error) {
      console.dir(error);
      this.props.mainStore!.displayError(
        DomainStore.buildErrorMessage(error, 'Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.')
      );
    } finally {
      actions.setSubmitting(false);
    }
  }

  render(): React.ReactNode {
    return (
      <IziviContent card title={'Passwort ändern'}>
        {this.state.success ? (
          <div>
            <p>Passwort erfolgreich geändert!</p>
          </div>
        ) : (
          <Formik
            initialValues={template}
            validationSchema={changePasswordSchema}
            onSubmit={this.changePassword}
            render={formikProps => (
              <Form onSubmit={formikProps.handleSubmit}>
                <WiredField component={PasswordField} name={'current_password'} label={'Altes Passwort'} placeholder={'*******'} />
                <WiredField component={PasswordField} name={'password'} label={'Neues Passwort'} placeholder={'*******'} />
                <WiredField
                  component={PasswordField}
                  name={'password_confirmation'}
                  label={'Neues Passwort wiederholen'}
                  placeholder={'*******'}
                />
                <Button color={'primary'} disabled={formikProps.isSubmitting} onClick={formikProps.submitForm}>
                  Passwort ändern
                </Button>
                <Button style={{ marginLeft: '10px' }} color={'danger'} onClick={() => (window.location.pathname = '/')}>
                  Abbrechen
                </Button>
              </Form>
            )}
          />
        )}
      </IziviContent>
    );
  }
}

export { ChangePassword };
