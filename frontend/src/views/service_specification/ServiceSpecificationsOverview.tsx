import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, FormikActions } from 'formik';
import { inject } from 'mobx-react';
import * as React from 'react';
import injectSheet, { WithSheet } from 'react-jss';
import Button from 'reactstrap/lib/Button';
import Table from 'reactstrap/lib/Table';
import Tooltip from 'reactstrap/lib/Tooltip';
import { CheckboxField } from '../../form/CheckboxField';
import { TextField } from '../../form/common';
import { WiredField } from '../../form/formik';
import IziviContent from '../../layout/IziviContent';
import { MainStore } from '../../stores/mainStore';
import { ServiceSpecificationStore } from '../../stores/serviceSpecificationStore';
import { ServiceSpecification } from '../../types';
import { PlusSquareRegularIcon, SaveRegularIcon } from '../../utilities/Icon';
import serviceSpecificationStyles from './serviceSpecificationOverviewStyle';
import serviceSpecificationSchema from './serviceSpecificationSchema';

interface ServiceSpecificationProps extends WithSheet<typeof serviceSpecificationStyles> {
  serviceSpecificationStore?: ServiceSpecificationStore;
  mainStore?: MainStore;
}

interface ServiceSpecificationState {
  loading: boolean;
  openThTooltips: boolean[][];
}

interface TableHeader {
  label: string;
  tooltip?: string;
  span?: {
    col?: number;
    row?: number;
  };
  className?: string;
}

@inject('serviceSpecificationStore', 'mainStore')
export class ServiceSpecificationsOverviewInner extends React.Component<ServiceSpecificationProps, ServiceSpecificationState> {
  columns: TableHeader[][] = [];

  constructor(props: ServiceSpecificationProps) {
    super(props);

    this.props.serviceSpecificationStore!.fetchAll().then(() => {
      this.setState({ loading: false });
    });

    this.state = {
      loading: true,
      openThTooltips: [[], []],
    };

    this.columns[0] = [
      {
        label: 'Aktiv',
        span: { row: 2 },
      },
      {
        label: 'ID',
        span: { row: 2 },
      },
      {
        label: 'Name',
        span: { row: 2 },
      },
      {
        label: 'KN',
        tooltip: 'Kurz-Name',
        span: { row: 2 },
      },
      {
        label: 'Taschengeld',
        span: { row: 2 },
      },
      {
        label: 'Unterkunft',
        span: { row: 2 },
      },
      {
        label: 'Kleider',
        span: { row: 2 },
      },
      {
        label: 'Frühstück',
        span: { col: 4 },
      },
      {
        label: 'Mittagessen',
        span: { col: 4 },
      },
      {
        label: 'Abendessen',
        span: { col: 6 },
      },
    ];

    this.columns[1] = [
      { label: 'Erster Tag' },
      { label: 'Arbeit' },
      { label: 'Frei' },
      { label: 'Letzter Tag' },
      { label: 'Erster Tag' },
      { label: 'Arbeit' },
      { label: 'Frei' },
      { label: 'Letzter Tag' },
      { label: 'Erster Tag' },
      { label: 'Arbeit' },
      { label: 'Frei' },
      { label: 'Letzter Tag' },
      { label: '', span: { col: 2 } },
    ];
  }

  handleTableHeaderTooltip = (row: number, id: number): void => {
    const opens = this.state.openThTooltips;

    opens[row][id] = opens[row][id] ? !opens[row][id] : true;

    this.setState({ openThTooltips: opens });
  }

  handleSubmit = async (entity: ServiceSpecification, actions: FormikActions<ServiceSpecification>) => {
    this.props.serviceSpecificationStore!.put(serviceSpecificationSchema.cast(entity)).then(() => actions.setSubmitting(false));
  }

  handleAdd = async (entity: ServiceSpecification, actions: FormikActions<ServiceSpecification>) => {
    await this.props.serviceSpecificationStore!.post(serviceSpecificationSchema.cast(entity)).then(() => {
      actions.setSubmitting(false);
      actions.resetForm();
    });
  }

