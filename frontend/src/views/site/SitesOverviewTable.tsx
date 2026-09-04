import * as React from 'react';
import { useIntl } from 'react-intl';
import { WithSheet } from 'react-jss';
import Table from 'reactstrap/lib/Table';
import serviceSpecificationStyles from '../service_specification/serviceSpecificationOverviewStyle';

export const SitesOverviewTable: React.FunctionComponent<WithSheet<typeof serviceSpecificationStyles>> = props => {
  const { classes } = props;
  const intl = useIntl();

  return (
    <Table hover={true} responsive={true}>
      <thead>
        <tr>
          <th className={classes.th}>
            {intl.formatMessage({ id: 'views.site.SitesOverviewTable.name', defaultMessage: 'Name' })}
          </th>
          <th className={classes.th}>
            {intl.formatMessage({ id: 'views.site.SitesOverviewTable.language', defaultMessage: 'Sprache' })}
          </th>
          <th className={classes.th}>
            {intl.formatMessage({ id: 'views.site.SitesOverviewTable.terms_pdf', defaultMessage: 'Anstellungsbedingungen' })}
          </th>
          <th className={classes.th} />
        </tr>
      </thead>
      <tbody>{props.children}</tbody>
    </Table>
  );
};
