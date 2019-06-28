# frozen_string_literal: true

def count_workdays(date)
  (1..5).cover? date.wday
end

beginning_first_user = User.first.services.last.beginning
ending_first_user = User.first.services.last.ending

ExpenseSheet.create!(
  user: User.first,
  beginning: beginning_first_user,
  ending: ending_first_user,
  work_days: (beginning_first_user..ending_first_user).count(&:on_weekday?),
  workfree_days: (beginning_first_user..ending_first_user).count(&:on_weekend?),
  bank_account_number: User.first.bank_iban
)

beginning_last_user = User.find_by(email: 'zivi_francise@france.ch').services.last.beginning
ending_last_user = User.find_by(email: 'zivi_francise@france.ch').services.last.ending

ExpenseSheet.create!(
  user: User.find_by(email: 'zivi_francise@france.ch'),
  beginning: beginning_last_user,
  ending: ending_last_user,
  work_days: (beginning_last_user..ending_last_user).count(&:on_weekday?),
  workfree_days: (beginning_last_user..ending_last_user).count(&:on_weekend?),
  bank_account_number: User.find_by(email: 'zivi_francise@france.ch').bank_iban
)

ExpenseSheet.create!(
  user: User.find_by(email: 'zivi_francise@france.ch'),
  beginning: beginning_last_user,
  ending: ending_last_user,
  work_days: (beginning_last_user..ending_last_user).count(&:on_weekday?),
  workfree_days: (beginning_last_user..ending_last_user).count(&:on_weekend?),
  bank_account_number: User.find_by(email: 'zivi_francise@france.ch').bank_iban,
  state: :ready_for_payment
)
