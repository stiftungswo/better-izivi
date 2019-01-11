import * as React from 'react';
import { ReactElement } from 'react';
import { ErrorMessage, FieldProps } from 'formik';
import Input, { InputType } from 'reactstrap/lib/Input';
import FormGroup from 'reactstrap/lib/FormGroup';
import Label from 'reactstrap/lib/Label';
import FormFeedback from 'reactstrap/lib/FormFeedback';
import { DateTimePicker } from 'react-widgets';
import Col from 'reactstrap/lib/Col';
import InputGroup from 'reactstrap/lib/InputGroup';
import InputGroupAddon from 'reactstrap/lib/InputGroupAddon';

export type FormProps = {
  label?: string;
  children: ReactElement<any>; //tslint:disable-line:no-any
  required?: boolean;
  multiline?: boolean;
  horizontal?: boolean;
  appendedLabel?: string;
} & FieldProps;

export type InputFieldProps = {
  type: InputType;
  unit?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  delayed?: boolean;
  disabled?: boolean;
} & FormProps;

export type DateTimePickerFieldProps = FormProps & {
  label: string;
  required?: boolean;
  onChange?: (date?: Date) => void;
  time?: boolean;
  editFormat?: string;
  format?: string;
  value: Date;
  delayed?: boolean;
  disabled?: boolean;
};

export type SelectFieldProps = {
  options: Array<{
    id: string;
    name: string;
  }>;
} & InputFieldProps;

interface ClonedFieldProps {
  children: ReactElement<any>; //tslint:disable-line:no-any
  invalid: boolean;
}

const withInputGroupAddon = (appendedLabel: string) => (wrappedComponent: React.ReactNode) => (
  <InputGroup>
    {wrappedComponent}
    <InputGroupAddon addonType={'append'}>{appendedLabel}</InputGroupAddon>
  </InputGroup>
);

const withColumn = () => (wrappedComponent: React.ReactNode) => <Col md={9}>{wrappedComponent}</Col>;

const ClonedField = ({ children, invalid }: ClonedFieldProps) => React.cloneElement(children, { invalid });

export const ValidatedFormGroupWithLabel = ({
  label,
  field,
  form: { touched, errors },
  children,
  required,
  horizontal,
  appendedLabel,
}: FormProps) => {
  const hasErrors: boolean = !!errors[field.name] && !!touched[field.name];
  const clonedField = <ClonedField children={children} invalid={hasErrors} />;

  return (
    <FormGroup row={horizontal}>
      {label && (
        <Label for={field.name} md={horizontal ? 3 : undefined}>
          {label} {required && '*'}
        </Label>
      )}
      {Boolean(appendedLabel) && horizontal && withColumn()(withInputGroupAddon(appendedLabel!)(clonedField))}
      {Boolean(appendedLabel) && !horizontal && withInputGroupAddon(appendedLabel!)(clonedField)}
      {!Boolean(appendedLabel) && horizontal && withColumn()(clonedField)}
      {!Boolean(appendedLabel) && !horizontal && clonedField}

      <ErrorMessage name={field.name} render={error => <FormFeedback valid={false}>{error}</FormFeedback>} />
    </FormGroup>
  );
};

const InputFieldWithValidation = ({
  label,
  field,
  form,
  unit,
  required,
  multiline,
  horizontal,
  appendedLabel,
  ...rest
}: InputFieldProps) => {
  return (
    <ValidatedFormGroupWithLabel
      label={label}
      field={field}
      form={form}
      required={required}
      horizontal={horizontal}
      appendedLabel={appendedLabel}
    >
      <Input {...field} value={field.value === null ? '' : field.value} {...rest} />
    </ValidatedFormGroupWithLabel>
  );
};

const SelectFieldWithValidation = ({ label, field, form, unit, required, multiline, options, horizontal, ...rest }: SelectFieldProps) => {
  return (
    <ValidatedFormGroupWithLabel label={label} field={field} form={form} required={required} horizontal={horizontal}>
      <Input {...field} value={field.value === null ? '' : field.value} {...rest}>
        {options.map(option => (
          <option value={option.id} key={option.id}>
            {option.name}
          </option>
        ))}
      </Input>
    </ValidatedFormGroupWithLabel>
  );
};

const DateTimePickerFieldWithValidation = ({ label, field, form, required, horizontal, ...rest }: DateTimePickerFieldProps) => (
  <ValidatedFormGroupWithLabel label={label} field={field} form={form} required={required} horizontal={horizontal}>
    <DateTimePicker onChange={(date?: Date) => form.setFieldValue(field.name, date)} defaultValue={new Date(field.value)} {...rest} />
  </ValidatedFormGroupWithLabel>
);

export const CheckboxField = (props: InputFieldProps) => <InputFieldWithValidation type={'checkbox'} {...props} />;

export const EmailField = (props: InputFieldProps) => <InputFieldWithValidation type={'email'} {...props} />;

export const NumberField = (props: InputFieldProps) => <InputFieldWithValidation type={'number'} {...props} />;

export const PasswordField = (props: InputFieldProps) => <InputFieldWithValidation type={'password'} {...props} />;

export const TextField = (props: InputFieldProps & { multiline?: boolean }) => <InputFieldWithValidation type={'text'} {...props} />;

export const DateField = (props: InputFieldProps) => <InputFieldWithValidation type={'date'} {...props} />;

export const DatePickerField = (props: DateTimePickerFieldProps) => (
  <DateTimePickerFieldWithValidation
    time={false}
    editFormat={props.format ? props.format : 'DD.MM.YYYY'}
    format={'DD.MM.YYYY'}
    {...props}
  />
);

export const SelectField = (props: SelectFieldProps) => <SelectFieldWithValidation type={'select'} {...props} />;
