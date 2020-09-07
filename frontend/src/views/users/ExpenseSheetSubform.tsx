import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { inject } from 'mobx-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import injectSheet, { WithSheet } from 'react-jss';
import Button from 'reactstrap/lib/Button';
import Tooltip from 'reactstrap/lib/Tooltip';
import { LoadingInformation } from '../../layout/LoadingInformation';
import { OverviewTable } from '../../layout/OverviewTable';
import { MainStore } from '../../stores/mainStore';
import { ExpenseSheetState, ShortExpenseSheetListing, User } from '../../types';
import createStyles from '../../utilities/createStyles';
import { CheckSquareRegularIcon, ClockRegularIcon, EditSolidIcon, HourGlassRegularIcon, PrintSolidIcon } from '../../utilities/Icon';

interface Props extends WithSheet<typeof styles> {
  mainStore?: MainStore;
  user: User;
}

interface ExpenseSheetSubformState {
  openTooltips: boolean[];
}

const styles = () =>
  createStyles({
    hideButtonText: {
      '@media (max-width: 1024px)': {
        '& button': {
          width: '40px',
        },
        '& span': {
          display: 'none',
        },
      },
      'marginTop': '-0.5rem',
    },
  });

@inject('mainStore')
class ExpenseSheetSubformInner extends React.Component<Props, ExpenseSheetSubformState> {

  constructor(props: Props) {
    super(props);

    this.state = { openTooltips: [] };
  }

  handleOpenTooltip = (id: number) => {
    const { openTooltips } = this.state;

    openTooltips[id] = !openTooltips[id];

    this.setState({ openTooltips });
  }

  render() {
    const { user, mainStore, classes } = this.props;

    return (
      <div id="expense-sheets">
        <h3 className="mb-3">
          <FormattedMessage
            id="views.users.expenseSheetSubform.expense_sheets"
            defaultMessage="Spesenblätter"
          />
        </h3>
        {user && (
          <OverviewTable
            data={user.expense_sheets}
            columns={this.getColumns()}
            renderActions={(expenseSheet: ShortExpenseSheetListing) => (
              <div>
                {mainStore!.isAdmin() && (
                  <div className={classes.hideButtonText}>
                    <Button color={'warning'} href={'/expense_sheets/' + expenseSheet.id} tag={'a'} target={'_blank'}>
                      <FormattedMessage
                        id="views.users.expenseSheetSubform.edit"
                        defaultMessage="{icon} Bearbeiten"
                        values={{
                          icon: <FontAwesomeIcon icon={EditSolidIcon} />,
                        }}
                      />
                    </Button>
                  </div>
                )}
              </div>
            )}
          />
        )}
        {!user && <LoadingInformation />}
      </div>
    );
  }

  private getColumns() {
    const intl = this.props.mainStore!.intl;

    return [
      {
        id: 'beginning',
        label: intl.formatMessage({
          id: 'views.users.expenseSheetSubform.from',
          defaultMessage: 'Von',
        }),
        format: (expenseSheet: ShortExpenseSheetListing) => this.safeFormatDate(expenseSheet.beginning),
      },
      {
        id: 'end',
        label: intl.formatMessage({
          id: 'views.users.expenseSheetSubform.until',
          defaultMessage: 'Bis',
        }),
        format: (expenseSheet: ShortExpenseSheetListing) => this.safeFormatDate(expenseSheet.ending),
      },
      {
        id: 'days',
        label: intl.formatMessage({
          id: 'views.users.expenseSheetSubform.number_of_days',
          defaultMessage: 'Anzahl Tage',
        }),
        format: (expenseSheet: ShortExpenseSheetListing) => expenseSheet.duration,
      },
      {
        id: 'state',
        label: intl.formatMessage({
          id: 'views.users.expenseSheetSubform.status',
          defaultMessage: 'Status',
        }),
        format: this.formatExpenseSheetStateColumn.bind(this),
      },
      {
        id: 'print',
        label: intl.formatMessage({
          id: 'views.users.expenseSheetSubform.print',
          defaultMessage: 'Drucken',
        }),
        format: this.formatExpenseSheetPrintColumn.bind(this),
      },
    ];
  }

  private formatExpenseSheetPrintColumn(expenseSheet: ShortExpenseSheetListing) {
    if (expenseSheet.state === ExpenseSheetState.paid) {
      return (
        <div className={this.props.classes.hideButtonText}>
          <Button
            color={'link'}
            href={this.props.mainStore!.apiURL(`expense_sheets/${expenseSheet.id!}.pdf`)}
            tag={'a'}
            target={'_blank'}
            className="pl-0"
          >
            <FontAwesomeIcon icon={PrintSolidIcon} /> <span>
              <FormattedMessage
                id="views.users.expenseSheetSubform.print"
                defaultMessage="Drucken"
              />
            </span>
          </Button>
        </div>
      );
    } else {
      return <React.Fragment />;
    }
  }

  private formatExpenseSheetStateColumn(expenseSheet: ShortExpenseSheetListing) {
    const { icon, tooltip, color } = this.getExpenseSheetColumnProps(expenseSheet);

    return (
      <>
        <span id={'expenseSheetState' + expenseSheet.id}>
          <FontAwesomeIcon icon={icon} color={color} />
        </span>
        <Tooltip
          placement="bottom"
          target={'expenseSheetState' + expenseSheet.id}
          isOpen={this.state.openTooltips[expenseSheet.id!]}
          toggle={() => this.handleOpenTooltip(expenseSheet.id!)}
        >
          {tooltip}
        </Tooltip>
      </>
    );
  }

  private safeFormatDate(date: string) {
    return date ? this.props.mainStore!.formatDate(date) : '';
  }

  private getExpenseSheetColumnProps({ state }: ShortExpenseSheetListing) {
    const intl = this.props.mainStore!.intl;

    switch (state) {
      case ExpenseSheetState.payment_in_progress:
        return {
          icon: HourGlassRegularIcon,
          tooltip: intl.formatMessage({
            id: 'views.users.expenseSheetSubform.in_progress',
            defaultMessage: 'In Bearbeitung',
          }),
          color: 'orange',
        };
      case ExpenseSheetState.ready_for_payment:
        return {
          icon: HourGlassRegularIcon,
          tooltip: intl.formatMessage({
            id: 'views.users.expenseSheetSubform.in_progress',
            defaultMessage: 'In Bearbeitung',
          }),
          color: 'orange',
        };
      case ExpenseSheetState.paid:
        return {
          icon: CheckSquareRegularIcon,
          tooltip: intl.formatMessage({
            id: 'views.users.expenseSheetSubform.done',
            defaultMessage: 'Erledigt',
          }),
          color: 'green',
        };
      default:
        return {
          icon: ClockRegularIcon,
          tooltip: intl.formatMessage({
            id: 'views.users.expenseSheetSubform.not_yet_due',
            defaultMessage: 'Noch nicht fällig',
          }),
          color: 'black',
        };
    }
  }
}

export const ExpenseSheetSubform = injectSheet(styles)(ExpenseSheetSubformInner);
