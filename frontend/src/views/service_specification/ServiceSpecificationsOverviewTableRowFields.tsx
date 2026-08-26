import { observer } from 'mobx-react';
import * as React from 'react';
import { WithSheet } from 'react-jss';
import { CheckboxField } from '../../form/CheckboxField';
import { SelectField, TextField } from '../../form/common';
import { WiredField } from '../../form/formik';
import { FormbricksSurveyStore } from '../../stores/formbricksSurveyStore';
import serviceSpecificationStyles from './serviceSpecificationOverviewStyle';

const STANDARD_INPUT_ROW_NAME_KEYS = Object.freeze([
  'accommodation_expenses',
  'work_clothing_expenses',
  'first_day_expenses.breakfast',
  'work_days_expenses.breakfast',
  'paid_vacation_expenses.breakfast',
  'last_day_expenses.breakfast',
  'first_day_expenses.lunch',
  'work_days_expenses.lunch',
  'paid_vacation_expenses.lunch',
  'last_day_expenses.lunch',
  'first_day_expenses.dinner',
  'work_days_expenses.dinner',
  'paid_vacation_expenses.dinner',
  'last_day_expenses.dinner',
]);

interface OverviewTableRowParams {
  tableDataClassName: string;
  className: string;
  component: React.ElementType;
  name: string;
  size?: string;
  disabled?: boolean;
  options?: { id: string; name: string }[];
}

const OverviewTableRow = ({ tableDataClassName, ...other }: OverviewTableRowParams) => {
  return (
    <td className={tableDataClassName}>
      <WiredField {...other} />
    </td>
  );
};

interface ServiceSpecificationOverviewTableRowFieldsProps extends WithSheet<typeof serviceSpecificationStyles> {
  formbricksSurveyStore?: FormbricksSurveyStore;
}

export const ServiceSpecificationOverviewTableRowFields = observer(
  ({ classes, formbricksSurveyStore }: ServiceSpecificationOverviewTableRowFieldsProps) => {
    const defaultParams = {
      tableDataClassName: classes.rowTd,
    };

    const inputDefaultParams = {
      ...defaultParams,
      className: classes.inputs,
      component: TextField,
      size: '5',
    };

    const surveyOptions = (formbricksSurveyStore ? formbricksSurveyStore.entities : []).map(({ id, name }) => ({ id, name }));

    return (
      <>
        <OverviewTableRow {...defaultParams} className={classes.checkboxes} component={CheckboxField} name={'active'}/>
        <OverviewTableRow {...inputDefaultParams} name={'identification_number'} size={'3'}/>
        <OverviewTableRow {...inputDefaultParams} name={'name'} size={'20'} />
        <OverviewTableRow {...inputDefaultParams} name={'short_name'} size={'1'} />
        <OverviewTableRow {...inputDefaultParams} name={'pocket_money'} disabled={true} />

        {STANDARD_INPUT_ROW_NAME_KEYS.map(name => <OverviewTableRow {...inputDefaultParams} name={name} key={name} />)}

        <OverviewTableRow
          {...defaultParams}
          className={classes.inputs}
          component={SelectField}
          name={'formbricks_survey_id'}
          options={surveyOptions}
        />
      </>
    );
  },
);
