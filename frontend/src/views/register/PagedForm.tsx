import { FormikProps } from 'formik';
import { clamp, curryRight } from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import Form from 'reactstrap/lib/Form';
import { FormValues as RegisterFormValues } from './RegisterForm';
import { ValidatablePageRefType, WithPageValidationsProps } from './ValidatablePage';

interface PagedFormProps {
  formikProps: FormikProps<RegisterFormValues>;
  pages: Array<React.RefForwardingComponent<ValidatablePageRefType, WithPageValidationsProps>>;
  currentPage: number;
}

function getNextButton(toPage: number, currentPageIsValid: boolean, ref: React.MutableRefObject<ValidatablePageRefType | undefined>) {
  const title = currentPageIsValid ? undefined : 'Das Formular hat noch ungültige Felder';
  return (
    <Link to={`/register/${toPage}`}>
      <Button disabled={!currentPageIsValid} onClick={() => ref.current!.validateWithServer()} title={title}>Vorwärts</Button>
    </Link>
  );
}

function getSubmitButton(formikProps: FormikProps<RegisterFormValues>, currentPageIsValid: boolean) {
  return (
    <Button
      color={'primary'}
      disabled={formikProps.isSubmitting || !currentPageIsValid}
      onClick={formikProps.submitForm}
    >
      Registrieren
    </Button>
  );
}

export const PagedForm: React.FunctionComponent<PagedFormProps> = props => {
  const { formikProps, pages, currentPage } = props;
  const [currentPageIsValid, setCurrentPageValidity] = React.useState(false);
  const ref = React.useRef<ValidatablePageRefType>();

  const sanitizedPage = clamp(currentPage, 1, pages.length);
  const CurrentPageComponent = pages[sanitizedPage - 1];
  const isLast = currentPage === pages.length;

  const nextButton = getNextButton(sanitizedPage + 1, currentPageIsValid, ref);
  const submitButton = getSubmitButton(formikProps, currentPageIsValid);

  return (
    <Form onSubmit={formikProps.handleSubmit}>
      <CurrentPageComponent onValidityChange={setCurrentPageValidity} ref={ref}/>
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
