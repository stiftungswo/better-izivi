import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { ExpenseSheetStore } from '../../stores/expenseSheetStore';
import { FormValues, ExpenseSheet } from '../../types';
import { ExpenseSheetForm } from './ExpenseSheetForm';

interface ReportSheetDetailRouterProps {
  id?: string;
}

interface Props extends RouteComponentProps<ReportSheetDetailRouterProps> {
  expenseSheetStore?: ExpenseSheetStore;
}

@inject('expenseSheetStore')
@observer
export class ReportSheetUpdate extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    props.expenseSheetStore!.fetchOne(Number(props.match.params.id));
  }

  handleSubmit = (reportSheet: ExpenseSheet) => {
    return this.props.expenseSheetStore!.put(reportSheet);
  }

  get reportSheet() {
    const reportSheet = this.props.expenseSheetStore!.expenseSheet;
    if (reportSheet) {
      return toJS(reportSheet);
      // it's important to detach the mobx proxy before passing it into formik
      // formik's deepClone can fall into endless recursions with those proxies.
    } else {
      return undefined;
    }
  }

  render() {
    const reportSheet = this.reportSheet;

    return (
      <ExpenseSheetForm
        onSubmit={this.handleSubmit}
        expenseSheet={reportSheet as FormValues}
        title={
          reportSheet
            ? reportSheet.user
              ? `Spesenblatt von ${reportSheet.user.first_name} ${reportSheet.user.last_name} bearbeiten`
              : 'Spesenblatt bearbeiten'
            : 'Spesenblatt wird geladen'
        }
      />
    );
  }
}
