import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import Col from 'reactstrap/lib/Col';
import Row from 'reactstrap/lib/Row';
import { ExpenseSheetStore } from '../../../../stores/expenseSheetStore';
import { ExpenseSheetState } from '../../../../types';
import { CheckRegularIcon, HourGlassRegularIcon } from '../../../../utilities/Icon';
import { expenseSheetFormSegment } from './expenseSheetFormSegment';
import { CancelReadyForPayment } from './state_actions/CancelReadyForPayment';
import { SwitchToReadyForPayment } from './state_actions/SwitchToReadyForPayment';

const getPaymentInProgressExplanation = () => {
  return (
    <div className="pt-2 d-table">
      <div className="d-table-cell"><FontAwesomeIcon color="orange" className="mr-2" icon={HourGlassRegularIcon} /></div>
      <div className="d-table-cell">
        <FormattedMessage
          id="izivi.frontend.views.expense_sheets.stateSegment.change_status_here"
          defaultMessage="Du kannst den Status in der {expensesOverview} ändern"
          values={{ expensesOverview: getExpensesOverviewLink() }}
        />
        <br />
      </div>
    </div>
  );
};

const getPaidExplanation = () => {
  return (
    <div className="pt-2 d-table">
      <div className="d-table-cell">
        <FontAwesomeIcon icon={CheckRegularIcon} color="green" className="mr-2" />
      </div>
      <div className="d-table-cell">
        <FormattedMessage
          id="izivi.frontend.views.expense_sheets.stateSegment.expenses_were_paid"
          defaultMessage="Das Spesenblatt wurde ausbezahlt"
        />
        <br />
        <FormattedMessage
          id="izivi.frontend.views.expense_sheets.stateSegment.see_paid_expenses"
          defaultMessage="Du siehst die ausbezahlten Spesen in der {expensesOverview}"
          values={{ expensesOverview: getExpensesOverviewLink() }}
        />
      </div>
    </div>
  );
};

const getExpensesOverviewLink = () => {
  return (
    <Link to="/payments">
      <FormattedMessage
        id="izivi.frontend.views.expense_sheets.stateSegment.payment_overview"
        defaultMessage="Auszahlungsübersicht"
      />
      {/*TODO: Link to exact payment*/}
    </Link>
  );
};

const getStateAction = (state: ExpenseSheetState, expenseSheetStore: ExpenseSheetStore) => {
  switch (state) {
    case ExpenseSheetState.open:
      return <SwitchToReadyForPayment expenseSheetStore={expenseSheetStore} />;
    case ExpenseSheetState.ready_for_payment:
      return <CancelReadyForPayment expenseSheetStore={expenseSheetStore} />;
    case ExpenseSheetState.payment_in_progress:
      return getPaymentInProgressExplanation();
    case ExpenseSheetState.paid:
      return getPaidExplanation();
  }
};

export const StateSegment = expenseSheetFormSegment(
  ({ expenseSheetState, expenseSheetStore }: { expenseSheetState: ExpenseSheetState, expenseSheetStore: ExpenseSheetStore }) => (
    <Row>
      <Col md="3" className="col-form-label">
        Status
      </Col>
      <Col md="9">
        {getStateAction(expenseSheetState, expenseSheetStore)}
      </Col>
    </Row>
  ),
);
