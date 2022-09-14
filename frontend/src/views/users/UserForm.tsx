import { FormikProps } from 'formik';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import Button from 'reactstrap/lib/Button';
import Col from 'reactstrap/lib/Col';
import Form from 'reactstrap/lib/Form';
import Row from 'reactstrap/lib/Row';
import { CheckboxField } from '../../form/CheckboxField';
import { NumberField, SelectField, TextField } from '../../form/common';
import { DatePickerField } from '../../form/DatePickerField';
import { WiredField } from '../../form/formik';
import { FormView, FormViewProps } from '../../form/FormView';
import { SolidHorizontalRow } from '../../layout/SolidHorizontalRow';
import { MainStore } from '../../stores/mainStore';
import { RegionalCenterStore } from '../../stores/regionalCenterStore';
import { ServiceSpecificationStore } from '../../stores/serviceSpecificationStore';
import { UserStore } from '../../stores/userStore';
import { User } from '../../types';
import { empty } from '../../utilities/helpers';
import { ExpenseSheetSubform } from './ExpenseSheetSubform';
import { userSchema } from './schemas';
import { ServiceSubform } from './service_subform/ServiceSubform';

type Props = {
  mainStore?: MainStore;
  user: User;
  userStore?: UserStore;
  serviceSpecificationStore?: ServiceSpecificationStore;
  regionalCenterStore?: RegionalCenterStore;
} & FormViewProps<User> &
  RouteComponentProps;

@inject(
  'mainStore',
  'userStore',
  'serviceSpecificationStore',
  'regionalCenterStore',
)
@observer
class UserFormInner extends React.Component<Props> {
  componentWillMount() {
    void this.props.serviceSpecificationStore!.fetchAll();
    void this.props.regionalCenterStore!.fetchAll();
  }

