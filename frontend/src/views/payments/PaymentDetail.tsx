import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import IziviContent from '../../layout/IziviContent';
import { OverviewTable } from '../../layout/OverviewTable';
import { MainStore } from '../../stores/mainStore';
import { PaymentStore } from '../../stores/paymentStore';
import { Column, PaymentExpenseSheet } from '../../types';
import { ExpenseSheetConfirmer } from './ExpenseSheetConfirmer';

interface PaymentDetailRouterProps {
  id?: string;
}

interface Props extends RouteComponentProps<PaymentDetailRouterProps> {
  mainStore?: MainStore;
  paymentStore?: PaymentStore;
}

interface State {
  loading: boolean;
}

@inject('mainStore', 'paymentStore')
@observer
class PaymentDetailInner extends React.Component<Props, State> {
  columns: Array<Column<PaymentExpenseSheet>>;

  constructor(props: Props) {
    super(props);
    props.paymentStore!.fetchOne(Number(props.match.params.id)).then(() => this.setState({ loading: false }));

    this.columns = [
      {
        id: 'zdp',
        label: 'ZDP',
        format: (p: PaymentExpenseSheet) => p.user.zdp,
      },
      {
        id: 'full_name',
        label: 'Name',
        format: (expenseSheet: PaymentExpenseSheet) => (
          <Link to={'/users/' + expenseSheet.user.id}>{expenseSheet.user.full_name}</Link>
        ),
      },
      {
        id: 'iban',
        label: 'IBAN',
        format: (p: PaymentExpenseSheet) => p.user.bank_iban,
      },
      {
        id: 'total',
        label: 'Betrag',
        format: (expenseSheet: PaymentExpenseSheet) => (
          <Link to={'/expense_sheets/' + expenseSheet.id}>{this.props.mainStore!.formatCurrency(expenseSheet.total)}</Link>
        ),
      },
    ];

    this.state = {
      loading: true,
    };
  }

  render() {
    const payment = this.props.paymentStore!.payment;
    const title = payment
      ? `Auszahlung vom ${this.props.mainStore!.formatDate(PaymentStore.convertPaymentTimestamp(payment.payment_timestamp))}`
      : `Details zur Auszahlung ${this.props.match.params.id}`;

    return (
      <IziviContent card loading={this.state.loading} title={title}>
        {payment && (
          <>
            <Button color="primary" href={this.props.mainStore!.apiURL(`payments/${payment!.payment_timestamp}.xml`)} tag="a" target="_blank">
              Zahlung.xml erneut herunterladen
            </Button>{' '}
            <br /> <br />
            <OverviewTable
              columns={this.columns}
              data={this.props.paymentStore!.payment!.expense_sheets}
              renderActions={(p: PaymentExpenseSheet) => <ExpenseSheetConfirmer paymentExpenseSheet={p} />}
            />
          </>
        )}
      </IziviContent>
    );
  }
}

export const PaymentDetail = withRouter(PaymentDetailInner);
