import { Formik, FormikActions } from 'formik';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import Button from 'reactstrap/lib/Button';
import Form from 'reactstrap/lib/Form';
import * as yup from 'yup';
import { PasswordField } from '../form/common';
import { WiredField } from '../form/formik';
import IziviContent from '../layout/IziviContent';
import { ApiStore } from '../stores/apiStore';
import { DomainStore } from '../stores/domainStore';
import { MainStore } from '../stores/mainStore';

const TEMPLATE = {
  password: '',
  password_confirmation: '',
};

type FormValues = typeof TEMPLATE;

interface Props extends RouteComponentProps<{ reset_password_token?: string }> {
  apiStore?: ApiStore;
  mainStore?: MainStore;
}

@inject('apiStore', 'mainStore')
@observer
class ChangeForgottenPasswordInner extends React.Component<Props> {
  intl = this.props.mainStore!.intl;
  state = { success: false };

  resetSchema = yup.object({
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

  handleSubmit = async (
    values: FormValues,
    actions: FormikActions<FormValues>,
  ) => {
    try {
      await this.props.apiStore!.postForgotPassword({
        ...values,
        reset_password_token: this.props.match.params.reset_password_token!,
      });
      this.setState({ success: true, error: null });
      this.props.mainStore!.displaySuccess(
        this.intl.formatMessage({
          id: 'views.changeForgottenPassword.password_reseted',
          defaultMessage: 'Passwort zurückgesetzt',
        }),
      );
    } catch (error) {
      this.props.mainStore!.displayError(
        DomainStore.buildErrorMessage(
          error,
          this.intl.formatMessage({
            id:
              'views.changeForgottenPassword.password_reset_failed',
            defaultMessage: 'Konnte Passwort nicht zurücksetzen',
          }),
        ),
      );
    } finally {
      actions.setSubmitting(false);
    }
  }

  render() {
    return (
      <IziviContent card>
        <Formik
          initialValues={TEMPLATE}
          validationSchema={this.resetSchema}
          onSubmit={this.handleSubmit}
          render={(formikProps) => (
            <Form onSubmit={formikProps.handleSubmit}>
              <h2>Passwort zurücksetzen</h2>
              <WiredField
                component={PasswordField}
                name={'password'}
                label={this.intl.formatMessage({
                  id: 'views.changeForgottenPassword.password',
                  defaultMessage: 'Passwort',
                })}
                placeholder={this.intl.formatMessage({
                  id:
                    'views.changeForgottenPassword.new_password',
                  defaultMessage: 'Neues Passwort',
                })}
              />
              <WiredField
                component={PasswordField}
                name={'password_confirmation'}
                label={this.intl.formatMessage({
                  id:
                    'views.changeForgottenPassword.confirm_password',
                  defaultMessage: 'Passwort bestätigen',
                })}
                placeholder={this.intl.formatMessage({
                  id:
                    'views.changeForgottenPassword.confirm_new_password',
                  defaultMessage: 'Neues Passwort bestätigen',
                })}
              />
              <Button
                color={'primary'}
                disabled={formikProps.isSubmitting || this.state.success}
                onClick={formikProps.submitForm}
              >
                <FormattedMessage
                  id="views.changeForgottenPassword.save"
                  defaultMessage="Speichern"
                />
              </Button>
            </Form>
          )}
        />
      </IziviContent>
    );
  }
}

export const ChangeForgottenPassword = withRouter(ChangeForgottenPasswordInner);
