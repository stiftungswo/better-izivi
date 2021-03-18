import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { FormattedMessage, IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import ButtonGroup from 'reactstrap/lib/ButtonGroup';
import Input from 'reactstrap/lib/Input';
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
  users_per_page: string;
  current_site: number;
}

@inject('mainStore', 'expenseSheetStore')
@observer
export class ExpenseSheetOverview extends React.Component<Props, State> {
  columns: Array<Column<ExpenseSheetListing>>;
  intl: IntlShape;

  constructor(props: Props) {
    super(props);
    this.intl = this.props.mainStore!.intl;
    this.columns = [
      {
        id: 'zdp',
        label: 'ZDP',
        format: ({ user: { zdp } }: ExpenseSheetListing) => zdp,
      },
      {
        id: 'first_name',
        label: this.props.mainStore!.intl.formatMessage({
          id: 'views.expense_sheets.expenseSheetOverview.name',
          defaultMessage: 'Name',
        }),
        format: ({ user: { id, full_name } }: ExpenseSheetListing) => (
          <Link to={'/users/' + id}>{full_name}</Link>
        ),
      },
      {
        id: 'start',
        label: this.props.mainStore!.intl.formatMessage({
          id: 'views.expense_sheets.expenseSheetOverview.from',
          defaultMessage: 'Von',
        }),
        format: ({ beginning }: ExpenseSheetListing) => this.props.mainStore!.formatDate(beginning),
      },
      {
        id: 'end',
        label: this.props.mainStore!.intl.formatMessage({
          id: 'views.expense_sheets.expenseSheetOverview.until',
          defaultMessage: 'Bis',
        }),
        format: ({ ending }: ExpenseSheetListing) => this.props.mainStore!.formatDate(ending),
      },
    ];

    this.state = {
      loading: true,
      modalOpen: false,
      expenseSheetStateFilter: 'current',
      users_per_page: '200',
      current_site: 1,
    };
    this.props.expenseSheetStore!.doFetchTotal({ filter: this.state.expenseSheetStateFilter });
  }

  componentDidMount(): void {
    this.loadContent();
  }

  loadContent = () => {
    this.props.expenseSheetStore!.doFetchPage({ filter: this.state.expenseSheetStateFilter,
                                                items: this.state.users_per_page,
                                                site: this.state.current_site })
                                                .then(() => this.setState({ loading: false }));
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
            id: 'layout.navigation.expenses',
            defaultMessage: 'Spesen',
          })
        }
      >
        <Button outline className="mb-4 d-block" onClick={() => this.toggle()}>
          <FormattedMessage
            id="views.expense_sheets.expenseSheetOverview.generate_expense_statistics"
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
              id="views.expense_sheets.expenseSheetOverview.all_expense_sheets"
              defaultMessage="Alle Spesenblätter"
            />
          </Button>
          <Button
            outline={this.state.expenseSheetStateFilter !== 'pending'}
            color={this.state.expenseSheetStateFilter === 'pending' ? 'primary' : 'secondary'}
            onClick={() => this.updateSheetFilter('pending')}
          >
            <FormattedMessage
              id="views.expense_sheets.expenseSheetOverview.pending_expense_sheets"
              defaultMessage="Pendente Spesenblätter"
            />
          </Button>
          <Button
            outline={this.state.expenseSheetStateFilter !== 'current'}
            color={this.state.expenseSheetStateFilter === 'current' ? 'primary' : 'secondary'}
            onClick={() => this.updateSheetFilter('current')}
          >
            <FormattedMessage
              id="views.expense_sheets.expenseSheetOverview.current_expense_sheets"
              defaultMessage="Aktuelle Spesenblätter"
            />
          </Button>
        </ButtonGroup>
        <ExpenseSheetStatisticFormDialog isOpen={this.state.modalOpen} mainStore={this.props.mainStore!} toggle={() => this.toggle()} />
        <OverviewTable
          columns={this.columns}
          data={this.props.expenseSheetStore!.expenseSheets}
          lastRow={
          <tfoot>
            <tr>
              <td>
                <Button
                  color={'danger'}
                  disabled={(this.state.current_site === 1) ? true : false}
                  onClick={() => {
                    const site = this.state.current_site - 1;
                    this.setState(prevState => ({
                    ...prevState,
                    current_site: site,
                    }), () => this.loadContent());
                  }}
                >
                  {
                    this.intl.formatMessage({
                      id: 'views.users.userOverview.previous_page',
                      defaultMessage: 'Vorherige Seite',
                      })
                  }
                </Button>
              </td>
              <td>
                {
                  this.intl.formatMessage({
                    id: 'views.users.userOverview.site',
                    defaultMessage: 'Seite:',
                    })
                }
                {this.state.current_site}
              </td>
              <td>
                <Button
                  color={'danger'}
                  onClick={() => {
                    const site = this.state.current_site + 1;
                    this.setState(prevState => ({
                    ...prevState,
                    current_site: site,
                    }), () => this.loadContent());
                  }}
                  disabled={this.props.expenseSheetStore!.buttonDeactive}
                >
                  {
                    this.intl.formatMessage({
                      id: 'views.users.userOverview.next_page',
                      defaultMessage: 'Nächste Seite',
                      })
                  }
                </Button>
              </td>
              <td>
                {
                  this.intl.formatMessage({
                    id: 'store.expenseSheetStore.expense_sheet_per_site',
                    defaultMessage: 'Spesenblätter pro Seite:',
                    })
                }
              </td>
              <td>
                <Input
                  type={'select'}
                  onChange={({
                    target: { value },
                  }: React.ChangeEvent<HTMLInputElement>) => {
                      this.setState(prevState => ({
                      ...prevState,
                      users_per_page: value,
                      current_site: 1,
                      }), () => this.loadContent());
                    }
                  }
                  value={this.state.users_per_page}
                >

                  {[
                    {
                      id: '200',
                      name: '200',
                    },
                    {
                      id: '100',
                      name: '100',
                    },
                    {
                      id: '50',
                      name: '50',
                    },
                  ].map((option) => (
                    <option value={option.id} key={option.id}>
                      {option.name}
                    </option>
                  ))}
                </Input>
              </td>
              </tr>
             <tr>
              <td>
                <b>
                  <FormattedMessage
                    id="layout.overviewTable.total_amount"
                    defaultMessage="Betrag Total: {amount}"
                    values={{
                      amount: this.props.expenseSheetStore!.totalSum + ' CHF',
                    }}
                  />
                </b>
              </td>
            </tr>
          </tfoot>
          }
          renderActions={(e: ExpenseSheetListing) => <Link to={'/expense_sheets/' + e.id}>
            <FormattedMessage
              id="views.expense_sheets.expenseSheetOverview.edit_expense_sheet"
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
