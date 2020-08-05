import { FormikActions } from 'formik';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { ExpenseSheetStore } from '../../stores/expenseSheetStore';
import { MainStore } from '../../stores/mainStore';
import { ServiceSpecificationStore } from '../../stores/serviceSpecificationStore';
import { ServiceStore } from '../../stores/serviceStore';
import { UserStore } from '../../stores/userStore';
import { ExpenseSheet, FormValues } from '../../types';
import { ExpenseSheetForm } from './expense_sheet_form/ExpenseSheetForm';

interface ExpenseSheetDetailRouterProps {
  id?: string;
}

interface Props extends RouteComponentProps<ExpenseSheetDetailRouterProps> {
  mainStore?: MainStore;
  expenseSheetStore?: ExpenseSheetStore;
  userStore?: UserStore;
  serviceStore?: ServiceStore;
  serviceSpecificationStore?: ServiceSpecificationStore;
}

@inject('expenseSheetStore', 'userStore', 'serviceStore', 'serviceSpecificationStore', 'mainStore')
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
      Promise.all([
        props.userStore!.fetchOne(Number(props.expenseSheetStore!.expenseSheet!.user_id)),
        props.serviceStore!.fetchOne(Number(props.expenseSheetStore!.expenseSheet!.service_id)),
      ]).then(() => {
        props.serviceSpecificationStore!.fetchOne(props.serviceStore!.entity!.service_specification_id).then(() =>
          this.setState({ loading: false }),
        );
      });
    });
  }

  handleSubmit = (expenseSheet: ExpenseSheet) => {
    return this.props.expenseSheetStore!.put(expenseSheet).then(() => window.location.reload());
  }

  get expenseSheet() {
    const expenseSheet = this.props.expenseSheetStore!.entity;
    if (expenseSheet) {
      return toJS(expenseSheet);
      // it's important to detach the mobx proxy before passing it into formik
      // formik's deepClone can fall into endless recursions with those proxies.
    } else {
      return undefined;
    }
  }

  get user() {
    return this.props.userStore!.entity;
  }

  render() {
    const expenseSheet = this.expenseSheet;

    return (
      <ExpenseSheetForm
        loading={this.state.loading}
        onSubmit={this.handleSubmit}
        expenseSheet={expenseSheet as FormValues}
        hints={this.props.expenseSheetStore!.hints!}
        service={this.props.serviceStore!.entity!}
        serviceSpecification={this.props.serviceSpecificationStore!.entity!}
        title={
          expenseSheet
            ? this.user
              ? this.props.mainStore!.intl.formatMessage({
                id: 'izivi.frontend.views.expense_sheets.expenseSheetStatisticFormDialog.edit_expense_sheet_from',
                defaultMessage: 'Spesenblatt von {firstName} {lastName} bearbeiten',
              }, { firstName: this.user.first_name, lastName: this.user.last_name })
              : this.props.mainStore!.intl.formatMessage({
                id: 'izivi.frontend.views.expense_sheets.expenseSheetStatisticFormDialog.edit_expense_sheet',
                defaultMessage: 'Spesenblatt bearbeiten',
              })
            : this.props.mainStore!.intl.formatMessage({
              id: 'izivi.frontend.views.expense_sheets.expenseSheetStatisticFormDialog.loading_expense_sheet',
              defaultMessage: 'Spesenblatt wird geladen',
            })
        }
      />
    );
  }
}
