import { FormikProps } from 'formik';
import { curryRight } from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import Form from 'reactstrap/lib/Form';
import { FormValues } from './RegisterForm';

interface PagedFormProps {
  formikProps: FormikProps<FormValues>;
  pages: Array<React.ComponentType<any>>;
  currentPage: number;
}

export const PagedForm: React.FunctionComponent<PagedFormProps> = props => {
  const { formikProps, pages, currentPage } = props;

  const sanitizedPage = Math.max(Math.min(currentPage, pages.length), 1);
  const CurrentPage = pages[sanitizedPage - 1];
  const isLast = currentPage === pages.length;

  const nextButton = <Link to={`/register/${sanitizedPage + 1}`}><Button>Vorwärts</Button></Link>;
  const submitButton = <Button color={'primary'} disabled={formikProps.isSubmitting} onClick={formikProps.submitForm}>Registrieren</Button>;

  return (
    <Form onSubmit={formikProps.handleSubmit}>
      <CurrentPage/>
      <Link to={`/register/${sanitizedPage - 1}`}>
        <Button disabled={sanitizedPage === 1} className={'mr-2'}>Zurück</Button>
      </Link>
      {isLast ? submitButton : nextButton}
    </Form>
  );
};

const withPageImplementation = (page: number, EnhancedComponent: React.ComponentType<any & { currentPage: number }>) =>
  (props: any) => <EnhancedComponent currentPage={page} {...props} />;

export const withPage = curryRight(withPageImplementation);
