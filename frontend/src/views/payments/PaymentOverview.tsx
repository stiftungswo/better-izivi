import { get } from 'lodash';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import IziviContent from '../../layout/IziviContent';
import { OverviewTable } from '../../layout/OverviewTable';
import { ExpenseSheetStore } from '../../stores/expenseSheetStore';
import { MainStore } from '../../stores/mainStore';
import { PaymentStore } from '../../stores/paymentStore';
import { Column, ExpenseSheetListing, Payment } from '../../types';

interface Props {
  mainStore?: MainStore;
  paymentStore?: PaymentStore;
  expenseSheetStore?: ExpenseSheetStore;
}

interface State {
  loading: boolean;
}

@inject('mainStore', 'paymentStore', 'expenseSheetStore')
@observer
export class PaymentOverview extends React.Component<Props, State> {
  paymentColumns: Array<Column<Payment>>;
  expenseSheetColumns: Array<Column<ExpenseSheetListing>>;

  constructor(props: Props) {
    super(props);

    this.paymentColumns = [
      {
        id: 'created_at',
        label: 'Datum',
        format: (payment: Payment) => this.props.mainStore!.formatDate(PaymentStore.convertPaymentTimestamp(payment.payment_timestamp)),
      },
      {
        id: 'amount',
        label: 'Betrag',
        format: (payment: Payment) => this.props.mainStore!.formatCurrency(payment.total),
      },
    ];

    this.expenseSheetColumns = [
      {
        id: 'zdp',
        label: 'ZDP',
        format: (expenseSheet: ExpenseSheetListing) => get(expenseSheet, 'user.zdp', ''),
      },
      {
        id: 'full_name',
        label: 'Name',
        format: (expenseSheet: ExpenseSheetListing) => get(expenseSheet, 'user.full_name', ''),
      },
      {
        id: 'iban',
        label: 'IBAN',
        format: (expenseSheet: ExpenseSheetListing) => get(expenseSheet, 'user.bank_iban', ''),
      },
      {
        id: 'total',
        label: 'Betrag',
        format: (expenseSheet: ExpenseSheetListing) => this.props.mainStore!.formatCurrency(expenseSheet.total),
      },
      {
        id: 'notices',
        label: 'Bemerkungen',
        format: (expenseSheet: ExpenseSheetListing) => (
          <>
            {expenseSheet.user && (expenseSheet.user.address === '' || expenseSheet.user.city === '' || !expenseSheet.user.zip) && (
              <>
                <p>Adresse unvollständig!</p>
                <br/>
              </>
            )}
            {!this.props.mainStore!.validateIBAN(expenseSheet.user ? expenseSheet.user.bank_iban : '') && (
              <>
                <p>IBAN hat ein ungültiges Format!</p>
                <br/>
              </>
            )}
          </>
        ),
      },
    ];

    this.state = {
      loading: true,
    };
  }

  componentDidMount(): void {
    Promise.all([this.props.paymentStore!.fetchAll(), this.props.expenseSheetStore!.fetchToBePaidAll()]).then(() => {
      this.setState({ loading: false });
    });
  }

  render() {
    return (
      <IziviContent card loading={this.state.loading} title={'Auszahlungen'}>
        {this.props.expenseSheetStore!.toBePaidExpenseSheets.length > 0 ? (
          <>
            <OverviewTable
              columns={this.expenseSheetColumns}
              data={this.props.expenseSheetStore!.toBePaidExpenseSheets}
              renderActions={({ id }: ExpenseSheetListing) => <Link to={'/expense_sheets/' + id}>Spesenblatt</Link>}
            />
            <Button
              color={'primary'}
              href={this.props.mainStore!.apiURL('payments/execute')}
              tag={'a'}
              target={'_blank'}
            >
              Zahlungsdatei generieren
            </Button>
          </>
        ) : (
          'Keine Spesen zur Auszahlung bereit.'
        )}
        <br/>
        <br/>
        <h1>Archiv</h1> <br/>
        <OverviewTable
          columns={this.paymentColumns}
          data={this.props.paymentStore!.payments}
          renderActions={(payment: Payment) => (
            <>
              <Link to={'/payments/' + payment.payment_timestamp}>Details</Link>
            </>
          )}
        />
      </IziviContent>
    );
  }
}