  render() {
    const entities = this.props.serviceSpecificationStore!.entities;
    const { classes } = this.props!;
    const { openThTooltips } = this.state;

    return (
      <IziviContent loading={this.state.loading} title={'Pflichtenheft'} card={true}>
        <Table hover={true} responsive={true}>
          <thead>
            {this.columns.map((column, columnIndex) => {
              const thClass = columnIndex === 0 ? classes.th : classes.secondTh;

              return (
                <tr key={columnIndex}>
                  {column.map((tableHeader, tableHeaderIndex) => {
                    let content = <>{tableHeader.label}</>;

                    if (tableHeader.tooltip) {
                      content = (
                        <>
                          <div id={'thTooltips' + tableHeaderIndex}>{tableHeader.label}</div>
                          <Tooltip
                            placement="bottom"
                            target={'thTooltips' + tableHeaderIndex}
                            isOpen={(openThTooltips[columnIndex] && openThTooltips[columnIndex][tableHeaderIndex]) || false}
                            toggle={() => this.handleTableHeaderTooltip(tableHeaderIndex, columnIndex)}
                          >
                            {tableHeader.tooltip}
                          </Tooltip>
                        </>
                      );
                    }

                    return (
                      <th
                        className={thClass}
                        key={tableHeaderIndex}
                        rowSpan={tableHeader.span ? tableHeader.span.row || 1 : 1}
                        colSpan={tableHeader.span ? tableHeader.span.col || 1 : 1}
                      >
                        {content}
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody>
            <Formik
              validationSchema={serviceSpecificationSchema}
              initialValues={{
                identification_number: '',
                name: '',
                short_name: '',
                work_clothing_expenses: 0,
                work_days_expenses: { breakfast: 0, lunch: 0, dinner: 0 },
                paid_vacation_expenses: { breakfast: 0, lunch: 0, dinner: 0 },
                first_day_expenses: { breakfast: 0, lunch: 0, dinner: 0 },
                last_day_expenses: { breakfast: 0, lunch: 0, dinner: 0 },
                accommodation_expenses: 0,
                active: false,
                pocket_money: 5,
              }}
              onSubmit={this.handleAdd}
              render={formikProps => (
                <tr>
                  <ServiceSpecificationFormFields {...this.props} />
                  <td className={classes.buttonsTd}>
                    <Button
                      className={classes.smallFontSize}
                      color={'success'}
                      disabled={formikProps.isSubmitting}
                      onClick={formikProps.submitForm}
                    >
                      <FontAwesomeIcon icon={PlusSquareRegularIcon} />
                    </Button>
                  </td>
                  <td />
                </tr>
              )}
            />
            {entities.map(serviceSpecification => (
              <Formik
                key={serviceSpecification.identification_number}
                validationSchema={serviceSpecificationSchema}
                initialValues={serviceSpecification}
                onSubmit={this.handleSubmit}
                render={formikProps => (
                  <tr>
                    <ServiceSpecificationFormFields {...this.props} />
                    <td className={classes.buttonsTd}>
                      <Button
                        className={classes.smallFontSize}
                        color={'success'}
                        disabled={formikProps.isSubmitting}
                        onClick={formikProps.submitForm}
                      >
                        <FontAwesomeIcon icon={SaveRegularIcon} />
                      </Button>
                    </td>
                  </tr>
                )}
              />
            ))}
          </tbody>
        </Table>
      </IziviContent>
    );
  }
}

const ServiceSpecificationFormFields = ({ classes }: WithSheet<typeof serviceSpecificationStyles>) => (
  <>
    <td className={classes.rowTd}>
      <WiredField className={classes.checkboxes} component={CheckboxField} name={'active'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'identification_number'} size={'3'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'name'} size={'20'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'short_name'} size={'1'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'pocket_money'} size={'5'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'accommodation_expenses'} size={'5'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'work_clothing_expenses'} size={'5'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'first_day_expenses.breakfast'} size={'5'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'work_days_expenses.breakfast'} size={'5'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'paid_vacation_expenses.breakfast'} size={'5'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'last_day_expenses.breakfast'} size={'5'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'first_day_expenses.lunch'} size={'5'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'work_days_expenses.lunch'} size={'5'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'paid_vacation_expenses.lunch'} size={'5'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'last_day_expenses.lunch'} size={'5'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'first_day_expenses.dinner'} size={'5'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'work_days_expenses.dinner'} size={'5'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'paid_vacation_expenses.dinner'} size={'5'} />
    </td>
    <td className={classes.rowTd}>
      <WiredField className={classes.inputs} component={TextField} name={'last_day_expenses.dinner'} size={'5'} />
    </td>
  </>
);

export const ServiceSpecificationsOverview = injectSheet(serviceSpecificationStyles)(ServiceSpecificationsOverviewInner);
