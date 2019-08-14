import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ErrorMessage, Field, FormikProps } from 'formik';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';
import Col from 'reactstrap/lib/Col';
import Form from 'reactstrap/lib/Form';
import InputGroupAddon from 'reactstrap/lib/InputGroupAddon';
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
import { ExpenseSheet, ExpenseSheetHints, ExpenseSheetState, FormValues, Service } from '../../types';
import { Formatter } from '../../utilities/formatter';
import { empty } from '../../utilities/helpers';
import { ExclamationSolidIcon, PrintSolidIcon, SaveRegularIcon, TrashAltRegularIcon } from '../../utilities/Icon';
import { expenseSheetSchema } from './expenseSheetSchema';

type Props = {
  mainStore?: MainStore;
  expenseSheet: ExpenseSheet;
  hints: ExpenseSheetHints;
  service: Service;
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

  formatDate(date: Date | null) {
    if (!date) {
      return 'Unbekannt';
    }

    return new Formatter().formatDate(date.toString());
  }

  render() {
    const {
      mainStore,
      onSubmit,
      expenseSheet,
      service,
      hints,
      expenseSheetStore,
      title,
    } = this.props;

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
            <h5 className="mb-5 text-secondary">
              Für den Einsatz
              "{service.service_specification.name}" vom {this.formatDate(service.beginning)} bis {this.formatDate(service.ending)}
            </h5>

            <WiredField horizontal component={DatePickerField} name={'beginning'} label={'Start Spesenblattperiode'}/>
            <WiredField horizontal component={DatePickerField} name={'ending'} label={'Ende Spesenblattperiode'}/>

            <Field
              disabled
              horizontal
              component={NumberField}
              label="Ferienanspruch für Einsatz"
              value={service.eligible_paid_vacation_days}
            />
            <WiredField disabled horizontal component={NumberField} name={'duration'} label={'Dauer Spesenblattperiode'}/>

            <SolidHorizontalRow/>

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

            <SolidHorizontalRow/>

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

            <SolidHorizontalRow/>

            <WiredField horizontal component={NumberField} name={'paid_vacation_days'} label={'Ferien'}/>
            <WiredField horizontal component={TextField} name={'paid_vacation_comment'} label={'Bemerkung'}/>

            <SolidHorizontalRow/>

            <WiredField horizontal component={NumberField} name={'unpaid_vacation_days'} label={'Persönlicher Urlaub'}/>
            <WiredField horizontal component={TextField} name={'unpaid_vacation_comment'} label={'Bemerkung'}/>

            <SolidHorizontalRow/>

            <WiredField
              horizontal
              appendedLabels={[`Vorschlag: ${mainStore!.formatCurrency(hints.suggestions.clothing_expenses)}`]}
              component={CurrencyField}
              name={'clothing_expenses'}
              label={'Kleiderspesen'}
            />

            <SolidHorizontalRow/>

            <WiredField horizontal component={CurrencyField} name={'driving_expenses'} label={'Fahrspesen'}/>
            <WiredField horizontal component={TextField} name={'driving_expenses_comment'} label={'Bemerkung'}/>

            <SolidHorizontalRow/>

            <WiredField horizontal component={CurrencyField} name={'extraordinary_expenses'} label={'Ausserordentliche Spesen'}/>
            <WiredField horizontal component={TextField} name={'extraordinary_expenses_comment'} label={'Bemerkung'}/>

            <SolidHorizontalRow/>

            <WiredField
              horizontal
              component={CheckboxField}
              name={'ignore_first_last_day'}
              label={'Erster / Letzter Tag nicht speziell behandeln'}
            />
            <WiredField disabled horizontal component={CurrencyField} name={'total'} label={'Total'}/>
            <WiredField horizontal component={TextField} name={'bank_account_number'} label={'Konto-Nr.'}/>
            <WiredField
              horizontal
              component={SelectField}
              name={'state'}
              options={[
                { id: ExpenseSheetState.open, name: 'Offen' },
                { id: ExpenseSheetState.ready_for_payment, name: 'Bereit für Auszahlung' },
                { id: ExpenseSheetState.payment_in_progress, name: 'Auszahlung in Verarbeitung' },
                { id: ExpenseSheetState.paid, name: 'Erledigt' },
              ]}
              label={'Status'}
            />

            <SolidHorizontalRow/>

            <Row>
              <Col md={3}>
                {this.state.safeOverride ? (
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
                    <FontAwesomeIcon icon={ExclamationSolidIcon}/> Speichern erzwingen
                  </Button>
                ) : (
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
                    <FontAwesomeIcon icon={SaveRegularIcon}/> Speichern
                  </Button>
                )}
              </Col>

              <Col md={3}>
                <Button
                  block
                  color={'danger'}
                  onClick={async () => {
                    await expenseSheetStore!.delete(expenseSheet.id!);
                    this.props.history.push('/expense_sheets');
                  }}
                >
                  <FontAwesomeIcon icon={TrashAltRegularIcon}/> Löschen
                </Button>
              </Col>

              <Col md={3}>
                <Button
                  block
                  color={'warning'}
                  disabled={!expenseSheet.id}
                  href={mainStore!.apiURL(`expense_sheets/${expenseSheet.id!}.pdf`)}
                  tag={'a'}
                  target={'_blank'}
                >
                  <FontAwesomeIcon icon={PrintSolidIcon}/> Drucken
                </Button>
              </Col>

              <Col md={3}>
                <Link to={'/users/' + service.user_id} style={{ textDecoration: 'none' }}>
                  <Button block>Profil anzeigen</Button>
                </Link>
              </Col>
            </Row>
          </Form>
        )}
      />
    );
  }
}

export const ExpenseSheetForm = withRouter(ExpenseSheetFormInner);
