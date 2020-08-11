import { IntlShape } from 'react-intl';
import { withPageValidations } from '../ValidatablePage';
import { BankAndInsurancePage } from './BankAndInsurancePage';
import { CommunityPasswordPage } from './CommunityPasswordPage';
import { ContactPage } from './ContactPage';
import { PersonalDetailsPage } from './PersonalDetailsPage';

export const REGISTER_FORM_PAGES = [
  {
    title: 'Community Passwort',
    component: withPageValidations([
      'community_password',
    ])(CommunityPasswordPage),
  },
  {
    title: 'Persönliche Informationen',
    component: withPageValidations([
      'zdp',
      'regional_center_id',
      'first_name',
      'last_name',
      'email',
      'birthday',
      'password',
      'password_confirm',
      'newsletter',
    ])(PersonalDetailsPage),
  },
  {
    title: 'Kontakinformationen',
    component: withPageValidations([
      'phone',
      'address',
      'city',
      'zip',
      'hometown',
    ])(ContactPage),
  },
  {
    title: 'Bank- und Versicherungsinformationen',
    component: withPageValidations([
      'bank_iban',
      'health_insurance',
    ])(BankAndInsurancePage),
  },
];
