import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import Badge from 'reactstrap/lib/Badge';
import Button from 'reactstrap/lib/Button';
import ButtonGroup from 'reactstrap/lib/ButtonGroup';
import IziviContent from '../../layout/IziviContent';
import { OverviewTable } from '../../layout/OverviewTable';
import { MainStore } from '../../stores/mainStore';
import { PaymentStore } from '../../stores/paymentStore';
import { ExpenseSheetState, PaymentExpenseSheet } from '../../types';
import { Formatter } from '../../utilities/formatter';
import { stateTranslation } from '../../utilities/helpers';
import { CheckSolidIcon, DownloadIcon, ExclamationSolidIcon } from '../../utilities/Icon';

interface PaymentDetailRouterProps {
  timestamp?: string;
}

interface Props extends RouteComponentProps<PaymentDetailRouterProps> {
  mainStore?: MainStore;
  paymentStore?: PaymentStore;
}

interface State {
  loading: boolean;
}

const COLUMNS = [
  {
    id: 'zdp',
    label: 'ZDP',
    format: ({ user: { zdp } }: PaymentExpenseSheet) => zdp,
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
    format: ({ user: { bank_iban } }: PaymentExpenseSheet) => bank_iban,
  },
  {
    id: 'total',
    label: 'Betrag',
    format: (expenseSheet: PaymentExpenseSheet) => new Formatter().formatCurrency(expenseSheet.total),
  },
];

@inject('mainStore', 'paymentStore')
@observer
class PaymentDetailInner extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    props.paymentStore!.fetchOne(Number(props.match.params.timestamp)).then(() => this.setState({ loading: false }));

    this.state = {
      loading: true,
    };
  }

  actionButton() {
    const payment = this.props.paymentStore!.payment!;

    if (payment.state === ExpenseSheetState.payment_in_progress) {
      return (
        <ButtonGroup>
          <Button
            color="success"
            onClick={() => this.props.paymentStore!.confirmPayment()}
            className="mb-4"
            target="_blank"
          >
            <FontAwesomeIcon className="mr-1" icon={CheckSolidIcon}/> Zahlung bestätigen
          </Button>
          <Button
            color="danger"
            onClick={() => this.props.paymentStore!.cancelPayment()}
            className="mb-4"
            target="_blank"
          >
            <FontAwesomeIcon className="mr-1" icon={ExclamationSolidIcon}/> Zahlung abbrechen
          </Button>
        </ButtonGroup>
      );
    } else {
      return <></>;
    }
  }

  render() {
    const payment = this.props.paymentStore!.payment;
    const title = payment
      ? `Auszahlung vom ${this.props.mainStore!.formatDate(PaymentStore.convertPaymentTimestamp(payment.payment_timestamp))}`
      : `Details zur Auszahlung ${this.props.match.params.timestamp}`;

    return (
      <IziviContent card loading={this.state.loading}>
        <Badge pill className="mb-2">{payment ? stateTranslation(payment!.state as ExpenseSheetState) : ''}</Badge>
        <h1 className="mb-4">{title}</h1>
        {payment && (
          <>
            <Button
              color="primary"
              href={this.props.mainStore!.apiURL(`payments/${payment!.payment_timestamp}.xml`)}
              tag="a"
              className="mb-4"
              target="_blank"
            >
              <FontAwesomeIcon className="mr-1" icon={DownloadIcon}/> Zahlungsdatei herunterladen
            </Button>
            <div className="float-right">
              {this.actionButton()}
            </div>
            <OverviewTable
              columns={COLUMNS}
              data={this.props.paymentStore!.payment!.expense_sheets}
              renderActions={(expenseSheet: PaymentExpenseSheet) => <Link to={`/expense_sheets/${expenseSheet.id!}`}>Spesenblatt</Link>}
            />
          </>
        )}
      </IziviContent>
    );
  }
}

export const PaymentDetail = withRouter(PaymentDetailInner);
