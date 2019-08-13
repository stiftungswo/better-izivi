import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { ExpenseSheetStore } from '../../stores/expenseSheetStore';
import { ExpenseSheet, FormValues } from '../../types';
import { ExpenseSheetForm } from './ExpenseSheetForm';

interface ExpenseSheetDetailRouterProps {
  id?: string;
}

interface Props extends RouteComponentProps<ExpenseSheetDetailRouterProps> {
  expenseSheetStore?: ExpenseSheetStore;
}

@inject('expenseSheetStore')
@observer
export class ExpenseSheetUpdate extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    props.expenseSheetStore!.fetchOne(Number(props.match.params.id));
  }

  handleSubmit = (expenseSheet: ExpenseSheet) => {
    return this.props.expenseSheetStore!.put(expenseSheet);
  }

  get reportSheet() {
    const expenseSheet = this.props.expenseSheetStore!.expenseSheet;
    if (expenseSheet) {
      return toJS(expenseSheet);
      // it's important to detach the mobx proxy before passing it into formik
      // formik's deepClone can fall into endless recursions with those proxies.
    } else {
      return undefined;
    }
  }

  render() {
    const expenseSheet = this.reportSheet;

    return (
      <ExpenseSheetForm
        onSubmit={this.handleSubmit}
        expenseSheet={expenseSheet as FormValues}
        title={
          expenseSheet
            ? expenseSheet.user
              ? `Spesenblatt von ${expenseSheet.user.first_name} ${expenseSheet.user.last_name} bearbeiten`
              : 'Spesenblatt bearbeiten'
            : 'Spesenblatt wird geladen'
        }
      />
    );
  }
}
