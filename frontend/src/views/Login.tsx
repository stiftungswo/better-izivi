import { Formik, FormikActions } from 'formik';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import Form from 'reactstrap/lib/Form';
import * as yup from 'yup';
import { PasswordField, TextField } from '../form/common';
import { WiredField } from '../form/formik';
import IziviContent from '../layout/IziviContent';
import { ApiStore } from '../stores/apiStore';
import { MainStore } from '../stores/mainStore';

const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const template = {
  email: '',
  password: '',
};

type FormValues = typeof template;

interface Props extends RouteComponentProps<any, any, CustomHistoryState> {
  apiStore?: ApiStore;
  mainStore?: MainStore;
}

export interface CustomHistoryState {
  referrer: string;
}

@inject('apiStore', 'mainStore')
@observer
export class Login extends React.Component<Props> {
  intl = this.props.mainStore!.intl;

  login = async (values: FormValues, actions: FormikActions<FormValues>) => {
    try {
      await this.props.apiStore!.postLogin(values);
      this.props.history.push(this.getReferrer() || '/');
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(error);
      if (error.messages != null && error.messages.error != null) {
        this.props.mainStore!.displayError(error.messages.error); // display errors messages from the server
      } else if (error.error != null && error.error.message != null) {
        this.props.mainStore!.displayError(error.error.message); // display error messages from the connection request
      } else if (
        error.error != null &&
        error.error.toString().includes('400')
      ) {
        this.props.mainStore!.displayError(
          this.intl.formatMessage({
            id: 'views.login.invalid_password_or_username',
            defaultMessage: 'Ungültiger Benutzername/Passwort',
          }),
        );
      } else {
        this.props.mainStore!.displayError(
          this.intl.formatMessage({
            id: 'views.login.internal_error_try_again_later',
            defaultMessage:
              'Ein interner Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
          }),
        );
      }
    } finally {
      actions.setSubmitting(false);
    }
  }

  getReferrer() {
    const { state, search } = this.props.location;
    // check for referrer in router state (from ProtectedRoute in index.js)
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

  render() {
    return (
      <IziviContent card showBackgroundImage>
        <Formik
          initialValues={template}
          validationSchema={loginSchema}
          onSubmit={this.login}
          render={(formikProps) => (
            <Form onSubmit={formikProps.handleSubmit}>
              <h2 className="form-signin-heading">
                <FormattedMessage
                  id="views.login.login"
                  defaultMessage="Anmelden"
                />
              </h2>
              <WiredField
                component={TextField}
                name={'email'}
                label={this.intl.formatMessage({
                  id: 'views.login.email',
                  defaultMessage: 'Email',
                })}
                placeholder={'zivi@example.org'}
              />
              <WiredField
                component={PasswordField}
                name={'password'}
                label={this.intl.formatMessage({
                  id: 'views.login.password',
                  defaultMessage: 'Passwort',
                })}
                placeholder={'****'}
              />
              <Button
                color={'primary'}
                disabled={formikProps.isSubmitting}
                onClick={formikProps.submitForm}
                type="submit"
              >
                <FormattedMessage
                  id="views.login.login"
                  defaultMessage="Anmelden"
                />
              </Button>
            </Form>
          )}
        />
        <p>
          <Link to="/users/password/reset">
            <FormattedMessage
              id="views.login.forgot_password"
              defaultMessage="Passwort vergessen?"
            />
          </Link>
        </p>
      </IziviContent>
      /*<LoadingView loading={this.state.loading} error={this.state.error} />*/
    );
  }
}
