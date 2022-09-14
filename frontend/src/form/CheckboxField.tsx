import * as React from 'react';
import injectSheet, { WithSheet } from 'react-jss';
import Col from 'reactstrap/lib/Col';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input, {InputProps} from 'reactstrap/lib/Input';
import Label from 'reactstrap/lib/Label';
import createStyles from '../utilities/createStyles';
import { IziviCustomFieldProps } from './common';

const styles = () =>
  createStyles({
    noselect: {
      userSelect: 'none',
    },
  });

// The checkbox requires its own kind of "logic" to render
// we can't wrap it into our common stuff in common.tsx
// so it has its own sets of props

interface CheckboxFieldProps extends IziviCustomFieldProps<boolean>, WithSheet<typeof styles> {
  horizontal?: boolean;
  label: string;
  required?: boolean;
  className?: string;
}

export const CheckboxFieldContent = ({
  value,
  onChange,
  name,
  horizontal,
  label,
  required,
  errorMessage,
  classes,
  className,
  disabled,
}: CheckboxFieldProps) => {
  const hasErrors = Boolean(errorMessage);

  const input = (
    <Input
      {...!horizontal && !label ? { className: `position-static ${className}` } : {}}
      id={name}
      checked={value}
      onChange={() => onChange(!value)}
      invalid={hasErrors}
      type="checkbox"
      disabled={disabled}
    />
  );

  return (
    <FormGroup check={!horizontal} row={horizontal}>
      {label && (
        <Label className={classes.noselect} check={!horizontal} for={name} md={horizontal ? 3 : undefined}>
          {horizontal && label}
          {!horizontal && (
            <>
              {input} {label}{' '}
              {required && '*'}
            </>
          )}
        </Label>
      )}
      {horizontal && (
        <Col md={9}>
          <FormGroup check>
            <Label className={classes.noselect} check>
              {input}
            </Label>
          </FormGroup>
        </Col>
      )}
      {!horizontal && !label && (
        input
      )}
    </FormGroup>
  );
};


export const CheckboxField = injectSheet(styles)(CheckboxFieldContent);
