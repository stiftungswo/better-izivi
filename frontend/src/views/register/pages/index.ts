import { BankAndInsurancePage, BankAndInsurancePageTitle } from './BankAndInsurancePage';
import { CommunityPasswordPage, CommunityPasswordPageTitle } from './CommunityPasswordPage';
import { ContactPage, ContactPageTitle } from './ContactPage';
import { PersonalDetailsPage, PersonalDetailsPageTitle } from './PersonalDetailsPage';

export const REGISTER_FORM_PAGES = [
  {
    title: CommunityPasswordPageTitle,
    component: CommunityPasswordPage,
  },
  {
    title: PersonalDetailsPageTitle,
    component: PersonalDetailsPage,
  },
  {
    title: ContactPageTitle,
    component: ContactPage,
  },
  {
    title: BankAndInsurancePageTitle,
    component: BankAndInsurancePage,
  },
];
