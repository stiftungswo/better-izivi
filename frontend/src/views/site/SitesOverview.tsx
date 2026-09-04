import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, FormikActions } from 'formik';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import injectSheet, { WithSheet } from 'react-jss';
import Button from 'reactstrap/lib/Button';
import IziviContent from '../../layout/IziviContent';
import { MainStore } from '../../stores/mainStore';
import { SiteStore } from '../../stores/siteStore';
import { Site } from '../../types';
import { PlusSquareRegularIcon, SaveRegularIcon } from '../../utilities/Icon';
import serviceSpecificationStyles from '../service_specification/serviceSpecificationOverviewStyle';
import siteSchema from './siteSchema';
import { SitesOverviewTable } from './SitesOverviewTable';
import { SitesOverviewTableRowFields } from './SitesOverviewTableRowFields';

const INITIAL_FORM_VALUES: Site = Object.freeze({
  id: undefined,
  name: '',
  language: 'german',
  terms_pdf: null,
});

interface SiteProps extends WithSheet<typeof serviceSpecificationStyles> {
  siteStore?: SiteStore;
  mainStore?: MainStore;
}

interface SiteState {
  loading: boolean;
}

@inject('siteStore', 'mainStore')
@observer
export class SitesOverviewInner extends React.Component<SiteProps, SiteState> {
  constructor(props: SiteProps) {
    super(props);

    this.props.siteStore!.fetchAll().then(() => {
      this.setState({ loading: false });
    });

    this.state = {
      loading: true,
    };
  }

  handleSubmit = async (entity: Site, actions: FormikActions<Site>) => {
    this.props.siteStore!.put(siteSchema.cast(entity)).then(() => actions.setSubmitting(false));
  }

  handleAdd = async (entity: Site, actions: FormikActions<Site>) => {
    await this.props.siteStore!.post(siteSchema.cast(entity)).then(() => {
      actions.setSubmitting(false);
      actions.resetForm();
    });
  }

  render() {
    const sites = this.props.siteStore!.entities;

    return (
      <IziviContent
        loading={this.state.loading}
        title={
          this.props.mainStore!.intl.formatMessage({
            id: 'layout.navigation.sites',
            defaultMessage: 'Standorte',
          })
        }
        card
        fullscreen
      >
        <SitesOverviewTable classes={this.props.classes} theme={this.props.theme}>
          <Formik
            validationSchema={siteSchema}
            initialValues={INITIAL_FORM_VALUES}
            onSubmit={this.handleAdd}
            render={formikProps => (
              <tr>
                <SitesOverviewTableRowFields {...this.props} />
                <td className={this.props.classes.buttonsTd}>
                  <Button
                    className={this.props.classes.smallFontSize}
                    color={'success'}
                    disabled={formikProps.isSubmitting}
                    onClick={formikProps.submitForm}
                  >
                    <FontAwesomeIcon icon={PlusSquareRegularIcon} />
                  </Button>
                </td>
              </tr>
            )}
          />
          {sites.map(site => (
            <Formik
              key={site.id}
              validationSchema={siteSchema}
              initialValues={site}
              onSubmit={this.handleSubmit}
              render={formikProps => (
                <tr>
                  <SitesOverviewTableRowFields {...this.props} />
                  <td className={this.props.classes.buttonsTd}>
                    <Button
                      className={this.props.classes.smallFontSize}
                      color={'success'}
                      disabled={formikProps.isSubmitting}
                      onClick={formikProps.submitForm}
                    >
                      <FontAwesomeIcon icon={SaveRegularIcon} />
                    </Button>
                  </td>
                </tr>
              )}
            />
          ))}
        </SitesOverviewTable>
      </IziviContent>
    );
  }
}

export const SitesOverview = injectSheet(serviceSpecificationStyles)(SitesOverviewInner);
