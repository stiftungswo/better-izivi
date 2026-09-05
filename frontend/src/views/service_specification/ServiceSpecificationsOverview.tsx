import { IconLookup } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, FormikActions, FormikProps } from 'formik';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import injectSheet, { WithSheet } from 'react-jss';
import Button from 'reactstrap/lib/Button';
import IziviContent from '../../layout/IziviContent';
import { FormbricksSurveyStore } from '../../stores/formbricksSurveyStore';
import { MainStore } from '../../stores/mainStore';
import { ServiceSpecificationStore } from '../../stores/serviceSpecificationStore';
import { SiteStore } from '../../stores/siteStore';
import { ServiceSpecification } from '../../types';
import { AngleDownIcon, AngleUpIcon, PlusSquareRegularIcon, SaveRegularIcon } from '../../utilities/Icon';
import serviceSpecificationStyles from './serviceSpecificationOverviewStyle';
import serviceSpecificationSchema from './serviceSpecificationSchema';
import { ServiceSpecificationOverviewExpenseFields, ServiceSpecificationOverviewTableRowFields } from './ServiceSpecificationsOverviewTableRowFields';
import { ServiceSpecificationsOverviewTable, TABLE_COLUMN_COUNT } from './ServiceSpecificationsOverviewTable';

const INITIAL_DAILY_EXPENSES_FORM_VALUES = Object.freeze({ breakfast: 0, lunch: 0, dinner: 0 });
const INITIAL_FORM_VALUES = Object.freeze({
  id: undefined,
  identification_number: '',
  name: '',
  short_name: '',
  work_clothing_expenses: 0,
  work_days_expenses: INITIAL_DAILY_EXPENSES_FORM_VALUES,
  paid_vacation_expenses: INITIAL_DAILY_EXPENSES_FORM_VALUES,
  first_day_expenses: INITIAL_DAILY_EXPENSES_FORM_VALUES,
  last_day_expenses: INITIAL_DAILY_EXPENSES_FORM_VALUES,
  accommodation_expenses: 0,
  active: false,
  pocket_money: 750,
  formbricks_survey_id: null,
  site_id: null,
});

interface ServiceSpecificationProps extends WithSheet<typeof serviceSpecificationStyles> {
  serviceSpecificationStore?: ServiceSpecificationStore;
  formbricksSurveyStore?: FormbricksSurveyStore;
  siteStore?: SiteStore;
  mainStore?: MainStore;
}

interface ServiceSpecificationState {
  loading: boolean;
}

interface ServiceSpecificationRowProps extends ServiceSpecificationProps {
  formikProps: FormikProps<ServiceSpecification>;
  actionIcon: IconLookup;
}

const ServiceSpecificationRow: React.FunctionComponent<ServiceSpecificationRowProps> = props => {
  const { formikProps, actionIcon, classes, ...rowFieldProps } = props;
  const [expensesExpanded, setExpensesExpanded] = React.useState(false);

  return (
    <>
      <tr>
        <ServiceSpecificationOverviewTableRowFields classes={classes} {...rowFieldProps} />
        <td className={classes.rowTd}>
          <Button
            className={classes.smallFontSize}
            size={'sm'}
            outline
            onClick={() => setExpensesExpanded(!expensesExpanded)}
          >
            <FontAwesomeIcon icon={expensesExpanded ? AngleUpIcon : AngleDownIcon} />
          </Button>
        </td>
        <td className={classes.buttonsTd}>
          <Button
            className={classes.smallFontSize}
            color={'success'}
            disabled={formikProps.isSubmitting}
            onClick={formikProps.submitForm}
          >
            <FontAwesomeIcon icon={actionIcon} />
          </Button>
        </td>
      </tr>
      {expensesExpanded && (
        <tr className={classes.expensesRow}>
          <td colSpan={TABLE_COLUMN_COUNT}>
            <ServiceSpecificationOverviewExpenseFields classes={classes} theme={rowFieldProps.theme} />
          </td>
        </tr>
      )}
    </>
  );
};

@inject('serviceSpecificationStore', 'formbricksSurveyStore', 'siteStore', 'mainStore')
@observer
export class ServiceSpecificationsOverviewInner extends React.Component<ServiceSpecificationProps, ServiceSpecificationState> {
  constructor(props: ServiceSpecificationProps) {
    super(props);

    this.props.serviceSpecificationStore!.fetchAll().then(() => {
      this.setState({ loading: false });
    });
    this.props.formbricksSurveyStore!.fetchAll();
    this.props.siteStore!.fetchAll();

    this.state = {
      loading: true,
    };
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
    const serviceSpecifications = this.props.serviceSpecificationStore!.entities;

    return (
      <IziviContent
        loading={this.state.loading}
        title={
          this.props.mainStore!.intl.formatMessage({
            id: 'layout.navigation.service_specifications',
            defaultMessage: 'Pflichtenheft',
          })
        }
        card
        fullscreen
      >
        <ServiceSpecificationsOverviewTable classes={this.props.classes} theme={this.props.theme}>
          <Formik
            validationSchema={serviceSpecificationSchema}
            initialValues={INITIAL_FORM_VALUES}
            onSubmit={this.handleAdd}
            render={formikProps => (
              <ServiceSpecificationRow {...this.props} formikProps={formikProps} actionIcon={PlusSquareRegularIcon} />
            )}
          />
          {serviceSpecifications.map(serviceSpecification => (
            <Formik
              key={serviceSpecification.identification_number}
              validationSchema={serviceSpecificationSchema}
              initialValues={serviceSpecification}
              onSubmit={this.handleSubmit}
              render={formikProps => (
                <ServiceSpecificationRow {...this.props} formikProps={formikProps} actionIcon={SaveRegularIcon} />
              )}
            />
          ))}
        </ServiceSpecificationsOverviewTable>
      </IziviContent>
    );
  }
}

export const ServiceSpecificationsOverview = injectSheet(serviceSpecificationStyles)(ServiceSpecificationsOverviewInner);
