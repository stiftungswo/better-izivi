import * as React from 'react';
import Badge from 'reactstrap/lib/Badge';
import { ExpenseSheetState, Service } from '../../../types';
import { Formatter } from '../../../utilities/formatter';

const formatDate = (date: Date | null) => {
  if (!date) {
    return 'Unbekannt';
  }

  return new Formatter().formatDate(date.toString());
};

const stateLabel = (state: ExpenseSheetState) => {
  switch (state) {
    case ExpenseSheetState.open:
      return 'Offen';
    case ExpenseSheetState.ready_for_payment:
      return 'Bereit für Zahlung';
    case ExpenseSheetState.payment_in_progress:
      return 'Zahlung in bearbeitung';
    case ExpenseSheetState.paid:
      return 'Bezahlt';
  }
};

export const ExpenseSheetFormHeader = (props: { service: Service, expenseSheetState: ExpenseSheetState }) => {
  return (
    <h5 className="mb-5 text-secondary">
      Für den Einsatz{' '}
      <span className="text-body">{props.service.service_specification.name}</span>
      {' '}vom{' '}
      <span className="text-body">{formatDate(props.service.beginning)}</span>
      {' '}bis{' '}
      <span className="text-body">{formatDate(props.service.ending)}</span>
      <Badge color="secondary" className="ml-3 align-bottom" pill>{stateLabel(props.expenseSheetState)}</Badge>
    </h5>
  );
};
