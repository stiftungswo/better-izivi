import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Spinner } from '../utilities/Spinner';

class LoadingInformation extends React.Component<{ message?: string, className?: any }> {
  render(): React.ReactNode {
    return (
      <div className={this.props.className}>
        <Spinner size="sm" color="primary" className="mr-2" />
        {this.props.message ||
         <FormattedMessage
           id="layout.loading_information.loading"
           defaultMessage="Inhalt wird geladen, einen Moment"
         />
        }
      </div>
    );
  }
}

export { LoadingInformation };
