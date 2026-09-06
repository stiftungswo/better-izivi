import createStyles from '../../utilities/createStyles';

const serviceSpecificationStyles = () =>
  createStyles({
    smallFontSize: {
      fontSize: '14px',
    },
    inputs: {
      composes: '$smallFontSize',
      padding: '3px 6px !important',
      width: 'auto !important',
    },

    rowTd: {
      composes: '$smallFontSize',
      padding: '5px 2px !important',
      verticalAlign: 'top',
    },
    th: {
      composes: '$smallFontSize',
      padding: '10px 8px !important',
      whiteSpace: 'nowrap',
    },
    buttonsTd: {
      composes: '$inputs',
      padding: '5px !important',
    },

    checkboxes: {
      composes: '$inputs',
      marginLeft: '0px !important',
      marginTop: '0.75rem',
    },

    expensesRow: {
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
    },
    expensePanel: {
      composes: '$smallFontSize',
      padding: '8px 12px',
    },
    expensePanelRow: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '12px',
      marginBottom: '6px',
    },
    expensePanelRowLabel: {
      minWidth: '90px',
      fontWeight: 600,
    },
    expensePanelField: {
      composes: '$inputs',
    },
  });

export default serviceSpecificationStyles;
