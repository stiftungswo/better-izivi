import { IntlShape } from 'react-intl';
import { withPageValidations } from '../ValidatablePage';
import { BankAndInsurancePage } from './BankAndInsurancePage';
import { CommunityPasswordPage } from './CommunityPasswordPage';
import { ContactPage } from './ContactPage';
import { PersonalDetailsPage } from './PersonalDetailsPage';

export function getRegisterFormPages(intl: IntlShape) {
  const communityPasswordPageTitle = intl.formatMessage({
    id: 'izivi.frontend.register.communityPasswordPage.title',
    defaultMessage: 'Community Passwort',
  });
  const personalDetailsPageTitle = intl.formatMessage({
    id: 'izivi.frontend.register.personalDetailsPage.title',
    defaultMessage: 'Persönliche Informationen',
  });
  const contactPageTitle = intl.formatMessage({
    id: 'izivi.frontend.register.contactPage.title',
    defaultMessage: 'Kontaktinformationen',
  });
  const bankAndInsurancePageTitle = intl.formatMessage({
    id: 'izivi.frontend.register.bankAndInsurancePage.title',
    defaultMessage: 'Bank- und Versicherungsinformationen',
  });

  return [
    {
      title: communityPasswordPageTitle,
      component: withPageValidations(['community_password'])(
        CommunityPasswordPage,
      ),
    },
    {
      title: personalDetailsPageTitle,
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
      title: contactPageTitle,
      component: withPageValidations([
        'phone',
        'address',
        'city',
        'zip',
        'hometown',
      ])(ContactPage),
    },
    {
      title: bankAndInsurancePageTitle,
      component: withPageValidations(['bank_iban', 'health_insurance'])(
        BankAndInsurancePage,
      ),
    },
  ];
}