  render() {
    const { onSubmit, user, title, mainStore } = this.props;
    const intl = mainStore!.intl;

    return (
      <FormView<User>
        card
        loading={empty(user) || this.props.loading}
        initialValues={user}
        onSubmit={(updatedUser: User) => onSubmit(updatedUser)}
        title={title}
        validationSchema={userSchema}
        render={(formikProps: FormikProps<User>) => (
          <Form>
            <h3>
              <FormattedMessage
                id="views.users.userForm.print"
                defaultMessage="Persönliche Informationen"
              />
            </h3>
            <p>
              <FormattedMessage
                id="views.users.userForm.info1"
                defaultMessage="Bitte fülle die folgenden Felder zu deiner Person wahrheitsgetreu aus. Dadurch erleichterst du dir und uns den administrativen Aufwand."
              />
              <br />
              <FormattedMessage
                id="views.users.userForm.info2"
                defaultMessage="Wir verwenden diese Informationen ausschliesslich zur Erstellung der Einsatzplanung und zur administrativen Abwicklung."
              />
            </p>
            <p>
              <FormattedMessage
                id="views.users.userForm.info3"
                defaultMessage="Bitte lies dir auch die näheren Informationen zu den jeweiligen Feldern unter dem Icon jeweils durch."
              />
            </p>
            <p>
              <FormattedMessage
                id="views.users.userForm.info4"
                defaultMessage="Wichtig: Vergiss nicht zu speichern (Daten speichern) bevor du die Seite verlässt oder eine Einsatzplanung erfasst."
              />
            </p>

            <SolidHorizontalRow />

            <WiredField
              disabled
              horizontal
              component={TextField}
              name={'zdp'}
              label={intl.formatMessage({
                id: 'views.users.userForm.zdp',
                defaultMessage: 'ZDP ',
              })}
            />
            <WiredField
              horizontal
              component={TextField}
              name={'first_name'}
              label={intl.formatMessage({
                id: 'views.users.userForm.first_name',
                defaultMessage: 'Vorname',
              })}
            />
            <WiredField
              horizontal
              component={TextField}
              name={'last_name'}
              label={intl.formatMessage({
                id: 'views.users.userForm.last_name',
                defaultMessage: 'Nachname',
              })}
            />
            <WiredField
              horizontal
              component={TextField}
              name={'address'}
              label={intl.formatMessage({
                id: 'views.users.userForm.street',
                defaultMessage: 'Strasse',
              })}
            />
            <WiredField
              horizontal
              component={NumberField}
              name={'zip'}
              label={intl.formatMessage({
                id: 'views.users.userForm.post_code',
                defaultMessage: 'PLZ',
              })}
            />
            <WiredField
              horizontal
              component={TextField}
              name={'city'}
              label={intl.formatMessage({
                id: 'views.users.userForm.place',
                defaultMessage: 'Ort',
              })}
            />
            <WiredField
              horizontal
              component={TextField}
              name={'hometown'}
              label={intl.formatMessage({
                id: 'views.users.userForm.home_town',
                defaultMessage: 'Heimatort',
              })}
            />
            <WiredField
              horizontal
              component={DatePickerField}
              name={'birthday'}
              label={intl.formatMessage({
                id: 'views.users.userForm.birthday',
                defaultMessage: 'Geburtstag',
              })}
            />

            <SolidHorizontalRow />
            <h3>
              <FormattedMessage
                id="views.users.userForm.contact_possibility"
                defaultMessage="Kontaktmöglichkeit"
              />
            </h3>
            <p>
              <FormattedMessage
                id="views.users.userForm.phone_format_info"
                defaultMessage="Telefonnummer bitte im Format '044 123 45 67' angeben."
              />
            </p>

            <WiredField
              horizontal
              component={TextField}
              name={'email'}
              label={intl.formatMessage({
                id: 'views.users.userForm.email',
                defaultMessage: 'E-Mail',
              })}
            />
            <WiredField
              horizontal
              component={TextField}
              name={'phone'}
              label={intl.formatMessage({
                id: 'views.users.userForm.phone',
                defaultMessage: 'Telefon',
              })}
            />

            <SolidHorizontalRow />
            <h3>
              <FormattedMessage
                id="views.users.userForm.bank_post_connection"
                defaultMessage="Bank-/Postverbindung"
              />
            </h3>

            <WiredField
              horizontal
              component={TextField}
              name={'bank_iban'}
              label={intl.formatMessage({
                id: 'views.users.userForm.iban_number',
                defaultMessage: 'IBAN-Nummer',
              })}
            />

            <SolidHorizontalRow />
            <h3>
              <FormattedMessage
                id="views.users.userForm.healt_insurance"
                defaultMessage="Krankenkasse"
              />
            </h3>

            <WiredField
              horizontal
              component={TextField}
              name={'health_insurance'}
              label={intl.formatMessage({
                id:
                  'views.users.userForm.healt_insurance_name_and_location',
                defaultMessage: 'Krankenkasse (Name und Ort)',
              })}
            />

            <SolidHorizontalRow />
            <h3>
              <FormattedMessage
                id="views.users.userForm.various_information"
                defaultMessage="Diverse Informationen"
              />
            </h3>

            <WiredField
              horizontal
              multiline={true}
              component={TextField}
              name={'work_experience'}
              label={intl.formatMessage({
                id: 'views.users.userForm.work_experience',
                defaultMessage: 'Berufserfahrung',
              })}
            />
            <WiredField
              horizontal
              component={SelectField}
              name={'regional_center_id'}
              label={intl.formatMessage({
                id: 'views.users.userForm.regional_center',
                defaultMessage: 'Regionalzentrum',
              })}
              options={this.props.regionalCenterStore!.entities.map(
                ({ id, name }) => ({ id, name }),
              )}
            />
            <WiredField
              horizontal
              component={CheckboxField}
              name={'driving_licence_b'}
              label={intl.formatMessage({
                id: 'views.users.userForm.driving_licence_b',
                defaultMessage: 'Führerausweis Kat. B',
              })}
            />
            <WiredField
              horizontal
              component={CheckboxField}
              name={'driving_licence_be'}
              label={intl.formatMessage({
                id: 'views.users.userForm.driving_licence_be',
                defaultMessage: 'Führerausweis Kat. BE',
              })}
            />
            <WiredField
              horizontal
              component={CheckboxField}
              name={'photographs_accepted'}
              label={intl.formatMessage({
                id: 'views.users.userForm.photographs_accepted',
                defaultMessage: 'Weiterverwendung von Fotos erlaubt',
              })}
            />
            <WiredField
              horizontal
              component={CheckboxField}
              name={'chainsaw_workshop'}
              label={intl.formatMessage({
                id:
                  'views.users.userForm.chainsaw_workshop_already_done',
                defaultMessage: 'Motorsägekurs bereits absolviert',
              })}
            />

            {mainStore!.isAdmin() && (
              <>
                <WiredField
                  horizontal
                  component={SelectField}
                  name={'role'}
                  label={intl.formatMessage({
                    id: 'views.users.userForm.user_role',
                    defaultMessage: 'Benutzerrolle',
                  })}
                  options={[
                    {
                      id: 'admin',
                      name: intl.formatMessage({
                        id: 'views.users.userForm.admin',
                        defaultMessage: 'Admin',
                      }),
                    },
                    {
                      id: 'civil_servant',
                      name: intl.formatMessage({
                        id: 'views.users.userForm.civil_servant',
                        defaultMessage: 'Zivildienstleistender',
                      }),
                    },
                  ]}
                />
                <WiredField
                  horizontal
                  multiline={true}
                  component={TextField}
                  name={'internal_note'}
                  label={intl.formatMessage({
                    id: 'views.users.userForm.inernal_comment',
                    defaultMessage: 'Interne Bemerkung',
                  })}
                />
              </>
            )}

            <Row>
              <Col md={2}>
                <Button
                  block
                  color={'primary'}
                  onClick={formikProps.submitForm}
                >
                  <FormattedMessage
                    id="views.users.userForm.save"
                    defaultMessage="Speichern"
                  />
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      >
        <SolidHorizontalRow />
        <ServiceSubform user={user} />

        <SolidHorizontalRow />
        <ExpenseSheetSubform user={user} />
      </FormView>
    );
  }
}

export const UserForm = withRouter(UserFormInner);
