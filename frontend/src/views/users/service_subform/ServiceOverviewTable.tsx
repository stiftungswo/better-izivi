import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { WithSheet } from 'react-jss';
import { UncontrolledTooltip } from 'reactstrap';
import Button from 'reactstrap/lib/Button';
import { DeleteButton } from '../../../form/DeleteButton';
import { OverviewTable } from '../../../layout/OverviewTable';
import { ExpenseSheetStore } from '../../../stores/expenseSheetStore';
import { MainStore } from '../../../stores/mainStore';
import { ServiceSpecificationStore } from '../../../stores/serviceSpecificationStore';
import { ServiceStore } from '../../../stores/serviceStore';
import { UserStore } from '../../../stores/userStore';
import { Service, ServiceSpecification, User } from '../../../types';
import {
  CheckSquareRegularIcon,
  EditSolidIcon,
  PlusSquareRegularIcon,
  PrintSolidIcon,
  SquareRegularIcon,
  TrashAltRegularIcon,
} from '../../../utilities/Icon';
import { serviceSchema } from '../schemas';
import { ServiceModal } from '../service_modal/ServiceModal';

interface OverviewTableParams extends WithSheet<string, {}> {
  mainStore?: MainStore;
  expenseSheetStore?: ExpenseSheetStore;
  serviceStore?: ServiceStore;
  userStore?: UserStore;
  serviceSpecificationStore?: ServiceSpecificationStore;
  user: User;
  onModalOpen: (service: Service) => void;
  onModalClose: (_?: React.MouseEvent<HTMLButtonElement>) => void;
  serviceModalId?: number;
}

function onServiceTableSubmit(serviceStore?: ServiceStore, userStore?: UserStore) {
  return (service: Service) => {
    return serviceStore!.put(serviceSchema.cast(service)).then(() => {
      userStore!.fetchOne(service.user_id);
    }) as Promise<void>;
  };
}

function confirmService(serviceStore?: ServiceStore, userStore?: UserStore) {
  return (service: Service) => {
    return serviceStore!.doConfirmPut(service.id!).then(() => {
      userStore!.fetchOne(service.user_id);
    });
  };
}

function onServiceAddExpenseSheet(service: Service, expenseSheetStore: ExpenseSheetStore, userStore: UserStore) {
  expenseSheetStore.createAdditional(service.id!).then(value => {
    userStore.fetchOne(service.user_id);
  });
}

async function onServiceDeleteConfirm(service: Service, serviceStore: ServiceStore, userStore: UserStore) {
  await serviceStore.delete(service.id!);
  await userStore.fetchOne(service.user_id);
}

