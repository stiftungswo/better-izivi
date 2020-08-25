import { ary, compact, flatMap, partial } from 'lodash';
import * as React from 'react';
import { IntlShape, useIntl } from 'react-intl';
import { WithSheet } from 'react-jss';
import Table from 'reactstrap/lib/Table';
import Tooltip from 'reactstrap/lib/Tooltip';
import serviceSpecificationStyles from './serviceSpecificationOverviewStyle';

interface TableHeader {
  label: string;
  tooltip?: string;
  span?: {
    col?: number;
    row?: number;
  };
  subcolumns?: TableHeader[];
}

const getDailyExpensesSubcolumns = (intl: IntlShape) => {
  return [
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.first_day',
          defaultMessage: 'Erster Tag',
        }),
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.work',
          defaultMessage: 'Arbeit',
        }),
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.free',
          defaultMessage: 'Frei',
        }),
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.last_day',
          defaultMessage: 'Letzter Tag',
        }),
    },
  ];
};

const getColumns = (intl: IntlShape): TableHeader[] => {
  return [
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.active',
          defaultMessage: 'Aktiv',
        }),
      span: { row: 2 },
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
      span: { row: 2 },
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.name',
          defaultMessage: 'Name',
        }),
      span: { row: 2 },
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
      span: { row: 2 },
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
      span: { row: 2 },
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.accommodation',
          defaultMessage: 'Unterkunft',
        }),
      span: { row: 2 },
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.clothing',
          defaultMessage: 'Kleider',
        }),
      span: { row: 2 },
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.breakfast',
          defaultMessage: 'Frühstück',
        }),
      span: { col: 4 },
      subcolumns: getDailyExpensesSubcolumns(intl),
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.lunch',
          defaultMessage: 'Mittagessen',
        }),
      span: { col: 4 },
      subcolumns: getDailyExpensesSubcolumns(intl),
    },
    {
      label:
        intl.formatMessage({
          id: 'views.service_specification.ServiceSpecificationsOverviewTable.dinner',
          defaultMessage: 'Abendessen',
        }),
      span: { col: 6 },
      subcolumns: getDailyExpensesSubcolumns(intl),
    },
  ];
};

const TableHeaderTooltip: React.FunctionComponent<{ tableHeader: TableHeader, id: string }> = params => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (params.tableHeader.tooltip) {
    return (
      <>
        <div id={params.id}>{params.children}</div>
        <Tooltip placement="bottom" target={params.id} isOpen={isOpen} toggle={ary(partial(setIsOpen, !isOpen), 0)}>
          {params.tableHeader.tooltip}
        </Tooltip>
      </>
    );
  } else {
    return <>{params.children}</>;
  }
};

const OverviewTableHeader = (params: { tableHeaderClasses: string[] }) => {
  const intl = useIntl();
  const [mainTableHeaderClass, secondaryTableHeaderClass] = params.tableHeaderClasses;
  const secondaryTableHeaders = compact(
    flatMap<TableHeader[], TableHeader | undefined>(getColumns(intl), header => (header as TableHeader).subcolumns),
  );

  const layout = [
    { class: mainTableHeaderClass, columns: getColumns(intl) },
    { class: secondaryTableHeaderClass, columns: secondaryTableHeaders },
  ];

  return (
    <>
      {layout.map((headerRow, headerIndex) => {
        return (
          <tr key={headerIndex}>
            {headerRow.columns.map((column, columnIndex) => (
              <th
                className={headerRow.class}
                key={columnIndex}
                rowSpan={column.span ? column.span.row || 1 : 1}
                colSpan={column.span ? column.span.col || 1 : 1}
              >
                <TableHeaderTooltip tableHeader={column} id={`header-${headerIndex}-${columnIndex}`}>
                  {column.label}
                </TableHeaderTooltip>
              </th>
            ))}
          </tr>
        );
      })}
    </>
  );
};

export const ServiceSpecificationsOverviewTable: React.FunctionComponent<WithSheet<typeof serviceSpecificationStyles>> = props => {
  const { classes } = props;

  return (
    <Table hover={true} responsive={true}>
      <thead>
        <OverviewTableHeader tableHeaderClasses={[classes.th, classes.secondTh]} />
      </thead>
      <tbody>{props.children}</tbody>
    </Table>
  );
};
