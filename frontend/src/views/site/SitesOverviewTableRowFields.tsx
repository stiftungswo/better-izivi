import { Field } from 'formik';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { WithSheet } from 'react-jss';
import { IziviFormControl, SelectField, TextField } from '../../form/common';
import { WiredField } from '../../form/formik';
import serviceSpecificationStyles from '../service_specification/serviceSpecificationOverviewStyle';

interface OverviewTableRowParams {
  tableDataClassName: string;
  className: string;
  component: React.ElementType;
  name: string;
  size?: string;
  options?: { id: string; name: string }[];
}

const OverviewTableRow = ({ tableDataClassName, ...other }: OverviewTableRowParams) => {
  return (
    <td className={tableDataClassName}>
      <WiredField {...other} />
    </td>
  );
};

type SitesOverviewTableRowFieldsProps = WithSheet<typeof serviceSpecificationStyles>;

interface TermsPdfFieldRenderProps {
  field: { value: File | null };
  form: {
    values: { terms_pdf_filename?: string; terms_pdf_url?: string };
    setFieldValue: (name: string, value: File | null) => void;
  };
}

export const SitesOverviewTableRowFields = observer(({ classes }: SitesOverviewTableRowFieldsProps) => {
  const intl = useIntl();
  const defaultParams = { tableDataClassName: classes.rowTd };
  const inputDefaultParams = { ...defaultParams, className: classes.inputs, component: TextField, size: '15' };

  const languageOptions = [
    { id: 'german', name: intl.formatMessage({ id: 'views.site.SitesOverviewTableRowFields.german', defaultMessage: 'Deutsch' }) },
    { id: 'french', name: intl.formatMessage({ id: 'views.site.SitesOverviewTableRowFields.french', defaultMessage: 'Französisch' }) },
  ];

  return (
    <>
      <OverviewTableRow {...inputDefaultParams} name={'name'} />
      <OverviewTableRow {...defaultParams} className={classes.inputs} component={SelectField} name={'language'} options={languageOptions} />
      <td className={classes.rowTd}>
        <Field name={'terms_pdf'}>
          {({ form }: TermsPdfFieldRenderProps) => (
            <IziviFormControl name={'terms_pdf'}>
              <div>
                {form.values.terms_pdf_url && (
                  <div>
                    <a href={form.values.terms_pdf_url} target={'_blank'} rel={'noopener noreferrer'}>
                      {form.values.terms_pdf_filename || intl.formatMessage({
                        id: 'views.site.SitesOverviewTableRowFields.current_pdf',
                        defaultMessage: 'Aktuelle Datei',
                      })}
                    </a>
                  </div>
                )}
                <input
                  className={classes.inputs}
                  type={'file'}
                  accept={'application/pdf'}
                  onChange={e => form.setFieldValue('terms_pdf', e.target.files ? e.target.files[0] : null)}
                />
              </div>
            </IziviFormControl>
          )}
        </Field>
      </td>
    </>
  );
});
