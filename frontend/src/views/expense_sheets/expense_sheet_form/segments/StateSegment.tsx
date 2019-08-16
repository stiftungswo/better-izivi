import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import Col from 'reactstrap/lib/Col';
import Row from 'reactstrap/lib/Row';
import { ExpenseSheet, ExpenseSheetState } from '../../../../types';
import {
  CheckRegularIcon,
  DoubleAngleLeftIcon,
  DoubleAngleRightIcon,
  HourGlassRegularIcon,
} from '../../../../utilities/Icon';
import { expenseSheetFormSegment } from './expenseSheetFormSegment';

function getStateAction(state: ExpenseSheetState) {
  switch (state) {
    case ExpenseSheetState.open:
      return <Button color="success"><FontAwesomeIcon icon={DoubleAngleRightIcon}/> Auf Bereit für Auszahlung ändern</Button>;
    case ExpenseSheetState.ready_for_payment:
      return <Button color="danger"><FontAwesomeIcon icon={DoubleAngleLeftIcon}/> Zurück auf Offen setzen</Button>;
    case ExpenseSheetState.payment_in_progress:
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
    case ExpenseSheetState.paid:
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
  }
}

export const StateSegment = expenseSheetFormSegment(
  ({ expenseSheet }: { expenseSheet: ExpenseSheet }) => (
    <Row>
      <Col md="3" className="col-form-label">
        Status
      </Col>
      <Col md="9">
        {getStateAction(expenseSheet.state)}
      </Col>
    </Row>
  ),
);
