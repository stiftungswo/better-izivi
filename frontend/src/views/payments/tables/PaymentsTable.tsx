import * as React from 'react';
import { FormattedMessage, IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';
import { OverviewTable } from '../../../layout/OverviewTable';
import { MainStore } from '../../../stores/mainStore';
import { PaymentStore } from '../../../stores/paymentStore';
import { Payment } from '../../../types';
import { Formatter } from '../../../utilities/formatter';

function getClomuns(intl: IntlShape) {
  return [
    {
      id: 'created_at',
      label: intl.formatMessage({
        id: 'izivi.frontend.payments.paymentsTable.date',
        defaultMessage: 'Datum',
      }),
      format: (payment: Payment) => new Formatter().formatDate(PaymentStore.convertPaymentTimestamp(payment.payment_timestamp)),
    },
    {
      id: 'amount',
      label: intl.formatMessage({
        id: 'izivi.frontend.payments.paymentsTable.amount',
        defaultMessage: 'Betrag',
      }),
      format: (payment: Payment) => new Formatter().formatCurrency(payment.total),
    },
  ];
}

export const PaymentsTable = ({ payments, emptyNotice, mainStore }: { payments: Payment[], emptyNotice: string, mainStore: MainStore }) => {
  if (payments.length <= 0) {
    return <span className="text-muted">{emptyNotice}</span>;
  } else {
    return (
      <OverviewTable
        columns={getClomuns(mainStore.intl)}
        data={payments}
        renderActions={({ payment_timestamp }: Payment) => <Link to={'/payments/' + payment_timestamp}>
          <FormattedMessage
            id="izivi.frontend.payments.paymentsTable.details"
            defaultMessage="Details"
          />
        </Link>}
      />
    );
  }
};
