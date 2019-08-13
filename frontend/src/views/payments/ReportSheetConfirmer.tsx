import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import Button from 'reactstrap/lib/Button';
import { ExpenseSheetStore } from '../../stores/expenseSheetStore';
import { MainStore } from '../../stores/mainStore';
import { PaymentStore } from '../../stores/paymentStore';
import { PaymentEntry } from '../../types';
import { CheckSolidIcon, ExclamationSolidIcon, SquareRegularIcon, SyncSolidIcon } from '../../utilities/Icon';

interface Props {
  mainStore?: MainStore;
  paymentEntry: PaymentEntry;
  paymentStore?: PaymentStore;
  expenseSheetStore?: ExpenseSheetStore;
}

interface State {
  reportSheetState: number;
}

@inject('mainStore', 'paymentStore', 'expenseSheetStore')
@observer
export class ReportSheetConfirmer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      reportSheetState: this.props.paymentEntry.expense_sheet.state,
    };
  }

  updateState(sheetId: number, state: number) {
    this.props
      .expenseSheetStore!.putState(sheetId, state)
      .then(() => this.setState({ reportSheetState: state }))
      .catch(error => {
        this.props.mainStore!.displayError('Der Eintrag konnte nicht aktualisiert werden.');
        this.setState({ reportSheetState: -2 });
        throw error;
      });
  }

  render() {
    switch (this.state.reportSheetState) {
      case -2:
        return (
          <>
            <Button
              onClick={() => this.updateState(this.props.paymentEntry.expense_sheet.id!, 3)}
              color={'link'}
              style={{ margin: 0, padding: 0 }}
            >
              <FontAwesomeIcon icon={SquareRegularIcon} />
            </Button>{' '}
            <FontAwesomeIcon icon={ExclamationSolidIcon} title={'Fehler bei der Übertragung.'} />
          </>
        );
      case -1:
        return <FontAwesomeIcon spin icon={SyncSolidIcon} />;
      case 2:
        return (
          <Button
            onClick={() => this.updateState(this.props.paymentEntry.expense_sheet.id!, 3)}
            color={'link'}
            style={{ margin: 0, padding: 0 }}
          >
            <FontAwesomeIcon icon={SquareRegularIcon} />
          </Button>
        );
      case 3:
        return <FontAwesomeIcon icon={CheckSolidIcon} />;
      default:
        return <FontAwesomeIcon icon={ExclamationSolidIcon} title={'Ungültiger Zustand'} />;
    }
  }
}