export default (params: OverviewTableParams) => {
  const {
    user,
    mainStore,
    expenseSheetStore,
    serviceStore,
    classes,
    userStore,
    serviceSpecificationStore,
    onModalOpen,
    onModalClose,
    serviceModalId,
  } = params;

  const intl = useIntl();

  const columns = [
    {
      id: 'serviceSpecification',
      label:
        intl.formatMessage({
          id: 'views.users.serviceOverviewTable.service_specifaction',
          defaultMessage: 'Pflichtenheft',
        }),
      format: (service: Service) => {
        const spec = serviceSpecificationStore!
          .entities
          .find((specification: ServiceSpecification) => {
            return specification.id === service.service_specification_id;
          },
          );
        return `${spec ? spec.name : ''} (${service.service_specification.identification_number})`;
      },
    },
    {
      id: 'beginning',
      label:
        intl.formatMessage({
          id: 'views.users.serviceOverviewTable.start',
          defaultMessage: 'Start',
        }),
      format: (service: Service) => (service.beginning ? mainStore!.formatDate(moment(service.beginning)) : ''),
    },
    {
      id: 'ending',
      label:
        intl.formatMessage({
          id: 'views.users.serviceOverviewTable.end',
          defaultMessage: 'Ende',
        }),
      format: (service: Service) => (service.ending ? mainStore!.formatDate(moment(service.ending)) : ''),
    },
    {
      id: 'draft_date',
      label: '',
      format: (service: Service) => (
        <>
          <span id={`expenseSheetState-${service.id}`}>
            <FontAwesomeIcon
              icon={service.confirmation_date ? CheckSquareRegularIcon : SquareRegularIcon}
              color={service.confirmation_date ? 'green' : 'black'}
            />
          </span>
          <UncontrolledTooltip target={`expenseSheetState-${service.id}`}>Aufgebot erhalten</UncontrolledTooltip>
        </>
      ),
    },
  ];

  function printButton(service: Service) {
    const urlParams = {
      locale: params.user.regional_center_id === 2 ? 'fr' : 'de',
    };
    return (
      <a
        className={'btn btn-link'}
        href={mainStore!.apiURL('services/' + service.id + '.pdf', urlParams, true)}
        target={'_blank'}
        rel="noopener noreferrer"
      >
        <FormattedMessage
          id="views.users.serviceOverviewTable.print"
          defaultMessage="{icon} Drucken"
          values={{ icon: <FontAwesomeIcon icon={PrintSolidIcon} /> }}
        />
      </a>
    );
  }

  function editButton(service: Service) {
    return (
      <Button color={'warning'} type={'button'} className="mr-1" onClick={() => onModalOpen(service)}>
        <FormattedMessage
          id="views.users.serviceOverviewTable.edit"
          defaultMessage="{icon} Bearbeiten"
          values={{ icon: <FontAwesomeIcon icon={EditSolidIcon} /> }}
        />
      </Button>
    );
  }

  function adminButtons(service: Service) {
    return mainStore!.isAdmin() && (
      <>
        <DeleteButton
          id={service.id ? 'Service-' + service.id.toString() : ''}
          onConfirm={() => onServiceDeleteConfirm(service, serviceStore!, userStore!)}
          disabled={!service.deletable}
          tooltip={
          service.deletable
          ? undefined
          : intl.formatMessage({
            id: 'views.users.serviceOverviewTable.first_delete_expense_sheet',
            defaultMessage: 'Zuerst Spesenblatt löschen!',
          })}
        >
          <FormattedMessage
            id="views.users.serviceOverviewTable.delete"
            defaultMessage="{icon} Löschen"
            values={{
              icon: <FontAwesomeIcon icon={TrashAltRegularIcon} />,
            }}
          />
        </DeleteButton>{' '}
        {
          service.confirmation_date !== null && (
              <Button
                onClick={() => onServiceAddExpenseSheet(service, expenseSheetStore!, userStore!)}
                color={'success'}
                type={'button'}
              >
                <FormattedMessage
                  id="views.users.serviceOverviewTable.expense_sheet"
                  defaultMessage="{icon} Spesenblatt"
                  values={{ icon: <FontAwesomeIcon icon={PlusSquareRegularIcon} /> }}
                />
              </Button>
          )
        }
        {
        service.confirmation_date !== null && service.work_record_available &&
          (
            <a
              className={'btn btn-link'}
              href={mainStore!.apiURL('export_certificate/' + service.id + '.docx', {}, true)}
            >
              <FormattedMessage
                id="views.certificate.certificateOverview.print"
                defaultMessage="{icon} Einsatznachweis"
                values={{ icon: <FontAwesomeIcon icon={PrintSolidIcon} /> }}
              />
            </a>
          )
        }
      </>
    );
  }

  function getOverviewButtons(service: Service) {
    return (
      <>
        {printButton(service)}
        {editButton(service)}
        {adminButtons(service)}
      </>
    );
  }

  function OverViewTableRenderActions() {
    return (service: Service) => (
      <div className={classes.hideButtonText}>
        {getOverviewButtons(service)}
        <ServiceModal
          onSubmit={onServiceTableSubmit(serviceStore, userStore)}
          onServiceConfirmed={confirmService(serviceStore, userStore)}
          user={user}
          service={service}
          onClose={onModalClose}
          isOpen={serviceModalId === service.id}
        />
      </div>
    );
  }

  return (
    <OverviewTable
      data={user.services}
      columns={columns}
      renderActions={OverViewTableRenderActions()}
    />
  );
};
