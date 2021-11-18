import { get } from 'lodash';
import * as React from 'react';
import { FormattedMessage, IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { OverviewTable } from '../../../layout/OverviewTable';
import { ApiStore, baseUrl } from '../../../stores/apiStore';
import { ExpenseSheetStore } from '../../../stores/expenseSheetStore';
import { MainStore } from '../../../stores/mainStore';
import { PaymentStore } from '../../../stores/paymentStore';
import { ExpenseSheetListing } from '../../../types';
import { Formatter } from '../../../utilities/formatter';
import { ExpenseSheetPaymentWarnings } from './ExpenseSheetPaymentWarnings';

function getColumns(intl: IntlShape) {
  return [
    {
      id: 'zdp',
      label: intl.formatMessage({
        id: 'payments.expenseSheetsReadyForPaymentTable.zdp',
        defaultMessage: 'ZDP',
      }),
      format: (expenseSheet: ExpenseSheetListing) => get(expenseSheet, 'user.zdp', ''),
    },
    {
      id: 'full_name',
      label: intl.formatMessage({
        id: 'payments.expenseSheetsReadyForPaymentTable.name',
        defaultMessage: 'Name',
      }),
      format: (expenseSheet: ExpenseSheetListing) => get(expenseSheet, 'user.full_name', ''),
    },
    {
      id: 'iban',
      label: intl.formatMessage({
        id: 'payments.expenseSheetsReadyForPaymentTable.iban',
        defaultMessage: 'IBAN',
      }),
      format: (expenseSheet: ExpenseSheetListing) => get(expenseSheet, 'user.bank_iban', ''),
    },
    {
      id: 'total',
      label: intl.formatMessage({
        id: 'payments.expenseSheetsReadyForPaymentTable.amount',
        defaultMessage: 'Betrag',
      }),
      format: (expenseSheet: ExpenseSheetListing) => new Formatter().formatCurrency(expenseSheet.total),
    },
    {
      id: 'notices',
      label: intl.formatMessage({
        id: 'payments.expenseSheetsReadyForPaymentTable.comment',
        defaultMessage: 'Bemerkung',
      }),
      format: (expenseSheet: ExpenseSheetListing) => <ExpenseSheetPaymentWarnings expenseSheet={expenseSheet} />,
    },
  ];
}

interface ExpenseSheetsReadyForPaymentTableProps {
  toBePaidExpenseSheets: ExpenseSheetListing[];
  paymentStore: PaymentStore;
  expenseSheetStore: ExpenseSheetStore;
  mainStore: MainStore;
  apiStore?: ApiStore;
}

function formatExpenseSheets(expenseSheets: ExpenseSheetListing[]): ExpenseSheetListing[] {
  // don't want to edit the original data
  const copy = JSON.parse(JSON.stringify(expenseSheets)) as ExpenseSheetListing[];

  copy.forEach(e => {
    e.user.bank_iban = e.user.bank_iban.match(/.{1,4}/g)!.join(' ');
  });

  return copy;
}

function handleGeneratePdf(rawToken: string, locale: string) {
  let url = `${baseUrl}/payments_list.pdf`;

  url += `?locale=${locale}&token=${rawToken}`;

  const win = window.open(url, '_blank');
  if (win) {
    // actions.setSubmitting(false);
    win.focus();
  }
}

export const ExpenseSheetsReadyForPaymentTable = (props: ExpenseSheetsReadyForPaymentTableProps) => {
  if (props.toBePaidExpenseSheets.length > 0) {
    return (
      <>
        <OverviewTable
          columns={getColumns(props.mainStore.intl)}
          data={formatExpenseSheets(props.toBePaidExpenseSheets)}
          renderActions={({ id }: ExpenseSheetListing) => <Link to={'/expense_sheets/' + id}>
            <FormattedMessage
              id="payments.expenseSheetsReadyForPaymentTable.expense_sheet"
              defaultMessage="Spesenblatt"
            />
          </Link>}
        />

        <Button
          color="primary"
          onClick={() => props.paymentStore.createPayment().then(() => props.expenseSheetStore.fetchToBePaidAll())}
          target="_blank"
        >
          <FormattedMessage
            id="payments.expenseSheetsReadyForPaymentTable.start_payment"
            defaultMessage="Zahlung starten"
          />
        </Button>

        <Button
          color={'secondary'}
          onClick={() => {handleGeneratePdf(props.apiStore!.rawToken, props.mainStore.locale); }}
          style={{ marginLeft: '12px' }}
        >
          <FormattedMessage
            id="payments.expenseSheetsReadyForPaymentTable.pdf"
          />
        </Button>
      </>
    );
  } else {
    return (
      <div className="text-muted">
        <FormattedMessage
          id="payments.expenseSheetsReadyForPaymentTable.no_expenses_ready_for_payment"
          defaultMessage="Keine Spesen zur Auszahlung bereit."
        />
      </div>
    );
  }
};
