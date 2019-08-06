# frozen_string_literal: true

def all_states_of_payment(payment)
  payment.expense_sheets.each(&:reload).map(&:state).map(&:to_sym).uniq
end

def all_payment_timestamps_of_payment(payment)
  payment.expense_sheets.each(&:reload).pluck(:payment_timestamp).uniq.map(&:to_i)
end
