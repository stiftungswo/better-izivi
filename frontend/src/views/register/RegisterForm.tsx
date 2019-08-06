import { Formik, FormikActions } from 'formik';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import * as yup from 'yup';
import { withPage } from './PagedForm';
import { withFormPersistence } from './PersistedForm';
import { RegisterFormInner } from './RegisterFormInner';

const registerSchema = yup.object({
  zdp: yup.number().required(),
  first_name: yup.string().required(),
  last_name: yup.string().required(),
  email: yup
    .string()
    .email()
    .required(),
  password: yup
    .string()
    .required()
    .min(6, 'Passwort muss mindestens 6 Zeichen sein'),
  password_confirm: yup
    .string()
    .required()
    .test('passwords-match', 'Passwörter müssen übereinstimmen', function(value) {
      return this.parent.password === value;
    }),
  community_password: yup.string().required(),
  address: yup.string().required(),
  bank_iban: yup.string().required(),
  birthday: yup.string().required(),
  city: yup.string().required(),
  zip: yup.number().required(),
  hometown: yup.string().required(),
  phone: yup.string().required(),
  health_insurance: yup.string().required(),
});

const template = {
  zdp: '',
  first_name: '',
  last_name: '',
  email: '',
  address: '',
  bank_iban: '',
  birthday: '',
  city: '',
  zip: '',
  hometown: '',
  phone: '',
  health_insurance: '',
  password: '',
  password_confirm: '',
  community_password: '',
  newsletter: true,
};

export type FormValues = typeof template;

interface RegisterFormProps extends RouteComponentProps<{ page?: string | undefined }> {
  onSubmit: (values: FormValues, formikActions: FormikActions<FormValues>) => void;
}

export const RegisterForm = ({ onSubmit, match }: RegisterFormProps) => {
  const componentOnPage = withPage(RegisterFormInner);
  const currentPage = parseInt(match.params.page!, 10) || 1;
  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={template}
      validationSchema={registerSchema}
      render={withFormPersistence('register-form')(componentOnPage(currentPage))}
    />
  );
};
