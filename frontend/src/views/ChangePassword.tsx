import { Formik, FormikActions } from 'formik';
import { repeat } from 'lodash';
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

@inject('apiStore', 'mainStore')
@observer
class ChangePassword extends React.Component<ChangePasswordProps> {
  intl = this.props.mainStore!.intl;

  changePasswordSchema = yup.object({
    password: yup
      .string()
      .required(
        this.intl.formatMessage({
          id: 'views.changeForgottenPassword.mandatory_field',
          defaultMessage: 'Pflichtfeld',
        }),
      )
      .min(
        6,
        this.intl.formatMessage({
          id:
            'views.changeForgottenPassword.password_min_length',
          defaultMessage: 'Passwort muss mindestens 6 Zeichen sein',
        }),
      ),
    password_confirmation: yup
      .string()
      .required(
        this.intl.formatMessage({
          id: 'views.changeForgottenPassword.mandatory_field',
          defaultMessage: 'Pflichtfeld',
        }),
      )
      .min(
        6,
        this.intl.formatMessage({
          id:
            'views.changeForgottenPassword.password_min_length',
          defaultMessage: 'Passwort muss mindestens 6 Zeichen sein',
        }),
      )
      .test(
        'passwords-match',
        this.intl.formatMessage({
          id:
            'views.changeForgottenPassword.passwords_must_match',
          defaultMessage: 'Passwörter müssen übereinstimmen',
        }),
        function(value) {
          return this.parent.password === value;
        },
      ),
  });

  constructor(props: ChangePasswordProps) {
    super(props);
  }

  changePassword = async (
    values: FormValues,
    actions: FormikActions<FormValues>,
  ) => {
    try {
      await this.props.apiStore!.putChangePassword(values);
      this.props.mainStore!.displaySuccess(
        this.intl.formatMessage({
          id: 'views.changePassword.password_save_success',
          defaultMessage: 'Passwort wurde erfolgreich gespeichert!',
        }),
      );
    } catch (error) {
      this.displayError(error);
      throw error;
    } finally {
      actions.setSubmitting(false);
    }
  }

  render(): React.ReactNode {
    const passwordPlaceholder = repeat('*', 7);
    return (
      <IziviContent card title={'Passwort ändern'}>
        <Formik
          initialValues={template}
          validationSchema={this.changePasswordSchema}
          onSubmit={this.changePassword}
          render={(formikProps) => (
            <Form onSubmit={formikProps.handleSubmit}>
              <WiredField
                component={PasswordField}
                name={'current_password'}
                label={this.intl.formatMessage({
                  id: 'views.changePassword.old_password',
                  defaultMessage: 'Altes Passwort',
                })}
                placeholder={passwordPlaceholder}
              />
              <WiredField
                component={PasswordField}
                name={'password'}
                label={this.intl.formatMessage({
                  id: 'views.changePassword.new_password',
                  defaultMessage: 'Neues Passwort',
                })}
                placeholder={passwordPlaceholder}
              />
              <WiredField
                component={PasswordField}
                name={'password_confirmation'}
                label={this.intl.formatMessage({
                  id: 'views.changePassword.repeat_new_password',
                  defaultMessage: 'Neues Passwort wiederholen',
                })}
                placeholder={passwordPlaceholder}
              />
              <Button
                color={'primary'}
                disabled={formikProps.isSubmitting}
                onClick={formikProps.submitForm}
              >
                Passwort ändern
              </Button>
              <Button
                className={'ml-3'}
                color={'danger'}
                onClick={() => (window.location.pathname = '/')}
              >
                Abbrechen
              </Button>
            </Form>
          )}
        />
      </IziviContent>
    );
  }

  private displayError(error: any) {
    if (this.isCurrentPasswordInvalid(error)) {
      this.props.mainStore!.displayError(
        this.intl.formatMessage({
          id: 'views.changePassword.password_wrong',
          defaultMessage: 'Das eingegebene Passwort ist falsch',
        }),
      );
    } else {
      this.props.mainStore!.displayError(
        DomainStore.buildErrorMessage(
          error,
          this.intl.formatMessage({
            id:
              'views.changePassword.internal_error_try_again_later',
            defaultMessage:
              'Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
          }),
        ),
      );
    }
  }

  private isCurrentPasswordInvalid(error: any) {
    try {
      const currentPasswordError = error.messages.errors.current_password;
      return /valide?|gültig/.test(currentPasswordError);
    } catch (_error) { // tslint:disable-line:variable-name
      return false;
    }
  }
}

export { ChangePassword };
