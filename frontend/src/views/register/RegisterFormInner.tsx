import { FormikProps } from 'formik';
import { clamp } from 'lodash';
import * as React from 'react';
import { useIntl } from 'react-intl';
import injectSheet, { WithSheet } from 'react-jss';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import Breadcrumb from 'reactstrap/lib/Breadcrumb';
import BreadcrumbItem from 'reactstrap/lib/BreadcrumbItem';
import createStyles from '../../utilities/createStyles';
import { PagedForm } from './PagedForm';
import { getRegisterFormPages } from './pages';
import { FormValues } from './RegisterForm';

const breadcrumbStyles = () => createStyles({
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

function getBreadcrumbClassName(breadcrumbPage: number, currentPage: number, classes: any) {
  if (currentPage === breadcrumbPage) {
    return classes.activeBreadcrumb;
  } else if (breadcrumbPage < currentPage) {
    return classes.pastBreadcrumb;
  } else {
    return classes.disabledBreadcrumb;
  }
}

function getBreadcrumbItem(index: number, title: string, currentPage: number, classes: any) {
  const breadcrumbPage = index + 1;

  const className = getBreadcrumbClassName(breadcrumbPage, currentPage, classes);
  const isDisabled = className === classes.disabledBreadcrumb;

  return (
    <BreadcrumbItem
      tag="span"
      key={index}
      href={'#'}
      onClick={(event: any) => event.preventDefault()}
    >
      <Link to={isDisabled ? '#' : '/register/' + breadcrumbPage} className={className}>
        {title}
      </Link>
    </BreadcrumbItem>
  );
}

interface RegisterFormInnerProps extends WithSheet<typeof breadcrumbStyles>, RouteComponentProps<object> {
  currentPage: number;
}

const RegisterFormInnerImplementation = (props: FormikProps<FormValues> & RegisterFormInnerProps) => {
  const { currentPage, ...formikProps } = props;
  const intl = useIntl();
  const registerFormPages = getRegisterFormPages(intl);

  return (
    <>
      <Breadcrumb>
        {[...registerFormPages, { title: 'Registration' }]
          .map(({ title }, index) => getBreadcrumbItem(index, title, clamp(currentPage, 1, registerFormPages.length), props.classes))}
      </Breadcrumb>
      <PagedForm
        history={props.history}
        formikProps={formikProps}
        currentPage={currentPage}
        pages={registerFormPages.map(({ component }) => component as any)}
      />
    </>
  );
};
export const RegisterFormInner = injectSheet(breadcrumbStyles)(withRouter(RegisterFormInnerImplementation));
