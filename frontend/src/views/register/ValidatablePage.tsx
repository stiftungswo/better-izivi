import { connect, ErrorMessage, FormikProps } from 'formik';
import { curry, debounce, isEmpty, pick } from 'lodash';
import * as React from 'react';
import { UserStore } from '../../stores/userStore';

type ValidityCallback = (valid: boolean) => void;

export type ValidatablePageRefType = ValidatablePageInner;

export interface ValidatablePageInnerProps {
  validatableFields: string[];
  onValidityChange: ValidityCallback;
  ref: React.Ref<ValidatablePageRefType>;
  userStore?: UserStore;
}

interface ValidatablePageInnerState {
  isValid: boolean;
}

type ValidatablePageInnerFullProps = ValidatablePageInnerProps & { formik: FormikProps<any> };

class ValidatablePageInner extends React.Component<ValidatablePageInnerFullProps, ValidatablePageInnerState> {
  localValidate = debounce((prevState: Readonly<ValidatablePageInnerState>) => {
    const isValid = this.isValid();

    if (isValid !== prevState.isValid) {
      this.props.onValidityChange(isValid);
      this.setState({ isValid });
    }
  }, 100);

  constructor(props: ValidatablePageInnerFullProps) {
    super(props);

    this.state = { isValid: false };
  }

  async validateWithServer() {
    // await this.mainStore!.api.get('/users/validate', { params: { user } });
    console.log('validation');
  }

  componentDidMount() {
    this.setState({ isValid: this.isValid() });
  }

  componentDidUpdate(prevProps: any, prevState: Readonly<ValidatablePageInnerState>) {
    this.localValidate(prevState);
  }

  isValid() {
    return isEmpty(pick(this.props.formik.errors, this.props.validatableFields));
  }

  render() {
    return (
      <>
        {this.props.validatableFields.map(field => (
          <div className="text-danger" key={field}>
            <ErrorMessage name={field}/>
          </div>
        ))}

        {this.props.children}
      </>
    );
  }
}

const ValidatablePage = React.forwardRef<ValidatablePageInner, React.PropsWithChildren<ValidatablePageInnerProps>>((props, ref) =>
  (connect<ValidatablePageInnerProps, any>(ValidatablePageInner) as React.FunctionComponent<ValidatablePageInnerProps>)({ ...props, ref }),
);

export interface WithPageValidationsProps {
  onValidityChange: ValidityCallback;

  [key: string]: any;
}

export const withPageValidations = curry(
  (validatableFields: string[], EnhancedComponent: React.ComponentType) =>
    React.forwardRef<ValidatablePageRefType, WithPageValidationsProps>(({ onValidityChange, ...rest }, ref) => (
      <ValidatablePage validatableFields={validatableFields} onValidityChange={onValidityChange} ref={ref}>
        <EnhancedComponent {...rest}/>
      </ValidatablePage>
    )),
);
