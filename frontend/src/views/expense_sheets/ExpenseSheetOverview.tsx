import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import ButtonGroup from 'reactstrap/lib/ButtonGroup';
import IziviContent from '../../layout/IziviContent';
import { OverviewTable } from '../../layout/OverviewTable';
import { ExpenseSheetStore } from '../../stores/expenseSheetStore';
import { MainStore } from '../../stores/mainStore';
import { Column, ExpenseSheetListing } from '../../types';
import { ExpenseSheetStatisticFormDialog } from './ExpenseSheetStatisticFormDialog';

interface Props {
  mainStore?: MainStore;
  expenseSheetStore?: ExpenseSheetStore;
}

interface State {
  loading: boolean;
  modalOpen: boolean;
  expenseSheetStateFilter: string | null;
}

@inject('mainStore', 'expenseSheetStore')
@observer
export class ExpenseSheetOverview extends React.Component<Props, State> {
  columns: Array<Column<ExpenseSheetListing>>;

  constructor(props: Props) {
    super(props);
    this.columns = [
      {
        id: 'zdp',
        label: 'ZDP',
        format: ({ user: { zdp } }: ExpenseSheetListing) => zdp,
      },
      {
        id: 'first_name',
        label: this.props.mainStore!.intl.formatMessage({
          id: 'izivi.frontend.views.expense_sheets.expenseSheetOverview.name',
          defaultMessage: 'Name',
        }),
        format: ({ user: { id, full_name } }: ExpenseSheetListing) => (
          <Link to={'/users/' + id}>{full_name}</Link>
        ),
      },
      {
        id: 'start',
        label: this.props.mainStore!.intl.formatMessage({
          id: 'izivi.frontend.views.expense_sheets.expenseSheetOverview.from',
          defaultMessage: 'Von',
        }),
        format: ({ beginning }: ExpenseSheetListing) => this.props.mainStore!.formatDate(beginning),
      },
      {
        id: 'end',
        label: this.props.mainStore!.intl.formatMessage({
          id: 'izivi.frontend.views.expense_sheets.expenseSheetOverview.until',
          defaultMessage: 'Bis',
        }),
        format: ({ ending }: ExpenseSheetListing) => this.props.mainStore!.formatDate(ending),
      },
    ];

    this.state = {
      loading: true,
      modalOpen: false,
      expenseSheetStateFilter: 'pending',
    };
  }

  componentDidMount(): void {
    this.loadContent();
  }

  loadContent = () => {
    this.props.expenseSheetStore!.fetchAll({ filter: this.state.expenseSheetStateFilter }).then(() => this.setState({ loading: false }));
  }

  updateSheetFilter = (state: string | null) => {
    this.setState({ loading: true, expenseSheetStateFilter: state }, () => this.loadContent());
  }

  render() {
    return (
      <IziviContent
        card
        loading={this.state.loading}
        title={
          this.props.mainStore!.intl.formatMessage({
            id: 'izivi.frontend.views.expense_sheets.expenseSheetOverview.expenses',
            defaultMessage: 'Spesen',
          })
        }
      >
        <Button outline className="mb-4 d-block" onClick={() => this.toggle()}>
          <FormattedMessage
            id="izivi.frontend.views.expense_sheets.expenseSheetOverview.generate_expense_statistics"
            defaultMessage="Spesenstatistik generieren"
          />
        </Button>
        <ButtonGroup className="mb-4">
          <Button
            outline={this.state.expenseSheetStateFilter !== null}
            color={this.state.expenseSheetStateFilter === null ? 'primary' : 'secondary'}
            onClick={() => this.updateSheetFilter(null)}
          >
            <FormattedMessage
              id="izivi.frontend.views.expense_sheets.expenseSheetOverview.all_expense_sheets"
              defaultMessage="Alle Spesenblätter"
            />
          </Button>
          <Button
            outline={this.state.expenseSheetStateFilter !== 'pending'}
            color={this.state.expenseSheetStateFilter === 'pending' ? 'primary' : 'secondary'}
            onClick={() => this.updateSheetFilter('pending')}
          >
            <FormattedMessage
              id="izivi.frontend.views.expense_sheets.expenseSheetOverview.pending_expense_sheets"
              defaultMessage="Pendente Spesenblätter"
            />
          </Button>
          <Button
            outline={this.state.expenseSheetStateFilter !== 'current'}
            color={this.state.expenseSheetStateFilter === 'current' ? 'primary' : 'secondary'}
            onClick={() => this.updateSheetFilter('current')}
          >
            <FormattedMessage
              id="izivi.frontend.views.expense_sheets.expenseSheetOverview.current_expense_sheets"
              defaultMessage="Aktuelle Spesenblätter"
            />
          </Button>
        </ButtonGroup>
        <ExpenseSheetStatisticFormDialog isOpen={this.state.modalOpen} mainStore={this.props.mainStore!} toggle={() => this.toggle()} />
        <OverviewTable
          columns={this.columns}
          data={this.props.expenseSheetStore!.expenseSheets}
          renderActions={(e: ExpenseSheetListing) => <Link to={'/expense_sheets/' + e.id}>
            <FormattedMessage
              id="izivi.frontend.views.expense_sheets.expenseSheetOverview.edit_expense_sheet"
              defaultMessage="Spesenblatt bearbeiten"
            />
          </Link>}
        />
      </IziviContent>
    );
  }

  protected toggle() {
    this.setState({ modalOpen: !this.state.modalOpen });
  }
}
