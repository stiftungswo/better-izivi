import { inject, observer } from 'mobx-react';
import * as React from 'react';
import Button from 'reactstrap/lib/Button';
import { bool, boolean } from 'yup';
import IziviContent from '../../layout/IziviContent';
import { ExpenseSheetStore } from '../../stores/expenseSheetStore';
import { MainStore } from '../../stores/mainStore';
import { PaymentStore } from '../../stores/paymentStore';
import { ExpenseSheetsReadyForPaymentTable } from './tables/ExpenseSheetsReadyForPaymentTable';
import { PaymentsTable } from './tables/PaymentsTable';

interface Props {
  mainStore?: MainStore;
  paymentStore?: PaymentStore;
  expenseSheetStore?: ExpenseSheetStore;
}

interface State {
  loading: boolean;
  paidPaymentsLoaded: boolean;
}

@inject('mainStore', 'paymentStore', 'expenseSheetStore')
@observer
export class PaymentOverview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      paidPaymentsLoaded: false,
    };
  }

  componentDidMount(): void {
    this.loadContents();
  }

  private loadContents() {
    if (!this.state.loading) {
      this.setState({ loading: true });
    }

    const paymentsFilter = !this.state.paidPaymentsLoaded ? { state: 'payment_in_progress' } : undefined;
    const paymentsPromise = this.props.paymentStore!.fetchAll(paymentsFilter);
    const expenseSheetPromise = this.props.expenseSheetStore!.fetchToBePaidAll();

    Promise.all([paymentsPromise, expenseSheetPromise]).then(() => {
      this.setState({ loading: false });
    });
  }

  render() {
    return (
      <IziviContent card loading={this.state.loading}>
        <h1 className="mb-4">Pendente Spesenblätter für Auszahlung</h1>
        <ExpenseSheetsReadyForPaymentTable
          toBePaidExpenseSheets={this.props.expenseSheetStore!.toBePaidExpenseSheets}
          paymentStore={this.props.paymentStore!}
          expenseSheetStore={this.props.expenseSheetStore!}
        />

        <h1 className="mb-4 mt-5">In Auszahlung</h1>
        <PaymentsTable payments={this.props.paymentStore!.paymentsInProgress} emptyNotice={'Keine Zahlung in Bearbeitung'}/>

        <h1 className="mb-4 mt-5">Archiv</h1>
        {this.archivedPayments()}
      </IziviContent>
    );
  }

  private archivedPayments() {
    if (this.state.paidPaymentsLoaded) {
      return <PaymentsTable payments={this.props.paymentStore!.paidPayments} emptyNotice={'Keine getätigten Zahlungen'}/>;
    } else {
      return (
        <>
          <div className="text-muted">Das Archiv wurde noch nicht geladen</div>
          <Button
            color="link"
            className="p-0 mt-3"
            onClick={() => this.setState({ paidPaymentsLoaded: true }, this.loadContents)}
          >
            Archivierte Auszahlungen laden
          </Button>
        </>
      );
    }
  }
}
