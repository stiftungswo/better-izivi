import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { inject } from 'mobx-react';
import moment from 'moment';
import * as React from 'react';
import injectSheet, { WithSheet } from 'react-jss';
import Button from 'reactstrap/lib/Button';
import Tooltip from 'reactstrap/lib/Tooltip';
import { OverviewTable } from '../../layout/OverviewTable';
import { MainStore } from '../../stores/mainStore';
import { ExpenseSheet, ExpenseSheetListing, ExpenseSheetState, User } from '../../types';
import createStyles from '../../utilities/createStyles';
import { CheckSquareRegularIcon, ClockRegularIcon, EditSolidIcon, HourGlassRegularIcon, PrintSolidIcon } from '../../utilities/Icon';

interface Props extends WithSheet<typeof styles> {
  mainStore?: MainStore;
  user: User;
}

interface ReportSheetSubformState {
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
class ReportSheetSubformInner extends React.Component<Props, ReportSheetSubformState> {
  constructor(props: Props) {
    super(props);

    this.state = { openTooltips: [] };
  }

  render() {
    const { user, mainStore, classes } = this.props;

    return (
      <>
        <h3 className="mb-3">Spesenblätter</h3>
        {user && (
          <>
            <OverviewTable
              data={user.expense_sheets}
              columns={[
                {
                  id: 'beginning',
                  label: 'Von',
                  format: expenseSheet => (expenseSheet.beginning ? mainStore!.formatDate(expenseSheet.beginning) : ''),
                },
                {
                  id: 'end',
                  label: 'Bis',
                  format: expenseSheet => (expenseSheet.ending ? mainStore!.formatDate(expenseSheet.ending) : ''),
                },
                {
                  id: 'days',
                  label: 'Anzahl Tage',
                  format: expenseSheet => expenseSheet.duration,
                },
                {
                  id: 'state',
                  label: 'Status',
                  format: reportSheet => {
                    let icon = ClockRegularIcon;
                    let tooltip = 'Noch nicht fällig';
                    let color = 'black';

                    switch (reportSheet.state) {
                      case ExpenseSheetState.payment_in_progress:
                        icon = HourGlassRegularIcon;
                        tooltip = 'In Bearbeitung';
                        color = 'orange';
                        break;
                      case ExpenseSheetState.ready_for_payment:
                        icon = HourGlassRegularIcon;
                        tooltip = 'In Bearbeitung';
                        color = 'orange';
                        break;
                      case ExpenseSheetState.paid:
                        icon = CheckSquareRegularIcon;
                        tooltip = 'Erledigt';
                        color = 'green';
                        break;
                    }

                    return (
                      <>
                        <span id={'reportSheetState' + reportSheet.id}>
                          <FontAwesomeIcon icon={icon} color={color} />
                        </span>
                        <Tooltip
                          placement="bottom"
                          target={'reportSheetState' + reportSheet.id}
                          isOpen={this.state.openTooltips[reportSheet.id!]}
                          toggle={() => this.handleOpenTooltip(reportSheet.id!)}
                        >
                          {tooltip}
                        </Tooltip>
                      </>
                    );
                  },
                },
                {
                  id: 'print',
                  label: 'Drucken',
                  format: expenseSheet =>
                    expenseSheet.state === ExpenseSheetState.paid && mainStore!.isAdmin() ? (
                      <div className={classes.hideButtonText}>
                        <Button
                          color={'link'}
                          href={mainStore!.apiURL('expense_sheets/' + String(expenseSheet.id!) + '/download')}
                          tag={'a'}
                          target={'_blank'}
                        >
                          <FontAwesomeIcon icon={PrintSolidIcon} /> <span>Drucken</span>
                        </Button>
                      </div>
                    ) : (
                      <></>
                    ),
                },
              ]}
              renderActions={(expenseSheet: ExpenseSheetListing) => (
                <div>
                  {mainStore!.isAdmin() ? (
                    <div className={classes.hideButtonText}>
                      <Button color={'warning'} href={'/expense_sheets/' + expenseSheet.id} tag={'a'} target={'_blank'}>
                        <FontAwesomeIcon icon={EditSolidIcon} /> <span>Bearbeiten</span>
                      </Button>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              )}
            />
          </>
        )}
        {!user && <div>Loading...</div>}
      </>
    );
  }

  handleOpenTooltip = (id: number): void => {
    const opens = this.state.openTooltips;

    opens[id] = !opens[id];

    this.setState({ openTooltips: opens });
  }
}

export const ReportSheetSubform = injectSheet(styles)(ReportSheetSubformInner);
