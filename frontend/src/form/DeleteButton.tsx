import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import Button from 'reactstrap/lib/Button';
import { MainStore } from '../stores/mainStore';
import ConfirmationDialog from './ConfirmationDialog';

interface DeleteButtonProps {
  onConfirm: () => void;
  message?: string;
  disabled?: boolean;
  id?: string;
  tooltip?: string;
  mainStore?: MainStore;
}

interface DeleteButtonState {
  open: boolean;
}

@inject('mainStore')
@observer
export class DeleteButton extends React.Component<DeleteButtonProps, DeleteButtonState> {
  state = {
    open: false,
  };

  handleOpen = () => {
    this.setState({ open: true });
  }

  handleClose = () => {
    this.setState({ open: false });
  }

  handleConfirm = () => {
    this.props.onConfirm();
    this.handleClose();
  }

  getDeleteButton = () => {
    return (
      <Button
        style={this.props.disabled ? { pointerEvents: 'none' } : undefined}
        onClick={this.handleOpen}
        color={'danger'}
        type={'button'}
        disabled={this.props.disabled}
      >
        {this.props.children}
      </Button>
    );
  }

  getDeleteButtonWithTooltipWrapper = () => {
    if (this.props.id && this.props.tooltip) {
      return (
        <div id={'DeleteButtonWrapper-' + this.props.id} style={{ display: 'inline-block' }}>
          {this.getDeleteButton()}
        </div>
      );
    } else {
      return this.getDeleteButton();
    }
  }

  render = () => {
    const intl = this.props.mainStore!.intl;
    return (
      <>
        <ConfirmationDialog
          onClose={this.handleClose}
          onConfirm={this.handleConfirm}
          open={this.state.open}
          title={intl.formatMessage({
            id: 'form.deleteButton.delete',
            defaultMessage: 'Löschen',
          })}
        >
          {this.props.message
          ? this.props.message
          : intl.formatMessage({
            id: 'form.deleteButton.really_delete',
            defaultMessage: 'Wirklich löschen?',
          })}
        </ConfirmationDialog>
        {this.getDeleteButtonWithTooltipWrapper()}
        {this.props.id && this.props.tooltip && (
          <UncontrolledTooltip
            trigger={'hover focus'}
            delay={{ show: 100, hide: 100 }}
            placement={'top'}
            target={'DeleteButtonWrapper-' + this.props.id}
            container={'DeleteButtonWrapper-' + this.props.id}
          >
            {this.props.tooltip}
          </UncontrolledTooltip>
        )}
      </>
    );
  }
}
