import { FormikProps } from 'formik';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import Form from 'reactstrap/lib/Form';
import { FormView, FormViewProps } from '../../../form/FormView';
import { ExpenseSheetStore } from '../../../stores/expenseSheetStore';
import { MainStore } from '../../../stores/mainStore';
import { ExpenseSheet, ExpenseSheetHints, FormValues, Service, ServiceSpecification, SickDaysDime } from '../../../types';
import { empty } from '../../../utilities/helpers';
import { expenseSheetSchema } from '../expenseSheetSchema';
import { ExpenseSheetFormButtons } from './ExpenseSheetFormButtons';
import { ExpenseSheetFormHeader } from './ExpenseSheetFormHeader';
import * as FormSegments from './segments';

type Props = {
  mainStore?: MainStore;
  expenseSheet: ExpenseSheet;
  hints: ExpenseSheetHints;
  sickDays: SickDaysDime;
  buttonDeactive: boolean;
  service: Service;
  expenseSheetStore?: ExpenseSheetStore;
  serviceSpecification: ServiceSpecification;
} & FormViewProps<ExpenseSheet> &
  RouteComponentProps;

interface ExpenseSheetFormState {
  safeOverride: boolean;
}

@inject('mainStore', 'expenseSheetStore', 'serviceSpecificationStore')
@observer
class ExpenseSheetFormInner extends React.Component<Props, ExpenseSheetFormState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      safeOverride: false,
    };

  }

  render() {
    const {
      mainStore, onSubmit, expenseSheet, service, serviceSpecification, hints, title, expenseSheetStore, sickDays, buttonDeactive,
    } = this.props;

    const template = {
      safe_override: false,
      ...expenseSheet,
    };

    return (!empty(expenseSheet) && !this.props.loading) && (
      <FormView<ExpenseSheet>
        card
        loading={empty(expenseSheet) || this.props.loading}
        initialValues={template}
        onSubmit={(formValues: FormValues) => onSubmit({ ...formValues })}
        title={title}
        validationSchema={expenseSheetSchema}
        render={(formikProps: FormikProps<{}>): React.ReactNode => (
          <Form>
            <ExpenseSheetFormHeader
              service={service}
              expenseSheetState={expenseSheet.state}
              serviceSpecification={serviceSpecification}
            />

            <FormSegments.GeneralSegment service={service} mainStore={mainStore!}/>
            <FormSegments.AbsolvedDaysBreakdownSegment
              hints={hints}
              mainStore={mainStore!}
              sickDays={sickDays}
              buttonDeactive={buttonDeactive}
              onSaveSickDays={
              (value) => this.saveSickDaysFromDime(formikProps, value)}
            />
            <FormSegments.CompanyHolidaysSegment hints={hints} mainStore={mainStore!}/>
            <FormSegments.PaidVacationSegment mainStore={mainStore!}/>
            <FormSegments.UnpaidVacationSegment mainStore={mainStore!}/>
            <FormSegments.ClothingExpensesSegment hints={hints} mainStore={mainStore!}/>
            <FormSegments.DrivingExpensesSegment mainStore={mainStore!}/>
            <FormSegments.ExtraordinaryExpensesSegment mainStore={mainStore!}/>
            <FormSegments.FooterSegment mainStore={mainStore!}/>
            <FormSegments.StateSegment expenseSheetState={expenseSheet.state} expenseSheetStore={expenseSheetStore!}/>

            <ExpenseSheetFormButtons
              safeOverride={this.state.safeOverride}
              onForceSave={() => this.onForceSaveButtonClicked(formikProps)}
              onSave={() => this.onSaveButtonClicked(formikProps)}
              onDelete={this.onDeleteButtonClicked.bind(this)}
              expenseSheet={expenseSheet}
              mainStore={mainStore!}
              service={service}
            />
          </Form>
        )}
      />
    );
  }

  private onForceSaveButtonClicked(formikProps: FormikProps<{}>) {
    formikProps.setFieldValue('safe_override', true);
    formikProps.validateForm().then(() => {
      formikProps.submitForm();
    });
  }

  private async onDeleteButtonClicked() {
    await this.props.expenseSheetStore!.delete(this.props.expenseSheet.id!);
    this.props.history.push(`/users/${this.props.expenseSheet.user_id}`);
  }

  private onSaveButtonClicked(formikProps: FormikProps<{}>) {
    formikProps.submitForm();
    this.setState({ safeOverride: !formikProps.isValid });
  }

  private saveSickDaysFromDime(formikProps: FormikProps<{}>, value: string) {
    const workDays = this.props.hints.suggestions.work_days - parseInt(value, 10);
    formikProps.setFieldValue('work_days', workDays);
    formikProps.setFieldValue('sick_days', parseInt(value, 10));
  }
}

export const ExpenseSheetForm = withRouter(ExpenseSheetFormInner);
