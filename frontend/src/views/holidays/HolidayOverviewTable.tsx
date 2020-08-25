import { Moment } from 'moment';
import * as React from 'react';
import { IntlShape } from 'react-intl';
import Table from 'reactstrap/lib/Table';
import { MainStore } from '../../stores/mainStore';
import { Holiday } from '../../types';

function getColumns(formatDate: (date: string | Moment) => string, intl: IntlShape) {
  return [
    {
      id: 'beginning',
      numeric: false,
      label: intl.formatMessage({
        id: 'views.holidays.holidayOverviewTable.start',
        defaultMessage: 'Start',
      }),
      format: ({ beginning }: Holiday) => formatDate(beginning),
    },
    {
      id: 'ending',
      numeric: false,
      label: intl.formatMessage({
        id: 'views.holidays.holidayOverviewTable.end',
        defaultMessage: 'Ende',
      }),
      format: ({ ending }: Holiday) => formatDate(ending),
    },
    {
      id: 'holiday_type_id',
      numeric: false,
      label: intl.formatMessage({
        id: 'views.holidays.holidayOverviewTable.type',
        defaultMessage: 'Art',
      }),
    },
    {
      id: 'description',
      numeric: false,
      label: intl.formatMessage({
        id: 'views.holidays.holidayOverviewTable.description',
        defaultMessage: 'Beschreibung',
      }),
    },
    {
      id: 'save',
      numeric: false,
      label: '',
    },
    {
      id: 'delete',
      numeric: false,
      label: '',
    },
  ];
}

export const HolidayOverviewTable: React.FunctionComponent<{ mainStore: MainStore }> = props => {
  const { formatDate } = props.mainStore;
  const { intl } = props.mainStore;

  const columns = getColumns(formatDate, intl);

  return (
    <Table>
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column.id}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.children}
      </tbody>
    </Table>
  );
};
