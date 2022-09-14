import { Field, Formik, FormikProps } from 'formik';
import { inject } from 'mobx-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from 'reactstrap/lib/Button';
import Modal from 'reactstrap/lib/Modal';
import ModalBody from 'reactstrap/lib/ModalBody';
import ModalFooter from 'reactstrap/lib/ModalFooter';
import ModalHeader from 'reactstrap/lib/ModalHeader';
import { CheckboxField } from '../../../form/CheckboxField';
import { MainStore } from '../../../stores/mainStore';
import { ServiceStore } from '../../../stores/serviceStore';
import { Service, User } from '../../../types';
import { OnChange } from '../../../utilities/Effect';
import { serviceSchema } from '../schemas';
import { ServiceModalForm } from './ServiceModalForm';

export interface ServiceModalProps<T> {
  onSubmit: (values: T) => Promise<void>;
  user: User;
  service?: Service;
  onClose: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  onServiceConfirmed: (service: Service) => Promise<void>;
  isOpen: boolean;
  serviceStore?: ServiceStore;
  mainStore?: MainStore;
}

@inject('serviceStore', 'mainStore')
export class ServiceModal extends React.Component<ServiceModalProps<Service>, { informationChecked: boolean }> {
  private readonly initialValues: Service;
  private autoUpdate = true;

  private changeFieldsToUpdateFieldMap = [
    {
      changes: ['beginning', 'ending'],
      updateField: 'service_days',
    },
    {
      changes: ['beginning', 'service_days'],
      updateField: 'ending',
    },
  ];

  constructor(props: ServiceModalProps<Service>) {
    super(props);
    this.initialValues = props.service || {
      service_specification_id: -1,
      service_type: 'normal',
      beginning: null,
      ending: null,
      service_days: 0,
      first_swo_service: false,
      starts_on_saturday: false,
      long_service: false,
      probation_period: false,
      confirmation_date: null,
      deletable: true,
      eligible_paid_vacation_days: 0,
      user_id: props.user.id,
      work_record_available: false,
      service_specification: {
        identification_number: '',
        name: undefined,
        short_name: undefined,
      },
    };

    this.state = {
      informationChecked: false,
    };
  }

  handleServiceDateRangeChange: OnChange<Service> = async (current, next, formik) => {
    if (this.autoUpdate) {
      await this.updateEndingOrServiceDays(current, next, formik).catch(() => {
        // tslint:disable-next-line:no-console
        console.error('Failed to calculate ending or service days automatically...');
        // reset auto update
        this.autoUpdate = true;
      });
    }
  }

  render() {
    const { onSubmit, onClose, isOpen, service } = this.props;
    const isAdmin = this.props.mainStore!.isAdmin();

    if (!isOpen) {
      return <></>;
    }

    return (
      <Formik
        onSubmit={onSubmit}
        initialValues={this.initialValues}
        validationSchema={serviceSchema}
        render={(formikProps: FormikProps<Service>) => (
          <Modal isOpen toggle={onClose}>
            <ModalHeader toggle={onClose}>
              <FormattedMessage
                id="views.users.serviceModal.civil_service_mission"
                defaultMessage="Zivildiensteinsatz"
              />
            </ModalHeader>
            <ModalBody>
              <ServiceModalForm serviceDateRangeChangeHandler={this.handleServiceDateRangeChange} mode={service ? 'edit' : 'create'} />
            </ModalBody>
            <ModalFooter>
              {!isAdmin && (
                <Field
                  component={CheckboxField}
                  onChange={this.handleInformationChecked}
                  label={
                    this.props.mainStore!.intl.formatMessage({
                      id: 'views.users.serviceModal.details_are_up_to_date',
                      defaultMessage: 'Meine Angaben (IBAN, Telefon) sind aktuell',
                    })
                  }
                />
              )}
              <Button
                color="primary"
                onClick={formikProps.submitForm}
                disabled={!this.state.informationChecked && !isAdmin}
              >
                <FormattedMessage
                  id="views.users.serviceModal.save_data"
                  defaultMessage="Daten speichern"
                />
              </Button>
              {(isAdmin && this.props.service && this.props.service.confirmation_date == null) && (
                <>
                  {' '}
                  <Button color="secondary" onClick={this.onConfirmationPut}>
                    <FormattedMessage
                      id="views.users.serviceModal.got_draft"
                      defaultMessage="Aufgebot erhalten"
                    />
                  </Button>
                </>
              )}
            </ModalFooter>
          </Modal>
        )}
      />
    );
  }

  onConfirmationPut = () => {
    if (this.props.onServiceConfirmed != null) {
      this.props.onServiceConfirmed(this.props.service!).then(() => {
        this.props.mainStore!.displaySuccess(
          this.props.mainStore!.intl.formatMessage({
            id: 'views.users.serviceModal.saved_successfully',
            defaultMessage: 'Speichern erfolgreich',
          }),
        );
      });
    }
  }

  handleInformationChecked = () => {
    this.setState({ informationChecked: !this.state.informationChecked });
  }

  private updateEndingOrServiceDays = async (current: any, next: any, formik: any) => {
    this.autoUpdate = false;

    const values = {
      beginning: next.values.beginning,
    };

    for (const map of this.changeFieldsToUpdateFieldMap) {
      const [firstIndex, secondIndex] = map.changes;

      if (!next.values[firstIndex] || !next.values[secondIndex]) {
        continue;
      }

      const firstIndexUnchanged = current.values[firstIndex] === next.values[firstIndex];
      const secondIndexUnchanged = current.values[secondIndex] === next.values[secondIndex];

      if (firstIndexUnchanged && secondIndexUnchanged) {
        continue;
      }

      values[secondIndex] = next.values[secondIndex];
      const data = await this.props.serviceStore!.calcServiceDaysOrEnding(values);
      if (data && data.result) {
        formik.setFieldValue(map.updateField, data.result);
      }
      break;
    }
    this.autoUpdate = true;
  }
}
