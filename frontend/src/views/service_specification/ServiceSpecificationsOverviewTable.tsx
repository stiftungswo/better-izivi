import * as React from 'react';
import { IntlShape, useIntl } from 'react-intl';
import { WithSheet } from 'react-jss';
import Table from 'reactstrap/lib/Table';
import Tooltip from 'reactstrap/lib/Tooltip';
import serviceSpecificationStyles from './serviceSpecificationOverviewStyle';

interface TableHeader {
  label: string;
  tooltip?: string;
}

const getColumns = (intl: IntlShape): TableHeader[] => {
  return [
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.active',
          defaultMessage: 'Aktiv',
        }),
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.id',
          defaultMessage: 'ID',
        }),
      tooltip:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.service_specification_number',
          defaultMessage: 'Pflichtenheft Nummer',
        }),
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.name',
          defaultMessage: 'Name',
        }),
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.short_name_short',
          defaultMessage: 'KN',
        }),
      tooltip:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.short_name',
          defaultMessage: 'Kurz-Name',
        }),
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.pocket_money',
          defaultMessage: 'Taschengeld',
        }),
      tooltip:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.pocket_money_tooltip',
          defaultMessage: 'Taschengeld (Fixer Betrag)',
        }),
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.accommodation',
          defaultMessage: 'Unterkunft',
        }),
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.clothing',
          defaultMessage: 'Kleider',
        }),
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.formbricks_survey',
          defaultMessage: 'Feedback-Umfrage',
        }),
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.site',
          defaultMessage: 'Standort',
        }),
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.expenses',
          defaultMessage: 'Verpflegungsspesen',
        }),
    },
  ];
};

// active, id, name, short_name, pocket_money, accommodation, clothing, formbricks_survey, site, expenses-toggle,
// plus the trailing action-button column every row renders.
export const TABLE_COLUMN_COUNT = 11;

const TableHeaderTooltip: React.FunctionComponent<{ tableHeader: TableHeader, id: string }> = params => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (params.tableHeader.tooltip) {
    return (
      <>
        <div id={params.id}>{params.children}</div>
        <Tooltip placement="bottom" target={params.id} isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
          {params.tableHeader.tooltip}
        </Tooltip>
      </>
    );
  } else {
    return <>{params.children}</>;
  }
};

const OverviewTableHeader = (params: { tableHeaderClass: string }) => {
  const intl = useIntl();
  const columns = getColumns(intl);

  return (
    <tr>
      {columns.map((column, columnIndex) => (
        <th className={params.tableHeaderClass} key={columnIndex}>
          <TableHeaderTooltip tableHeader={column} id={`header-${columnIndex}`}>
            {column.label}
          </TableHeaderTooltip>
        </th>
      ))}
    </tr>
  );
};

export const ServiceSpecificationsOverviewTable: React.FunctionComponent<WithSheet<typeof serviceSpecificationStyles>> = props => {
  const { classes } = props;

  return (
    <Table hover={true} responsive={true}>
      <thead>
        <OverviewTableHeader tableHeaderClass={classes.th} />
      </thead>
      <tbody>{props.children}</tbody>
    </Table>
  );
};
