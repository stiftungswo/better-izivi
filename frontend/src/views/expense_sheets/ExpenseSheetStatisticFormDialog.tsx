import { Formik } from 'formik';
import { FormikProps } from 'formik/dist/types';
import moment from 'moment';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, ModalHeader } from 'reactstrap';
import Modal from 'reactstrap/lib/Modal';
import ModalBody from 'reactstrap/lib/ModalBody';
import ModalFooter from 'reactstrap/lib/ModalFooter';
import { CheckboxField } from '../../form/CheckboxField';
import { SelectField } from '../../form/common';
import { DatePickerField } from '../../form/DatePickerField';
import { WiredField } from '../../form/formik';
import { MainStore } from '../../stores/mainStore';

const yearOptions = () => {
  const listOfYears = [];
  for (let i = 2005; i < moment().year() + 3; i++) {
    listOfYears.push({
      id: i,
      name: i,
    });
  }

  return listOfYears;
};

interface Props {
  isOpen: boolean;
  mainStore: MainStore;
  toggle: () => void;
}

export class ExpenseSheetStatisticFormDialog extends React.Component<Props> {

  getBeginning(formikProps: FormikProps<any>) {
    switch (formikProps.values.time_type) {
      case '0':
        return formikProps.values.year + '-01-01'
      case '2':
        return moment().startOf('month').format('Y-MM-DD');
      case '3':
        return moment().startOf('month').subtract(1, 'month').format('Y-MM-DD');
      default:
        return moment(formikProps.values.beginning).format('Y-MM-DD');
    }
  }

  getEnding(formikProps: FormikProps<any>) {
    switch (formikProps.values.time_type) {
      case '0':
        return formikProps.values.year + '-12-31'
      default:
        return moment(formikProps.values.ending).format('Y-MM-DD');
    }
  }

  render() {
    const { isOpen, mainStore, toggle } = this.props;

    return (
      <Modal isOpen={isOpen}>
        <ModalHeader>
          <FormattedMessage
            id="views.expense_sheets.expenseSheetStatisticFormDialog.create_expense_statistics"
            defaultMessage="Spesenstatistik erstellen"
          />
        </ModalHeader>
        <Formik
          initialValues={{
            beginning: moment()
              .startOf('year')
              .format('Y-MM-DD'),
            ending: moment()
              .endOf('year')
              .format('Y-MM-DD'),
            detail_view: true,
            only_done_sheets: true,
            time_type: '0',
            year: moment().year(),
          }}
          onSubmit={() => {
            /* nothing happens here because I didn't want to write the onChange handler myself */
          }}
          render={formikProps => (
            <>
              <ModalBody>
                <WiredField
                  horizontal
                  component={SelectField}
                  name={'time_type'}
                  options={[
                    {
                      id: '0',
                      name: this.props.mainStore!.intl.formatMessage({
                        id: 'views.expense_sheets.expenseSheetStatisticFormDialog.whole_year',
                        defaultMessage: 'Gesamtes Jahr ',
                      }),
                    },
                    {
                      id: '1',
                      name: this.props.mainStore!.intl.formatMessage({
                        id: 'views.expense_sheets.expenseSheetStatisticFormDialog.from_to',
                        defaultMessage: 'Von / Bis',
                      }),
                    },
                    { id: '2', name: moment().format('MMMM YYYY') },
                    {
                      id: '3',
                      name: moment()
                        .subtract(1, 'month')
                        .format('MMMM YYYY'),

                    },
                  ]}
                  label={
                    this.props.mainStore!.intl.formatMessage({
                      id: 'views.expense_sheets.expenseSheetStatisticFormDialog.timespan',
                      defaultMessage: 'Zeitspanne',
                    })
                  }
                />

                {formikProps.values.time_type === '0' && (
                  <WiredField
                    horizontal
                    component={SelectField}
                    name={'year'}
                    options={yearOptions()}
                    label={
                      this.props.mainStore!.intl.formatMessage({
                        id: 'views.expense_sheets.expenseSheetStatisticFormDialog.year',
                        defaultMessage: 'Jahr',
                      })
                    }
                  />
                )}

                {formikProps.values.time_type === '1' && (
                  <>
                    <WiredField
                      horizontal
                      component={DatePickerField}
                      name={'beginning'}
                      label={
                        this.props.mainStore!.intl.formatMessage({
                          id: 'views.expense_sheets.expenseSheetStatisticFormDialog.start',
                          defaultMessage: 'Start',
                        })
                      }
                    />
                    <WiredField
                      horizontal
                      component={DatePickerField}
                      name={'ending'}
                      label={
                        this.props.mainStore!.intl.formatMessage({
                          id: 'views.expense_sheets.expenseSheetStatisticFormDialog.end',
                          defaultMessage: 'Ende',
                        })
                      }
                    />
                  </>
                )}

                <WiredField
                  component={CheckboxField}
                  name={'only_done_sheets'}
                  label={
                    this.props.mainStore!.intl.formatMessage({
                      id: 'views.expense_sheets.expenseSheetStatisticFormDialog.only_show_finished_expense_sheets',
                      defaultMessage: 'Nur erledigte Spesenblätter anzeigen?',
                    })
                  }
                />

                <WiredField
                  component={CheckboxField}
                  name={'detail_view'}
                  label={
                    this.props.mainStore!.intl.formatMessage({
                      id: 'views.expense_sheets.expenseSheetStatisticFormDialog.only_show_detailed_view',
                      defaultMessage: 'Detaillierte Ansicht anzeigen?',
                    })
                  }
                />
              </ModalBody>

              <ModalFooter>
                {/* tslint:disable-next-line:max-line-length */}
                <Button
                  color={'success'}
                  href={mainStore.apiURL('expenses_overview.pdf?expenses_overview[beginning]=' + this.getBeginning(formikProps) + '&expenses_overview[ending]=' + this.getEnding(formikProps) + '&detail_view=' + formikProps.values.detail_view + '&only_done_sheets=' + formikProps.values.only_done_sheets + '&time_type=' + formikProps.values.time_type + '&year=' + formikProps.values.year)}
                  tag={'a'}
                  target={'_blank'}
                >
                  <FormattedMessage
                    id="views.expense_sheets.expenseSheetStatisticFormDialog.generate_pdf"
                    defaultMessage="PDF generieren"
                  />
                </Button>{' '}
                <Button
                  color="danger"
                  onClick={toggle}
                >
                  <FormattedMessage
                    id="views.expense_sheets.expenseSheetStatisticFormDialog.cancel"
                    defaultMessage="Abbrechen"
                  />
                </Button>
              </ModalFooter>
            </>
          )}
        />
      </Modal>
    );
  }
}
