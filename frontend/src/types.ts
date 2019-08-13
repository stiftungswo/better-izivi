import { FormikBag } from 'formik';

export interface Holiday {
  id?: number;
  beginning: string;
  ending: string;
  holiday_type: 'public_holiday' | 'company_holiday';
  description: string;
}

export interface Payment {
  id?: number;
  amount: number;
  created_at: string;
  payment_entries: PaymentEntry[];
}

export interface PaymentEntry {
  id?: number;
  expense_sheet: ExpenseSheet;
  user: User;
}

export interface ExpenseSheet {
  id?: number;
  additional_workfree: number;
  additional_workfree_comment: string;
  bank_account_number: string;
  clothing_expenses: number;
  clothing_expenses_comment: string;
  unpaid_company_holiday_days: number;
  paid_company_holiday_days: number;
  company_holiday_comment: string;
  driving_expenses: number;
  driving_expenses_comment: string;
  extraordinary_expenses: number;
  extraordinary_expenses_comment: string;
  ending: string;
  unpaid_vacation_days: number;
  unpaid_vacation_comment: string;
  ignore_first_last_day: boolean;
  sick_days: number;
  sick_comment: string;
  service?: Service;
  payment_timestamp?: Date;
  beginning: string;
  state: ExpenseSheetState;
  total_costs?: number;
  user_id: number;
  paid_vacation_days: number;
  paid_vacation_comment: string;
  work_days: number;
  workfree_days: number;
}

export interface ExpenseSheetHints {
  suggestions: {
    work_days: number;
    workfree_days: number;
    paid_company_holiday_days: number;
    unpaid_company_holiday_days: number;
    clothing_expenses: number;
  };
  remaining_days: {
    sick_days: number;
    paid_vacation_days: number;
  }
}

export enum ExpenseSheetState {
  open = 'open',
  ready_for_payment = 'ready_for_payment',
  payment_in_progress = 'payment_in_progress',
  paid = 'paid',
}

export interface ExpenseSheetListing {
  id: number;
  ending: string;
  beginning: string;
  state: ExpenseSheetState;
  duration: number;
}

export interface DailyExpense {
  breakfast: number;
  lunch: number;
  dinner: number;
}

export interface ServiceSpecification {
  identification_number?: string;
  name: string;
  short_name: string;
  work_clothing_expenses: number;
  work_days_expenses: DailyExpense;
  paid_vacation_expenses: DailyExpense;
  first_day_expenses: DailyExpense;
  last_day_expenses: DailyExpense;
  accommodation_expenses: number;
  pocket_money: number;
  active: boolean;
}

export interface User {
  id: number;
  active: boolean;
  address: string;
  bank_iban: string;
  birthday: string;
  chainsaw_workshop: boolean;
  city: string;
  driving_licence_b: boolean;
  driving_licence_be: boolean;
  email: string;
  ending: null | string;
  first_name: string;
  health_insurance: string;
  hometown: string;
  internal_note: string;
  last_name: string;
  phone: string;
  regional_center_id: number;
  expense_sheets: ExpenseSheetListing[];
  role: 'admin' | 'civil_servant';
  services: Service[];
  beginning: null | string;
  work_experience: null | string;
  zdp: number;
  zip: number | null;
}

export interface RegionalCenter {
  name: string;
  address: string;
  short_name: string;
  id: number;
}

export interface UserFilter {
  zdp: string;
  name: string;
  beginning: string;
  ending: string;
  active: boolean;
  role: string;
}

export interface Service {
  id?: number;
  beginning: string | null;
  days: number;
  confirmation_date: null | string;
  eligible_paid_vacation_days: number;
  ending: string | null;
  feedback_done: boolean;
  feedback_mail_sent: boolean;
  first_swo_service: boolean;
  long_service: boolean;
  service_type: number | null;
  probation_period: boolean;
  service_specification?: ServiceSpecification;
  service_specification_identification_number: string;
  user_id: number;
}

export interface ServiceCollection {
  id?: number;
  beginning: string | null;
  ending: string | null;
  confirmation_date: string | null;
  service_specification: {
    identification_number: string;
    name: string | null;
    short_name: string | null;
  };
  user: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    zdp: number;
  };
}

export interface UserFeedback {
  id?: number;
}

export interface UserQuestionWithAnswers {
  id?: number;
  answers: UserQuestionAnswers;
  custom_info: string;
  opt1: string;
  opt2: string;
  question: string;
  type: number;
}

export interface UserQuestionAnswers {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
}

export interface Listing {
  id?: number;
  archived?: boolean;
}

export interface Column<T> {
  id: string;
  numeric?: boolean;
  label: string;
  format?: (t: T) => React.ReactNode;
  span?: {
    col?: number;
    row?: number;
  };
}

export type ActionButtonAction = (() => void) | string;

// tslint:disable-next-line:no-any ; really don't care for that type, and it comes from deep inside Formik
export type HandleFormikSubmit<Values> = (values: Values, formikBag: FormikBag<any, Values>) => void;

// If we'd type thoroughly we'd need to create a type for each models representation in a form / yup validation schema
// tslint:disable-next-line:no-any
export type FormValues = any;
