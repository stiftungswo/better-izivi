import { FormikProps } from 'formik';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import Button from 'reactstrap/lib/Button';
import Col from 'reactstrap/lib/Col';
import Form from 'reactstrap/lib/Form';
import Row from 'reactstrap/lib/Row';
import { CheckboxField } from '../../form/CheckboxField';
import { NumberField, SelectField, TextField } from '../../form/common';
import CurrencyField from '../../form/CurrencyField';
import { DatePickerField } from '../../form/DatePickerField';
import { WiredField } from '../../form/formik';
import { FormView, FormViewProps } from '../../form/FormView';
import { SolidHorizontalRow } from '../../layout/SolidHorizontalRow';
import { ExpenseSheetStore } from '../../stores/expenseSheetStore';
import { MainStore } from '../../stores/mainStore';
import { ExpenseSheet, ExpenseSheetHints, FormValues } from '../../types';
import { empty } from '../../utilities/helpers';
import { expenseSheetSchema } from './expenseSheetSchema';

type Props = {
  mainStore?: MainStore;
  expenseSheet: ExpenseSheet;
  hints: ExpenseSheetHints;
  expenseSheetStore?: ExpenseSheetStore;
} & FormViewProps<ExpenseSheet> &
  RouteComponentProps;

interface ExpenseSheetFormState {
  safeOverride: boolean;
}

