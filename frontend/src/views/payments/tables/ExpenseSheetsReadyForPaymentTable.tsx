import { get } from 'lodash';
import * as React from 'react';
import { FormattedMessage, IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { OverviewTable } from '../../../layout/OverviewTable';
import { ExpenseSheetStore } from '../../../stores/expenseSheetStore';
import { MainStore } from '../../../stores/mainStore';
import { PaymentStore } from '../../../stores/paymentStore';
import { ExpenseSheetListing } from '../../../types';
import { Formatter } from '../../../utilities/formatter';
import { ExpenseSheetPaymentWarnings } from './ExpenseSheetPaymentWarnings';

function getClomuns(intl: IntlShape) {
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
}

export const ExpenseSheetsReadyForPaymentTable = (props: ExpenseSheetsReadyForPaymentTableProps) => {
  if (props.toBePaidExpenseSheets.length > 0) {
    return (
      <>
        <OverviewTable
          columns={getClomuns(props.mainStore.intl)}
          data={props.toBePaidExpenseSheets}
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
