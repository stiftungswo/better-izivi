import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { MainStore } from '../stores/mainStore';

interface Props {
  children: React.ReactNode;
  isSubmitting: boolean;
  isValid: boolean;
  mainStore?: MainStore;
}

@inject('mainStore')
@observer
export class FormikSubmitDetector extends React.Component<Props> {
  // SOURCE: https://github.com/jaredpalmer/formik/issues/1019
  intl = this.props.mainStore!.intl;
  componentDidUpdate(prevProps: Props) {
    if (prevProps.isSubmitting && !this.props.isSubmitting && !this.props.isValid) {
      this.props.mainStore!.displayError(
        this.intl.formatMessage({
          id: 'register.pagedForm.form_has_invalid_fields ',
          defaultMessage:
            'Das Formular hat noch ungültige Felder',
        }),
      );
    }
  }
  render() {
    return <>{this.props.children}</>;
  }
}
