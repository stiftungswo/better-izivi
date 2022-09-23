import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { FormattedMessage, IntlShape } from 'react-intl';
import { CheckboxField } from '../../../form/CheckboxField';
import { NumberField, PasswordField, SelectField, TextField } from '../../../form/common';
import { DatePickerField } from '../../../form/DatePickerField';
import { WiredField } from '../../../form/formik';
import { LoadingInformation } from '../../../layout/LoadingInformation';
import { MainStore } from '../../../stores/mainStore';
import { RegionalCenterStore } from '../../../stores/regionalCenterStore';

interface PersonalDetailsPageProps {
  regionalCenterStore?: RegionalCenterStore;
  mainStore?: MainStore;
}

@inject('regionalCenterStore', 'mainStore')
@observer
export class PersonalDetailsPage extends React.Component<PersonalDetailsPageProps, { loading: boolean }> {
  private intl: IntlShape;

  constructor(props: PersonalDetailsPageProps) {
    super(props);

    this.props.regionalCenterStore!.fetchAll().then(() => this.setState({ loading: false }));
    this.state = { loading: true };
    this.intl = this.props.mainStore!.intl;
  }

  render() {
    if (this.state.loading) {
      return (
        <LoadingInformation
          message={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.load_form',
              defaultMessage: 'Lade Formular',
            })
          }
          className="mb-3"
        />
      );
    }

    return (
      <>
        <h3 className={'mb-3'}>
          <FormattedMessage
            id="register.personalDetailsPage.title"
            defaultMessage="Persönliche Informationen"
          />
        </h3>
        <WiredField
          horizontal={true}
          component={NumberField}
          name={'zdp'}
          label={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.zdp',
              defaultMessage: 'Zivildienstnummer (ZDP)',
            })
          }
          placeholder={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.zdp_placeholder',
              defaultMessage: 'Dies ist deine Zivildienst-Nummer, welche du auf deinem Aufgebot wiederfindest',
            })
          }
        />
        <WiredField
          horizontal={true}
          component={SelectField}
          name={'regional_center_id'}
          label={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.regional_center',
              defaultMessage: 'Regionalzentrum',
            })
          }
          options={this.props.regionalCenterStore!.entities.map(({ id, name }) => ({ id, name }))}
        />
        <WiredField
          horizontal={true}
          component={TextField}
          name={'first_name'}
          label={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.first_name',
              defaultMessage: 'Vorname',
            })
          }
          placeholder={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.first_name_placeholder',
              defaultMessage: 'Dein Vorname',
            })
          }
        />
        <WiredField
          horizontal={true}
          component={TextField}
          name={'last_name'}
          label={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.last_name',
              defaultMessage: 'Nachname',
            })
          }
          placeholder={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.last_name_placeholder',
              defaultMessage: 'Dein Nachname',
            })
          }
        />
        <WiredField
          horizontal={true}
          component={TextField}
          name={'email'}
          label={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.email',
              defaultMessage: 'Email',
            })
          }
          placeholder={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.email_placeholder',
              defaultMessage: 'Wird für das zukünftige Login sowie das Versenden von Systemnachrichten benötigt',
            })
          }
        />
        <WiredField
          horizontal={true}
          component={DatePickerField}
          name={'birthday'}
          label={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.birthday',
              defaultMessage: 'Geburtstag',
            })
          }
          placeholder={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.birthday_placeholder',
              defaultMessage: 'dd.mm.yyyy',
            })
          }
        />
        <WiredField
          horizontal={true}
          component={PasswordField}
          name={'password'}
          label={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.password_min_chars',
              defaultMessage: 'Passwort (mind. 6 Zeichen)',
            })
          }
          placeholder={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.password_min_chars_placeholder',
              defaultMessage: 'Passwort mit mindestens 6 Zeichen',
            })
          }
        />
        <WiredField
          horizontal={true}
          component={PasswordField}
          name={'password_confirm'}
          label={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.password_confirm',
              defaultMessage: 'Passwort Bestätigung',
            })
          }
          placeholder={
            this.intl.formatMessage({
              id: 'register.personalDetailsPage.password_confirm_placeholder',
              defaultMessage: 'Wiederhole dein gewähltes Passwort',
            })
          }
        />
        <WiredField
          horizontal={true}
          component={CheckboxField}
          name={'newsletter'}
          label={
             this.intl.formatMessage({
               id: 'register.personalDetailsPage.newsletter_yes',
               defaultMessage: 'Ja, ich möchte den SWO Newsletter erhalten',
             },
             {
               link_de: <a href="https://www.stiftungswo.ch/datenschutzerklaerung/">Datenschutzerklärung</a>,
               link_fr: <a href="https://www.stiftungswo.ch/datenschutzerklaerung/">charte de confidentialité</a>,
               link_en: <a href="https://www.stiftungswo.ch/datenschutzerklaerung/">privacy policy</a>,
             })
           }
        />
        <WiredField
          horizontal={true}
          component={SelectField}
          name={'photographs_accepted'}
          label={
             this.intl.formatMessage({
               id: 'register.personalDetailsPage.photographs_accepted',
               defaultMessage: 'Ich willige ein, dass die SWO Fotos von mir beim Einsatz weiterverwenden darf',
             })
           }
          options={[
            { id: undefined, name: '' },
            { id: true, name: 'Ja' },
            { id: false, name: 'Nein' }
          ]}
        />
      </>
    );
  }
}
