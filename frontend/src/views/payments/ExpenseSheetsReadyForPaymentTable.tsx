import { get } from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { OverviewTable } from '../../layout/OverviewTable';
import { PaymentStore } from '../../stores/paymentStore';
import { ExpenseSheetListing } from '../../types';
import { Formatter } from '../../utilities/formatter';
import { ExpenseSheetPaymentWarnings } from './ExpenseSheetPaymentWarnings';

const COLUMNS = [
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
    format: (expenseSheet: ExpenseSheetListing) => new Formatter().formatCurrency(expenseSheet.total),
  },
  {
    id: 'notices',
    label: 'Bemerkungen',
    format: (expenseSheet: ExpenseSheetListing) => <ExpenseSheetPaymentWarnings expenseSheet={expenseSheet}/>,
  },
];

interface ExpenseSheetsReadyForPaymentTableProps {
  toBePaidExpenseSheets: ExpenseSheetListing[];
  paymentStore: PaymentStore;
}

export const ExpenseSheetsReadyForPaymentTable = ({ toBePaidExpenseSheets, paymentStore }: ExpenseSheetsReadyForPaymentTableProps) => {
  if (toBePaidExpenseSheets.length > 0) {
    return (
      <>
        <OverviewTable
          columns={COLUMNS}
          data={toBePaidExpenseSheets}
          renderActions={({ id }: ExpenseSheetListing) => <Link to={'/expense_sheets/' + id}>Spesenblatt</Link>}
        />

        <Button
          color={'primary'}
          onClick={() => paymentStore.createPayment()}
          target={'_blank'}
        >
          Zahlung starten
        </Button>
      </>
    );
  } else {
    return <div className="text-muted">Keine Spesen zur Auszahlung bereit.</div>;
  }
};
