import { FormikProps } from 'formik';
import { clamp } from 'lodash';
import { inject } from 'mobx-react';
import * as React from 'react';
import { IntlShape, useIntl } from 'react-intl';
import injectSheet, { WithSheet } from 'react-jss';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import Breadcrumb from 'reactstrap/lib/Breadcrumb';
import BreadcrumbItem from 'reactstrap/lib/BreadcrumbItem';
import { MainStore } from '../../stores/mainStore';
import createStyles from '../../utilities/createStyles';
import { PagedForm } from './PagedForm';
import { BankAndInsurancePage } from './pages/BankAndInsurancePage';
import { CommunityPasswordPage } from './pages/CommunityPasswordPage';
import { ContactPage } from './pages/ContactPage';
import { PersonalDetailsPage } from './pages/PersonalDetailsPage';
import { FormValues } from './RegisterForm';
import { withPageValidations } from './ValidatablePage';

const breadcrumbStyles = () =>
  createStyles({
    activeBreadcrumb: {
      color: '#1565C0',
    },
    disabledBreadcrumb: {
      'color': '#b6b6b6',
      '&:hover': {
        color: '#b6b6b6',
        textDecoration: 'none',
        cursor: 'default',
      },
    },
    pastBreadcrumb: {
      color: '#1E88E5',
    },
  });

interface RegisterFormPageType {
  title: string;
  component: any;
}

interface RegisterFormInnerProps
  extends WithSheet<typeof breadcrumbStyles>,
    RouteComponentProps<object> {
  currentPage: number;
  mainStore?: MainStore;
}

@inject('mainStore')
class RegisterFormInnerImplementation extends React.Component<
  FormikProps<FormValues> & RegisterFormInnerProps
> {
  private registerFormPages: RegisterFormPageType[];

  constructor(props: FormikProps<FormValues> & RegisterFormInnerProps) {
    super(props);
    this.registerFormPages = this.createRegisterFormPages(
      this.props.mainStore!.intl,
    );
  }

  render() {
    const { currentPage, mainStore, ...formikProps } = this.props;
    const intl = mainStore!.intl;

    return (
      <>
        <Breadcrumb>
          {[
            ...this.registerFormPages,
            {
              title: intl.formatMessage({
                id:
                  'izivi.frontend.register.registerFormInner.registration',
                defaultMessage: 'Registration',
              }),
            },
          ].map(({ title }, index) =>
            this.getBreadcrumbItem(
              index,
              title,
              clamp(currentPage, 1, this.registerFormPages.length),
              this.props.classes,
            ),
          )}
        </Breadcrumb>
        <PagedForm
          history={this.props.history}
          formikProps={formikProps}
          currentPage={currentPage}
          pages={this.registerFormPages.map(
            ({ component }) => component as any,
          )}
        />
      </>
    );
  }

  private createRegisterFormPages(intl: IntlShape) {
    return [
      {
        title: intl.formatMessage({
          id: 'izivi.frontend.register.registerFormInner.community_password',
          defaultMessage: 'Community Passwort',
        }),
        component: withPageValidations(['community_password'])(
          CommunityPasswordPage,
        ),
      },
      {
        title: intl.formatMessage({
          id: 'izivi.frontend.register.registerFormInner.personal_information',
          defaultMessage: 'Persönliche Informationen',
        }),
        component: withPageValidations([
          'zdp',
          'regional_center_id',
          'first_name',
          'last_name',
          'email',
          'birthday',
          'password',
          'password_confirm',
          'newsletter',
        ])(PersonalDetailsPage),
      },
      {
        title: intl.formatMessage({
          id: 'izivi.frontend.register.registerFormInner.contact_information',
          defaultMessage: 'Kontakinformationen',
        }),
        component: withPageValidations([
          'phone',
          'address',
          'city',
          'zip',
          'hometown',
        ])(ContactPage),
      },
      {
        title: intl.formatMessage({
          id:
            'izivi.frontend.register.registerFormInner.bank_and_insurance_information',
          defaultMessage: 'Bank- und Versicherungsinformationen',
        }),
        component: withPageValidations(['bank_iban', 'health_insurance'])(
          BankAndInsurancePage,
        ),
      },
    ];
  }

  private getBreadcrumbClassName(
    breadcrumbPage: number,
    currentPage: number,
    classes: any,
  ) {
    if (currentPage === breadcrumbPage) {
      return classes.activeBreadcrumb;
    } else if (breadcrumbPage < currentPage) {
      return classes.pastBreadcrumb;
    } else {
      return classes.disabledBreadcrumb;
    }
  }

  private getBreadcrumbItem(
    index: number,
    title: string,
    currentPage: number,
    classes: any,
  ) {
    const breadcrumbPage = index + 1;

    const className = this.getBreadcrumbClassName(
      breadcrumbPage,
      currentPage,
      classes,
    );
    const isDisabled = className === classes.disabledBreadcrumb;

    return (
      <BreadcrumbItem
        tag="span"
        key={index}
        href={'#'}
        onClick={(event: any) => event.preventDefault()}
      >
        <Link
          to={isDisabled ? '#' : '/register/' + breadcrumbPage}
          className={className}
        >
          {title}
        </Link>
      </BreadcrumbItem>
    );
  }
}

export const RegisterFormInner = injectSheet(breadcrumbStyles)(
  withRouter(RegisterFormInnerImplementation),
);
