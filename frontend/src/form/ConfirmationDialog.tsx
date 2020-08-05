import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from 'reactstrap/lib/Button';
import Modal from 'reactstrap/lib/Modal';
import ModalBody from 'reactstrap/lib/ModalBody';
import ModalFooter from 'reactstrap/lib/ModalFooter';
import ModalHeader from 'reactstrap/lib/ModalHeader';

interface ConfirmDialogProps {
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title?: string;
  children: React.ReactNode;
}

export default function ConfirmationDialog({ children, title, open, onClose, onConfirm }: ConfirmDialogProps) {
  return (
    <Modal maxwidth="xs" aria-labelledby="confirmation-dialog-title" isOpen={open} onClose={onClose}>
      {title && <ModalHeader id="confirmation-dialog-title">{title}</ModalHeader>}
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        <Button onClick={onClose} color="primary">
          <FormattedMessage
            id="izivi.frontend.form.confirmation_dialog.cancel"
            defaultMessage="Abbrechen"
          />
        </Button>
        <Button onClick={onConfirm} color="danger">
          <FormattedMessage
            id="izivi.frontend.form.confirmation_dialog.ok"
            defaultMessage="Ok"
          />
        </Button>
      </ModalFooter>
    </Modal>
  );
}
