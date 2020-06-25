import * as React from "react";
import {MainStore} from "../stores/mainStore";
import {inject, observer} from "mobx-react";
import {IntlProvider} from "react-intl";
import messagesDe from "../messages.de-CH.json"
import messagesFr from "../messages.fr-CH.json"
import {Locale} from "../types";

export const messages: {[locale in Locale]: any} = {
  "de-CH": messagesDe,
  "fr-CH": messagesFr,
};

interface Props {
  mainStore?: MainStore;
  children?: React.ReactNode;
}

@inject('holidayStore', 'mainStore')
@observer
export class StoreConnectedIntlProvider extends React.Component<Props> {
  render(){
    const {locale} = this.props.mainStore!
    return (<IntlProvider locale={locale} messages={messages[locale]}>{this.props.children}</IntlProvider>)
  }
}
