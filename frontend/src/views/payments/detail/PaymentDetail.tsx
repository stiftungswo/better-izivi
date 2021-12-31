import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import injectSheet from 'react-jss';
import { WithSheet } from 'react-jss/lib/injectSheet';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import Badge from 'reactstrap/lib/Badge';
import Button from 'reactstrap/lib/Button';
import ButtonGroup from 'reactstrap/lib/ButtonGroup';
import IziviContent from '../../../layout/IziviContent';
import { OverviewTable } from '../../../layout/OverviewTable';
import { MainStore } from '../../../stores/mainStore';
import { PaymentStore } from '../../../stores/paymentStore';
import { Payment, PaymentExpenseSheet, PaymentState } from '../../../types';
import { Formatter } from '../../../utilities/formatter';
import { stateTranslation } from '../../../utilities/helpers';
import { CheckSolidIcon, DownloadIcon, ExclamationSolidIcon } from '../../../utilities/Icon';
import { paymentDetailStyles } from './paymentDetailStyles';

interface PaymentDetailRouterProps {
  timestamp?: string;
}

interface Props extends RouteComponentProps<PaymentDetailRouterProps> {
  mainStore?: MainStore;
  paymentStore?: PaymentStore;
}

interface State {
  loading: boolean;
  canceled: boolean;
}

@inject('mainStore', 'paymentStore')
@observer
class PaymentDetailInner extends React.Component<Props & WithSheet<typeof paymentDetailStyles>, State> {
  constructor(props: Props & WithSheet<typeof paymentDetailStyles>) {
    super(props);
    props.paymentStore!.fetchOne(Number(props.match.params.timestamp)).then(() => this.setState({ loading: false }));

    this.state = {
      loading: true,
      canceled: false,
    };
  }

  render() {
    const payment = this.props.paymentStore!.payment;
    return (
      <IziviContent
        card
        loading={this.state.loading}
        backButtonPath="/payments"
      >
        {this.state.canceled && (
          <div className={this.props.classes.cancelBadge}>Abgebrochen</div>
        )}
        <div
          className={
            this.state.canceled
              ? this.props.classes.canceledDetailCard
              : undefined
          }
        >
          <Badge pill className="mb-2">
            {payment ? stateTranslation(payment!.state) : ''}
          </Badge>
          <h1 className="mb-4">{this.getTitle(payment)}</h1>
          {payment && (
            <>
              {payment.state === PaymentState.payment_in_progress &&
                !this.state.canceled && this.downloadButton(payment)}
              <div className="float-right">{this.actionButton()}</div>
              <OverviewTable
                columns={this.columns()}
                data={this.props.paymentStore!.payment!.expense_sheets}
                renderActions={(expenseSheet: PaymentExpenseSheet) => (
                  <Link to={`/expense_sheets/${expenseSheet.id!}`}>
                    <FormattedMessage
                      id="payments.paymentDetail.expense_sheet"
                      defaultMessage="Spesenblatt"
                    />
                  </Link>
                )}
              />
            </>
          )}

          <a href={this.props.mainStore!.apiLocalizedURL('payments_list.pdf', { payment: this.props.match.params.timestamp })} target={'_blank'}>
            <Button color={'secondary'} style={{ marginLeft: '12px' }}>
              <FormattedMessage id="payments.expenseSheetsReadyForPaymentTable.pdf" />
            </Button>
          </a>
        </div>
      </IziviContent>
    );
  }

   private downloadButton(payment: Payment) {
    let unix = payment.expense_sheets[0].included_in_download_at;

    const date = new Date(unix * 1000);
    const dateString = date.toLocaleString('de-CH')
    if (unix > 0) {
      return (
        <span style={{ display: "inline-block", marginTop: "8px" }}>
          <span>
          <FormattedMessage id="payments.paymentDetail.already_downloaded" />
          <strong> {dateString}</strong>. </span>
          <a href={this.getPainURL(payment!)}><FormattedMessage id="payments.paymentDetail.download_anyway" /></a>
        .</span>
      );
    } else {
      return (
        <Button
          color="primary"
          href={this.getPainURL(payment!)}
          tag="a"
          className="mb-4"
          target="_blank"
        >
          <FormattedMessage
            id="payments.paymentDetail.download_payment_file"
            defaultMessage="{icon} Zahlungsdatei herunterladen"
            values={{
              icon: <FontAwesomeIcon className="mr-1" icon={DownloadIcon} />,
            }}
          />
        </Button>
      );
    }
  }

  private actionButton() {
    const payment = this.props.paymentStore!.payment!;

    if (payment.state === PaymentState.payment_in_progress) {
      return (
        <ButtonGroup>
          <Button disabled={this.state.canceled} color="success" onClick={this.confirmButtonClicked} className="mb-4" target="_blank">
            <FormattedMessage
              id="payments.paymentDetail.confirm_payment"
              defaultMessage="{icon} Zahlung bestätigen"
              values={{ icon: <FontAwesomeIcon className="mr-1" icon={CheckSolidIcon} /> }}
            />
          </Button>
          <Button color="danger" disabled={this.state.canceled} onClick={this.cancelButtonClicked} className="mb-4" target="_blank">
            <FormattedMessage
              id="payments.paymentDetail.cancel_payment"
              defaultMessage="{icon} Zahlung abbrechen"
              values={{ icon: <FontAwesomeIcon className="mr-1" icon={ExclamationSolidIcon} /> }}
            />
          </Button>
        </ButtonGroup>
      );
    } else {
      return <></>;
    }
  }

  private columns() {
    return [
      {
        id: 'zdp',
        label: this.props.mainStore!.intl.formatMessage({
          id: 'payments.paymentDetail.zdp',
          defaultMessage: 'ZDP',
        }),
        format: ({ user: { zdp } }: PaymentExpenseSheet) => zdp,
      },
      {
        id: 'full_name',
        label: this.props.mainStore!.intl.formatMessage({
          id: 'payments.paymentDetail.name',
          defaultMessage: 'Name',
        }),
        format: (expenseSheet: PaymentExpenseSheet) => (
          <Link to={'/users/' + expenseSheet.user.id}>{expenseSheet.user.full_name}</Link>
        ),
      },
      {
        id: 'iban',
        label: this.props.mainStore!.intl.formatMessage({
          id: 'payments.paymentDetail.iban',
          defaultMessage: 'IBAN',
        }),
        format: ({ user: { bank_iban } }: PaymentExpenseSheet) => bank_iban,
      },
      {
        id: 'total',
        label: this.props.mainStore!.intl.formatMessage({
          id: 'payments.paymentDetail.amount',
          defaultMessage: 'Betrag',
        }),
        format: (expenseSheet: PaymentExpenseSheet) => new Formatter().formatCurrency(expenseSheet.total),
      },
    ];

  }

  private cancelButtonClicked = () => {
    return this.props.paymentStore!.cancelPayment().then(() => this.setState({ canceled: true }));
  }

  private confirmButtonClicked = () => {
    return this.props.paymentStore!.confirmPayment();
  }

  private getTitle(payment?: Payment) {
    return payment
      ? `Auszahlung vom ${this.props.mainStore!.formatDate(PaymentStore.convertPaymentTimestamp(payment.payment_timestamp))}`
      : `Details zur Auszahlung ${this.props.match.params.timestamp}`;
  }

  private getPainURL({ payment_timestamp }: Payment) {
    return this.props.mainStore!.apiURL(`payments/${payment_timestamp}.xml`);
  }
}

export const PaymentDetail = injectSheet(paymentDetailStyles)(withRouter(PaymentDetailInner));
