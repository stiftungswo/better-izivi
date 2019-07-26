import * as React from 'react';
import Table from 'reactstrap/lib/Table';
import { MainStore } from '../../stores/mainStore';
import { Holiday } from '../../types';

export const HolidayOverviewTable: React.FunctionComponent<{mainStore: MainStore}> = props => {
  const { formatDate } = props.mainStore;

  const columns = [
    {
      id: 'beginning',
      numeric: false,
      label: 'Start',
      format: (holiday: Holiday) => formatDate(holiday.beginning),
    },
    {
      id: 'ending',
      numeric: false,
      label: 'Ende',
      format: (holiday: Holiday) => formatDate(holiday.ending),
    },
    {
      id: 'holiday_type_id',
      numeric: false,
      label: 'Type',
    },
    {
      id: 'description',
      numeric: false,
      label: 'Beschreibung',
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
