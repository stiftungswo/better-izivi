import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { UncontrolledTooltip } from 'reactstrap';
import Button from 'reactstrap/lib/Button';
import Col from 'reactstrap/lib/Col';
import Row from 'reactstrap/lib/Row';
import { MainStore } from '../../../stores/mainStore';
import { ExpenseSheet, Service } from '../../../types';
import {
  ExclamationSolidIcon,
  PrintSolidIcon,
  SaveRegularIcon,
  TrashAltRegularIcon, UserIcon,
} from '../../../utilities/Icon';

type func = () => void;

interface ExpenseSheetFormButtonsProps {
  safeOverride: boolean;
  onForceSave: func;
  onSave: func;
  onDelete: func;
  expenseSheet: ExpenseSheet;
  mainStore: MainStore;
  service: Service;
}

function getSaveButton({ safeOverride, onForceSave, onSave, expenseSheet }: ExpenseSheetFormButtonsProps) {
  if (expenseSheet.modifiable) {
    if (safeOverride) {
      return (
        <Button
          block
          color={'primary'}
          onClick={onForceSave}
        >
          <FormattedMessage
            id="views.expense_sheets.expenseSheetFormButtons.force_save"
            defaultMessage="{icon} Speichern erzwingen"
            values={{ icon: <FontAwesomeIcon icon={ExclamationSolidIcon} /> }}
          />
        </Button>
      );
    } else {
      return (
        <Button
          block
          color={'primary'}
          onClick={onSave}
        >
          <FormattedMessage
            id="views.expense_sheets.expenseSheetFormButtons.save"
            defaultMessage="{icon} Speichern"
            values={{ icon: <FontAwesomeIcon icon={SaveRegularIcon} /> }}
          />
        </Button>
      );
    }
  } else {
    return (
      <>
        <div id={'ExpenseSheetSaveButtonWrapper'}>
          <Button
            block
            disabled
            color={'primary'}
            style={{ pointerEvents: 'none' }}
          >
            <FormattedMessage
              id="views.expense_sheets.expenseSheetFormButtons.save"
              defaultMessage="{icon} Speichern"
              values={{ icon: <FontAwesomeIcon icon={SaveRegularIcon} /> }}
            />
          </Button>
        </div>
        <UncontrolledTooltip
          trigger={'hover focus'}
          delay={{ show: 0, hide: 0 }}
          target={'ExpenseSheetSaveButtonWrapper'}
          placement={'top'}
        >
          <FormattedMessage
            id="views.expense_sheets.expenseSheetFormButtons.only_open_expenses_can_be_modified"
            defaultMessage="Nur offene Spesen können modifiziert werden!"
          />
        </UncontrolledTooltip>
      </>
    );
  }
}

function getDeleteButton({ onDelete, expenseSheet }: ExpenseSheetFormButtonsProps) {
  if (expenseSheet.deletable) {
    return (
      <Button block color={'danger'} onClick={onDelete}>
        <FormattedMessage
          id="views.expense_sheets.expenseSheetFormButtons.delete"
          defaultMessage="{icon} Löschen"
          values={{ icon: <FontAwesomeIcon icon={TrashAltRegularIcon} /> }}
        />
      </Button>
    );
  } else {
    return (
      <>
        <div id={'ExpenseSheetDeleteButtonWrapper'}>
          <Button
            block
            disabled
            color={'danger'}
            style={{ pointerEvents: 'none' }}
          >
            <FormattedMessage
              id="views.expense_sheets.expenseSheetFormButtons.delete"
              defaultMessage="{icon} Löschen"
              values={{ icon: <FontAwesomeIcon icon={TrashAltRegularIcon} /> }}
            />
          </Button>
        </div>
        <UncontrolledTooltip
          trigger={'hover focus'}
          delay={{ show: 0, hide: 0 }}
          target={'ExpenseSheetDeleteButtonWrapper'}
          placement={'top'}
        >
          <FormattedMessage
            id="views.expense_sheets.expenseSheetFormButtons.only_open_expenses_can_be_deleted"
            defaultMessage="Nur offene Spesen können gelöscht werden!"
          />
        </UncontrolledTooltip>
      </>
    );
  }
}

function getPrintButton(mainStore: MainStore, expenseSheetId?: number) {
  const printURL = mainStore.apiURL(`expense_sheets/${expenseSheetId!}.pdf`);

  return (
    <Button block color={'warning'} disabled={!expenseSheetId} href={printURL} tag={'a'} target={'_blank'}>
      <FormattedMessage
        id="views.expense_sheets.expenseSheetFormButtons.print"
        defaultMessage="{icon} Drucken"
        values={{ icon: <FontAwesomeIcon icon={PrintSolidIcon} /> }}
      />
    </Button>
  );
}

function getProfileButton(userId: number) {
  return (
    <Link to={'/users/' + userId} style={{ textDecoration: 'none' }}>
      <Button block>
        <FormattedMessage
          id="views.expense_sheets.expenseSheetFormButtons.show_profile"
          defaultMessage="{icon} Profil anzeigen"
          values={{ icon: <FontAwesomeIcon icon={UserIcon} /> }}
        />
      </Button>
    </Link>
  );
}

export const ExpenseSheetFormButtons = (props: ExpenseSheetFormButtonsProps) => {
  const buttons = [
    getSaveButton(props),
    getDeleteButton(props),
    getPrintButton(props.mainStore, props.expenseSheet.id),
    getProfileButton(props.expenseSheet.user_id),
  ];

  return (
    <Row>
      {buttons.map((button, index) => (
        <Col key={index} className="mt-3">
          {button}
        </Col>
      ))}
    </Row>
  );
};
