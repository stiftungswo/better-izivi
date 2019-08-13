import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import IziviContent from '../../layout/IziviContent';
import { LoadingInformation } from '../../layout/LoadingInformation';
import { ExpenseSheetStore } from '../../stores/expenseSheetStore';
import { UserStore } from '../../stores/userStore';
import { ExpenseSheet, FormValues } from '../../types';
import { ExpenseSheetForm } from './ExpenseSheetForm';

interface ExpenseSheetDetailRouterProps {
  id?: string;
}

interface Props extends RouteComponentProps<ExpenseSheetDetailRouterProps> {
  expenseSheetStore?: ExpenseSheetStore;
  userStore?: UserStore;
}

@inject('expenseSheetStore', 'userStore')
@observer
export class ExpenseSheetUpdate extends React.Component<Props, { loading: boolean }> {
  constructor(props: Props) {
    super(props);

    this.state = { loading: true };

    const expenseSheetId = Number(props.match.params.id);

    Promise.all([
      props.expenseSheetStore!.fetchOne(expenseSheetId),
      props.expenseSheetStore!.fetchHints(expenseSheetId),
    ]).then(() => {
      props.userStore!.fetchOne(Number(props.expenseSheetStore!.expenseSheet!.user_id)).then(() => this.setState({ loading: false }));
    });
  }

  handleSubmit = (expenseSheet: ExpenseSheet) => {
    return this.props.expenseSheetStore!.put(expenseSheet);
  };

  get expenseSheet() {
    const expenseSheet = this.props.expenseSheetStore!.expenseSheet;
    if (expenseSheet) {
      return toJS(expenseSheet);
      // it's important to detach the mobx proxy before passing it into formik
      // formik's deepClone can fall into endless recursions with those proxies.
    } else {
      return undefined;
    }
  }

  get user() {
    return this.props.userStore!.user;
  }

  render() {
    const expenseSheet = this.expenseSheet;

    return (
      <ExpenseSheetForm
        loading={this.state.loading}
        onSubmit={this.handleSubmit}
        expenseSheet={expenseSheet as FormValues}
        hints={this.props.expenseSheetStore!.hints!}
        title={
          expenseSheet
            ? this.user
            ? `Spesenblatt von ${this.user.first_name} ${this.user.last_name} bearbeiten`
            : 'Spesenblatt bearbeiten'
            : 'Spesenblatt wird geladen'
        }
      />
    );
  }
}
