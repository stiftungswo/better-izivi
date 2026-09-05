import { observer } from 'mobx-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { WithSheet } from 'react-jss';
import { CheckboxField } from '../../form/CheckboxField';
import { SelectField, TextField } from '../../form/common';
import { WiredField } from '../../form/formik';
import { FormbricksSurveyStore } from '../../stores/formbricksSurveyStore';
import { SiteStore } from '../../stores/siteStore';
import serviceSpecificationStyles from './serviceSpecificationOverviewStyle';

const MAIN_INPUT_ROW_NAME_KEYS = Object.freeze(['accommodation_expenses', 'work_clothing_expenses']);

interface ExpenseFieldGroup {
  labelId: string;
  defaultLabel: string;
  namePrefix: 'first_day_expenses' | 'work_days_expenses' | 'paid_vacation_expenses' | 'last_day_expenses';
}

const EXPENSE_FIELD_GROUPS: ExpenseFieldGroup[] = [
  {
    labelId: 'views.service_specification.ServiceSpecificationsOverviewTable.first_day',
    defaultLabel: 'Erster Tag',
    namePrefix: 'first_day_expenses',
  },
  {
    labelId: 'views.service_specification.ServiceSpecificationsOverviewTable.work',
    defaultLabel: 'Arbeit',
    namePrefix: 'work_days_expenses',
  },
  {
    labelId: 'views.service_specification.ServiceSpecificationsOverviewTable.free',
    defaultLabel: 'Frei',
    namePrefix: 'paid_vacation_expenses',
  },
  {
    labelId: 'views.service_specification.ServiceSpecificationsOverviewTable.last_day',
    defaultLabel: 'Letzter Tag',
    namePrefix: 'last_day_expenses',
  },
];

interface OverviewTableRowParams {
  tableDataClassName: string;
  className: string;
  component: React.ElementType;
  name: string;
  size?: string;
  label?: string;
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
  siteStore?: SiteStore;
}

export const ServiceSpecificationOverviewTableRowFields = observer(
  ({ classes, formbricksSurveyStore, siteStore }: ServiceSpecificationOverviewTableRowFieldsProps) => {
    const intl = useIntl();
    const defaultParams = {
      tableDataClassName: classes.rowTd,
    };

    const inputDefaultParams = {
      ...defaultParams,
      className: classes.inputs,
      component: TextField,
      size: '5',
    };

    const noSurveyOption = {
      id: '',
      name: intl.formatMessage({
        id: 'views.service_specification.ServiceSpecificationsOverviewTableRowFields.no_survey',
        defaultMessage: 'Keine Umfrage',
      }),
    };
    const surveyOptions = [
      noSurveyOption,
      ...(formbricksSurveyStore ? formbricksSurveyStore.entities : []).map(({ id, name }) => ({ id, name })),
    ];

    const siteOptions = (siteStore ? siteStore.entities : []).map(({ id, name }) => ({ id: String(id), name }));

    return (
      <>
        <OverviewTableRow {...defaultParams} className={classes.checkboxes} component={CheckboxField} name={'active'}/>
        <OverviewTableRow {...inputDefaultParams} name={'identification_number'} size={'3'}/>
        <OverviewTableRow {...inputDefaultParams} name={'name'} size={'20'} />
        <OverviewTableRow {...inputDefaultParams} name={'short_name'} size={'1'} />
        <OverviewTableRow {...inputDefaultParams} name={'pocket_money'} disabled={true} />

        {MAIN_INPUT_ROW_NAME_KEYS.map(name => <OverviewTableRow {...inputDefaultParams} name={name} key={name} />)}

        <OverviewTableRow
          {...defaultParams}
          className={classes.inputs}
          component={SelectField}
          name={'formbricks_survey_id'}
          options={surveyOptions}
        />
        <OverviewTableRow
          {...defaultParams}
          className={classes.inputs}
          component={SelectField}
          name={'site_id'}
          options={siteOptions}
        />
      </>
    );
  },
);

type ServiceSpecificationOverviewExpenseFieldsProps = WithSheet<typeof serviceSpecificationStyles>;

export const ServiceSpecificationOverviewExpenseFields = observer(({ classes }: ServiceSpecificationOverviewExpenseFieldsProps) => {
  const intl = useIntl();

  const mealRows: { labelId: string; defaultLabel: string; meal: 'breakfast' | 'lunch' | 'dinner' }[] = [
    {
      labelId: 'views.service_specification.ServiceSpecificationsOverviewTable.breakfast',
      defaultLabel: 'Frühstück',
      meal: 'breakfast',
    },
    {
      labelId: 'views.service_specification.ServiceSpecificationsOverviewTable.lunch',
      defaultLabel: 'Mittagessen',
      meal: 'lunch',
    },
    {
      labelId: 'views.service_specification.ServiceSpecificationsOverviewTable.dinner',
      defaultLabel: 'Abendessen',
      meal: 'dinner',
    },
  ];

  return (
    <div className={classes.expensePanel}>
      {mealRows.map(({ labelId, defaultLabel, meal }) => (
        <div className={classes.expensePanelRow} key={meal}>
          <div className={classes.expensePanelRowLabel}>{intl.formatMessage({ id: labelId, defaultMessage: defaultLabel })}</div>
          {EXPENSE_FIELD_GROUPS.map(group => (
            <div className={classes.expensePanelField} key={group.namePrefix}>
              <WiredField
                component={TextField}
                className={classes.inputs}
                name={`${group.namePrefix}.${meal}`}
                size={'5'}
                label={intl.formatMessage({ id: group.labelId, defaultMessage: group.defaultLabel })}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});
