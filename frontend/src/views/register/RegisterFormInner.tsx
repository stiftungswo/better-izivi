import { FormikProps } from 'formik';
import * as React from 'react';
import { PagedForm } from './PagedForm';
import { RegisterFormPages } from './pages';
import { FormValues } from './RegisterForm';

export const RegisterFormInner = (props: FormikProps<FormValues> & { currentPage: number }) => {
  const { currentPage, ...formikProps} = props;

  return <PagedForm formikProps={formikProps} currentPage={currentPage} pages={RegisterFormPages}/>;
};
