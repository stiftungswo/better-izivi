import { inject, observer } from 'mobx-react';
import * as React from 'react';
import Button from 'reactstrap/lib/Button';
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
  yearDelta: number;
  hasMoreArchivedPayments: boolean;
  isLoadingMoreArchivedPayments: boolean;
}

@inject('mainStore', 'paymentStore', 'expenseSheetStore')
@observer
export class PaymentOverview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      yearDelta: 1,
      hasMoreArchivedPayments: true,
      isLoadingMoreArchivedPayments: false,
    };
  }

  componentDidMount(): void {
    this.loadContents();
  }

  render() {
    return (
      <IziviContent card loading={this.state.loading}>
        <h1 className="mb-4">Pendente Spesenblätter für Auszahlung</h1>
        <ExpenseSheetsReadyForPaymentTable
          toBePaidExpenseSheets={this.props.expenseSheetStore!.toBePaidExpenseSheets}
          paymentStore={this.props.paymentStore!}
          expenseSheetStore={this.props.expenseSheetStore!}
          mainStore={this.props.mainStore!}
        />

        <h1 className="mb-4 mt-5">In Auszahlung</h1>
        <PaymentsTable
          payments={this.props.paymentStore!.paymentsInProgress}
          emptyNotice={this.props.mainStore!.intl.formatMessage({
            id: 'izivi.frontend.payments.paymentOverview.no_payment_in_progress',
            defaultMessage: 'Keine Zahlung in Bearbeitung',
          })}
          mainStore={this.props.mainStore!}
        />

        <h1 className="mb-4 mt-5">Archiv</h1>
        {this.archivedPayments()}
      </IziviContent>
    );
  }

  private loadContents() {
    const paymentsPromise = this.props.paymentStore!.fetchAllWithYearDelta(this.state.yearDelta);
    const expenseSheetPromise = this.props.expenseSheetStore!.fetchToBePaidAll();

    return Promise.all([paymentsPromise, expenseSheetPromise]).then(() => {
      this.setState({ loading: false });
    });
  }

  private archivedPayments() {
    return (
      <>
        <PaymentsTable
          payments={this.props.paymentStore!.paidPayments}
          emptyNotice={this.props.mainStore!.intl.formatMessage({
            id: 'izivi.frontend.payments.paymentOverview.no_done_payments',
            defaultMessage: 'Keine getätigten Zahlungen',
          })}
          mainStore={this.props.mainStore!}
        />
        {this.state.hasMoreArchivedPayments && this.loadMoreArchivedPaymentsButton()}
      </>
    );
  }

  private loadMoreArchivedPaymentsButton() {
    return (
      <div className="d-flex justify-content-center" style={{ borderTop: '2px solid lightgray' }}>
        <Button
          color="link"
          className="p-0 mt-3"
          disabled={this.state.isLoadingMoreArchivedPayments}
          onClick={() => this.loadMoreArchivedPayments()}
        >
          {this.state.isLoadingMoreArchivedPayments
            ? this.props.mainStore!.intl.formatMessage({
              id: 'izivi.frontend.payments.paymentOverview.loading_content',
              defaultMessage: 'Inhalt wird geladen...',
            })
            : this.props.mainStore!.intl.formatMessage({
              id: 'izivi.frontend.payments.paymentOverview.load_more_payments',
              defaultMessage: 'Weitere archivierte Auszahlungen laden',
            })}
        </Button>
      </div>
    );
  }

  private loadMoreArchivedPayments() {
    const paymentsCount = this.props.paymentStore!.entities.length;
    this.setState({
      yearDelta: this.state.yearDelta + 1,
      isLoadingMoreArchivedPayments: true,
    }, () => {
      this.loadContents().then(() => {
        this.setState({ isLoadingMoreArchivedPayments: false });
        if (this.props.paymentStore!.entities.length === paymentsCount) {
          this.setState({ hasMoreArchivedPayments: false });
        }
      });
    });
  }
}
