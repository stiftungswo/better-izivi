import * as React from 'react';
import { Payment } from '../../../types';
import { PaymentsTable } from './PaymentsTable';

export const PaymentsInProgressTable = ({ payments }: { payments: Payment[] }) => {
  if (payments.length > 0) {
    return <PaymentsTable payments={payments}/>;
  } else {
    return <span className="text-muted">Keine Zahlung in Bearbeitung</span>;
  }
};
