import { FormikActions } from 'formik';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import Container from 'reactstrap/lib/Container';
import IziviContent from '../../layout/IziviContent';
import { ApiStore } from '../../stores/apiStore';
import { DomainStore } from '../../stores/domainStore';
import { MainStore } from '../../stores/mainStore';
import { CustomHistoryState } from '../Login';
import { FormValues as RegisterFormValue, RegisterForm } from './RegisterForm';
import { RegisterFormHeader } from './RegisterFormHeader';

interface RegisterProps extends RouteComponentProps<{ page?: string }, any, CustomHistoryState> {
  apiStore?: ApiStore;
  mainStore?: MainStore;
}

@inject('apiStore', 'mainStore')
@observer
export class Register extends React.Component<RegisterProps> {
  login = async (values: RegisterFormValue, actions: FormikActions<RegisterFormValue>) => {
    try {
      await this.props.apiStore!.postRegister(values);
      this.props.history.push(this.getReferrer() || '/');
      this.props.mainStore!.displaySuccess(
        this.props.mainStore!.intl.formatMessage({
          id: 'register.register.successfully_registered',
          defaultMessage: 'Erfolgreich registriert',
        }),
      );
      setTimeout(() => sessionStorage.removeItem(RegisterForm.SESSION_STORAGE_FORM_PERSISTENCE_KEY), 500);
    } catch (error) {
      this.props.mainStore!.displayError(
        DomainStore.buildErrorMessage(
          error,
          this.props.mainStore!.intl.formatMessage({
            id: 'register.register.error_during_registration',
            defaultMessage: 'Ein Fehler ist bei der Registration aufgetreten',
          }),
        ),
      );
      throw error;
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

  render(): React.ReactNode {
    return (
      <IziviContent
        card
        showBackgroundImage
        title={
          this.props.mainStore!.intl.formatMessage({
            id: 'register.register.register',
            defaultMessage: 'Registrieren',
          })
        }
      >
        <div>
          <RegisterFormHeader />
          <Container>
            <RegisterForm onSubmit={this.login} match={this.props.match} history={this.props.history} location={this.props.location} />
          </Container>
        </div>
      </IziviContent>
    );
  }
}
