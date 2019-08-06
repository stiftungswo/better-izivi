import { Formik, FormikActions } from 'formik';
import * as React from 'react';
import * as yup from 'yup';
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
  community_pw: yup.string().required(),
});

const template = {
  zdp: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirm: '',
  community_pw: '',
  newsletter: true,
};

export type FormValues = typeof template;

interface RegisterFormProps {
  onSubmit: (values: FormValues, formikActions: FormikActions<FormValues>) => void;
}

export const RegisterForm = ({ onSubmit }: RegisterFormProps) => {
  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={template}
      validationSchema={registerSchema}
      render={withFormPersistence('register-form')(RegisterFormInner)}
    />
  );
};
