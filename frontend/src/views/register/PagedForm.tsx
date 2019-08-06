import { FormikProps } from 'formik';
import * as React from 'react';
import Button from 'reactstrap/lib/Button';
import { FormValues } from './RegisterForm';

export const PagedForm: React.FunctionComponent<{ formikProps: FormikProps<FormValues>, pages: React.ComponentType[] }> = props => {
  const { formikProps, pages } = props;
  const [index, setIndex] = React.useState(0);

  const CurrentPage = pages[index];
  const isLast = index === pages.length - 1;

  const nextButton = <Button onClick={() => setIndex(index + 1)}>Vorwärts</Button>;
  const submitButton = <Button color={'primary'} disabled={formikProps.isSubmitting} onClick={formikProps.submitForm}>Registrieren</Button>;

  return (
    <>
      <CurrentPage />
      <Button onClick={() => setIndex(index - 1)} disabled={index === 0} className={'mr-2'}>Zurück</Button>
      {isLast ? submitButton : nextButton}
    </>
  );
};