@inject('mainStore', 'expenseSheetStore')
@observer
class ExpenseSheetFormInner extends React.Component<Props, ExpenseSheetFormState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      safeOverride: false,
    };
  }

  render() {
    const { mainStore, onSubmit, expenseSheet, hints, expenseSheetStore, title } = this.props;

    const template = {
      safe_override: false,
      ...expenseSheet,
    };

    return (
      <FormView
        card
        loading={empty(expenseSheet) || this.props.loading}
        initialValues={template}
        onSubmit={(formValues: FormValues) => onSubmit({ ...formValues })}
        title={title}
        validationSchema={expenseSheetSchema}
        render={(formikProps: FormikProps<{}>): React.ReactNode => (
          <Form>
            <WiredField disabled horizontal component={TextField} name={'service.serviceSpecification.name'} label={'Pflichtenheft'} />
            <WiredField disabled horizontal component={DatePickerField} name={'service.beginning'} label={'Beginn Einsatz'} />
            <WiredField disabled horizontal component={DatePickerField} name={'service.ending'} label={'Ende Einsatz'} />

            <WiredField horizontal component={DatePickerField} name={'beginning'} label={'Start Spesenblattperiode'} />
            <WiredField horizontal component={DatePickerField} name={'ending'} label={'Ende Spesenblattperiode'} />

            <WiredField
              disabled
              horizontal
              component={NumberField}
              name={'service.eligible_paid_vacation_days'}
              label={'Ferienanspruch für Einsatz'}
            />
            <WiredField disabled horizontal component={NumberField} name={'duration'} label={'Dauer Spesenblattperiode'} />

            <SolidHorizontalRow />

            <WiredField
              horizontal
              appendedLabels={[`Vorschlag: ${hints.suggestions.work_days} Tage`]}
              component={NumberField}
              name={'work_days'}
              label={'Gearbeitet'}
            />
            <WiredField
              horizontal
              appendedLabels={[`Vorschlag: ${hints.suggestions.workfree_days} Tage`]}
              component={NumberField}
              name={'workfree_days'}
              label={'Arbeitsfrei'}
            />
            <WiredField
              horizontal
              appendedLabels={[`Übriges Guthaben: ${hints.remaining_days.sick_days} Tage`]}
              component={NumberField}
              name={'sick_days'}
              label={'Krank'}
            />

            <SolidHorizontalRow />

            <WiredField horizontal component={NumberField} name={'additional_workfree'} label={'Zusätzlich arbeitsfrei'} />
            <WiredField horizontal component={TextField} name={'additional_workfree_comment'} label={'Bemerkung'} />

            <SolidHorizontalRow />

            <WiredField
              horizontal
              appendedLabels={[`Vorschlag: ${hints.suggestions.unpaid_company_holiday_days} Tage`]}
              component={NumberField}
              name={'unpaid_company_holiday_days'}
              label={'Betriebsferien (Urlaub)'}
            />
            <WiredField
              horizontal
              appendedLabels={[`Vorschlag: ${hints.suggestions.paid_company_holiday_days} Tage`]}
              component={NumberField}
              name={'paid_company_holiday_days'}
              label={'Betriebsferien (Ferien)'}
            />

            <SolidHorizontalRow />

            <WiredField horizontal component={NumberField} name={'paid_vacation_days'} label={'Ferien'} />
            <WiredField horizontal component={TextField} name={'paid_vacation_comment'} label={'Bemerkung'} />

            <SolidHorizontalRow />

            <WiredField horizontal component={NumberField} name={'unpaid_vacation_days'} label={'Persönlicher Urlaub'} />
            <WiredField horizontal component={TextField} name={'unpaid_vacation_comment'} label={'Bemerkung'} />

            <SolidHorizontalRow />

            <WiredField
              horizontal
              appendedLabels={[`Vorschlag: ${hints.suggestions.clothing_expenses} CHF`]}
              component={CurrencyField}
              name={'clothing_expenses'}
              label={'Kleiderspesen'}
            />

            <SolidHorizontalRow />

            <WiredField horizontal component={NumberField} name={'driving_expenses'} label={'Fahrspesen'} />
            <WiredField horizontal component={TextField} name={'driving_expenses_comment'} label={'Bemerkung'} />

            <SolidHorizontalRow />

            <WiredField horizontal component={NumberField} name={'extraordinary_expenses'} label={'Ausserordentliche Spesen'} />
            <WiredField horizontal component={TextField} name={'extraordinary_expenses_comment'} label={'Bemerkung'} />

            <SolidHorizontalRow />

            <WiredField
              horizontal
              component={CheckboxField}
              name={'ignore_first_last_day'}
              label={'Erster / Letzter Tag nicht speziell behandeln'}
            />
            <WiredField disabled horizontal component={CurrencyField} name={'total_costs'} label={'Total'} />
            <WiredField horizontal component={TextField} name={'bank_account_number'} label={'Konto-Nr.'} />
            <WiredField horizontal component={NumberField} name={'document_number'} label={'Beleg-Nr.'} />
            <WiredField
              horizontal
              component={SelectField}
              name={'state'}
              options={[
                { id: '0', name: 'Offen' },
                { id: '1', name: 'Bereit für Auszahlung' },
                { id: '2', name: 'Auszahlung in Verarbeitung' },
                { id: '3', name: 'Erledigt' },
              ]}
              label={'Status'}
            />

            <SolidHorizontalRow />

            <Row>
              {this.state.safeOverride ? (
                <Col md={3}>
                  <Button
                    block
                    color={'primary'}
                    onClick={() => {
                      formikProps.setFieldValue('safe_override', true);
                      formikProps.validateForm().then(() => {
                        formikProps.submitForm();
                      });
                    }}
                  >
                    Speichern erzwingen
                  </Button>
                </Col>
              ) : (
                <Col md={3}>
                  <Button
                    block
                    color={'primary'}
                    onClick={() => {
                      formikProps.submitForm();
                      if (!formikProps.isValid) {
                        this.setState({ safeOverride: true });
                      }
                    }}
                  >
                    Speichern
                  </Button>
                </Col>
              )}

              <Col md={3}>
                <Button
                  block
                  color={'danger'}
                  onClick={async () => {
                    await expenseSheetStore!.delete(expenseSheet.id!);
                    this.props.history.push('/expense_sheets');
                  }}
                >
                  Löschen
                </Button>
              </Col>

              <Col md={3}>
                <Button
                  block
                  color={'warning'}
                  disabled={!expenseSheet.id}
                  href={mainStore!.apiURL('expense_sheets/' + String(expenseSheet.id!) + '/download')}
                  tag={'a'}
                  target={'_blank'}
                >
                  Drucken
                </Button>
              </Col>

              <Col md={3}>
                <Button block>Profil anzeigen (TODO)</Button> {/*TODO: Show profile*/}
              </Col>
            </Row>
          </Form>
        )}
      />
    );
  }
}

export const ExpenseSheetForm = withRouter(ExpenseSheetFormInner);
