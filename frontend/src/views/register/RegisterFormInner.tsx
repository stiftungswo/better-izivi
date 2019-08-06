import { FormikProps } from 'formik';
import * as React from 'react';
import Form from 'reactstrap/lib/Form';
import { PagedForm } from './PagedForm';
import { RegisterFormPages } from './pages';
import { FormValues } from './RegisterForm';

export const RegisterFormInner = (formikProps: FormikProps<FormValues>) => {
  return (
    <Form onSubmit={formikProps.handleSubmit}>
      <PagedForm formikProps={formikProps} pages={RegisterFormPages}/>
      <br />
    </Form>
  );
};
