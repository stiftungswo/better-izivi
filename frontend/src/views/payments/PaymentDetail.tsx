import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import IziviContent from '../../layout/IziviContent';
import { OverviewTable } from '../../layout/OverviewTable';
import { MainStore } from '../../stores/mainStore';
import { PaymentStore } from '../../stores/paymentStore';
import { PaymentExpenseSheet } from '../../types';
import { Formatter } from '../../utilities/formatter';
import { DownloadIcon } from '../../utilities/Icon';

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

  render() {
    const payment = this.props.paymentStore!.payment;
    const title = payment
      ? `Auszahlung vom ${this.props.mainStore!.formatDate(PaymentStore.convertPaymentTimestamp(payment.payment_timestamp))}`
      : `Details zur Auszahlung ${this.props.match.params.timestamp}`;

    return (
      <IziviContent card loading={this.state.loading} title={title}>
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
