import { inject, observer } from 'mobx-react';
import moment from 'moment';
import 'moment/locale/de-ch';
import 'moment/locale/fr-ch';
import * as React from 'react';
import { RawIntlProvider } from 'react-intl';
import momentLocalizer from 'react-widgets-moment';
import { MainStore } from '../stores/mainStore';

interface Props {
  mainStore?: MainStore;
  children?: React.ReactNode;
}

@inject('holidayStore', 'mainStore')
@observer
export class StoreConnectedIntlProvider extends React.Component<Props> {

  render() {
    const { intl } = this.props.mainStore!;
    return (<RawIntlProvider value={intl}>{this.props.children}</RawIntlProvider>);
  }
}
