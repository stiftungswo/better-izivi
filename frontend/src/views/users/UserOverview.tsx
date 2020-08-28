import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { FormattedMessage, IntlShape } from 'react-intl';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import FormGroup from 'reactstrap/lib/FormGroup';
import Input from 'reactstrap/lib/Input';
import { DatePickerInput } from '../../form/DatePickerField';
import Overview from '../../layout/Overview';
import { MainStore } from '../../stores/mainStore';
import { UserStore } from '../../stores/userStore';
import { Column, UserOverview as UserOverviewType } from '../../types';
import { translateUserRole } from '../../utilities/helpers';

interface Props {
  mainStore?: MainStore;
  userStore?: UserStore;
}

@inject('mainStore', 'userStore')
@observer
export class UserOverview extends React.Component<Props> {
  columns: Array<Column<UserOverviewType>>;
  intl: IntlShape;

  constructor(props: Props) {
    super(props);
    this.intl = this.props.mainStore!.intl;
    this.columns = [
      {
        id: 'zdp',
        label: this.intl.formatMessage({
          id: 'views.users.userOverview.zdp',
          defaultMessage: 'ZDP',
        }),
        format: ({ zdp }: UserOverviewType) => zdp,
      },
      {
        id: 'name',
        label: this.intl.formatMessage({
          id: 'views.users.userOverview.name',
          defaultMessage: 'Name',
        }),
        format: (user: UserOverviewType) => (
          <Link to={'/users/' + user.id}>{`${user.full_name}`}</Link>
        ),
      },
      {
        id: 'start',
        label: this.intl.formatMessage({
          id: 'views.users.userOverview.from',
          defaultMessage: 'Von',
        }),
        format: (user: UserOverviewType) =>
          user.beginning
            ? this.props.mainStore!.formatDate(user.beginning)
            : '',
      },
      {
        id: 'end',
        label: this.intl.formatMessage({
          id: 'views.users.userOverview.until',
          defaultMessage: 'Bis',
        }),
        format: (user: UserOverviewType) =>
          user.ending ? this.props.mainStore!.formatDate(user.ending) : '',
      },
      {
        id: 'active',
        label: this.intl.formatMessage({
          id: 'views.users.userOverview.active',
          defaultMessage: 'Aktiv',
        }),
      },
      {
        id: 'userRole',
        label: this.intl.formatMessage({
          id: 'views.users.userOverview.group',
          defaultMessage: 'Gruppe',
        }),
        format: translateUserRole,
      },
    ];
  }

  render() {
    return (
      <Overview
        columns={this.columns}
        store={this.props.userStore!}
        title={this.intl.formatMessage({
          id: 'layout.navigation.employee_list',
          defaultMessage: 'Mitarbeiterliste',
        })}
        renderActions={(user: UserOverviewType) => (
          <Button
            color={'danger'}
            onClick={() => this.props.userStore!.delete(user.id!)}
          >
            <FormattedMessage
              id="views.users.userOverview.delete"
              defaultMessage="Löschen"
            />
          </Button>
        )}
        filter={true}
        firstRow={
          <tr>
            <td>
              <Input
                type={'text'}
                onChange={({
                  target: { value },
                }: React.ChangeEvent<HTMLInputElement>) => {
                  this.props.userStore!.updateFilters({ zdp: value });
                }}
                value={this.props.userStore!.userFilters.zdp || ''}
              />
            </td>
            <td>
              <Input
                type={'text'}
                onChange={({
                  target: { value },
                }: React.ChangeEvent<HTMLInputElement>) => {
                  this.props.userStore!.updateFilters({ name: value });
                }}
                value={this.props.userStore!.userFilters.name}
              />
            </td>
            <td>
              <DatePickerInput
                value={new Date(this.props.userStore!.userFilters.beginning)}
                onChange={(date: Date) => {
                  this.props.userStore!.updateFilters({
                    beginning: date.toISOString(),
                  });
                }}
              />
            </td>
            <td>
              <DatePickerInput
                value={new Date(this.props.userStore!.userFilters.ending)}
                onChange={(date: Date) => {
                  this.props.userStore!.updateFilters({
                    ending: date.toISOString(),
                  });
                }}
              />
            </td>
            <td>
              <FormGroup check>
                <Input
                  type={'checkbox'}
                  onChange={({
                    target: { checked },
                  }: React.ChangeEvent<HTMLInputElement>) => {
                    this.props.userStore!.updateFilters({ active: checked });
                  }}
                  checked={this.props.userStore!.userFilters.active}
                />
              </FormGroup>
            </td>
            <td>
              <Input
                type={'select'}
                onChange={({
                  target: { value },
                }: React.ChangeEvent<HTMLInputElement>) => {
                  this.props.userStore!.updateFilters({ role: value });
                }}
                value={this.props.userStore!.userFilters.role || ''}
              >
                {[
                  {
                    id: '',
                    name: this.intl.formatMessage({
                      id: 'views.users.userOverview.all',
                      defaultMessage: 'Alle',
                    }),
                  },
                  {
                    id: 'civil_servant',
                    name: this.intl.formatMessage({
                      id:
                        'views.users.userOverview.civil_servant',
                      defaultMessage: 'Zivi',
                    }),
                  },
                  {
                    id: 'admin',
                    name: this.intl.formatMessage({
                      id: 'views.users.userOverview.admin',
                      defaultMessage: 'Admin',
                    }),
                  },
                ].map((option) => (
                  <option value={option.id} key={option.id}>
                    {option.name}
                  </option>
                ))}
              </Input>
            </td>
          </tr>
        }
      />
    );
  }
}
