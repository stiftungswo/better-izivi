import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import Col from 'reactstrap/lib/Col';
import Row from 'reactstrap/lib/Row';
import { ExpenseSheetStore } from '../../../../stores/expenseSheetStore';
import { ExpenseSheetState } from '../../../../types';
import { CheckRegularIcon, DoubleAngleLeftIcon, HourGlassRegularIcon, } from '../../../../utilities/Icon';
import { expenseSheetFormSegment } from './expenseSheetFormSegment';
import { CancelReadyForPayment } from './state_actions/CancelReadyForPayment';
import { SwitchToReadyForPayment } from './state_actions/SwitchToReadyForPayment';

function getResetToOpenButton() {
  return <Button color="danger"><FontAwesomeIcon icon={DoubleAngleLeftIcon}/> Zurück auf Offen setzen</Button>;
}

const getPaymentInProgressExplanation = () => {
  return (
    <div className="pt-2 d-table">
      <div className="d-table-cell"><FontAwesomeIcon color="orange" className="mr-2" icon={HourGlassRegularIcon}/></div>
      <div className="d-table-cell">
        Das Speseblatt befindet sich in der Auszahlung.
        <br/>
        Du kannst den Status in der <Link to="/payments">Auszahlungsübersicht</Link> ändern.
        {/*TODO: Link to exact payment*/}
      </div>
    </div>
  );
};

const getPaidExplanation = () => {
  return (
    <div className="pt-2 d-table">
      <div className="d-table-cell">
        <FontAwesomeIcon icon={CheckRegularIcon} color="green" className="mr-2"/>
      </div>
      <div className="d-table-cell">
        Das Spesenblatt wurde ausbezahlt
        <br/>
        Du siehst die ausbezahlten Spesen in der <Link to="/payments">Auszahlungsübersicht</Link>.
      </div>
    </div>
  );
};

const getStateAction = (state: ExpenseSheetState, expenseSheetStore: ExpenseSheetStore) => {
  switch (state) {
    case ExpenseSheetState.open:
      return <SwitchToReadyForPayment expenseSheetStore={expenseSheetStore}/>;
    case ExpenseSheetState.ready_for_payment:
      return <CancelReadyForPayment expenseSheetStore={expenseSheetStore}/>;
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
