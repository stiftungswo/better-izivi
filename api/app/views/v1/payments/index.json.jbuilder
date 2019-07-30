# frozen_string_literal: true

json.array! @payments do |payment_timestamp, expense_sheets|
  json.payment_timestamp payment_timestamp.to_i
  json.state expense_sheets.first.state
  json.total expense_sheets.sum(&:calculate_full_expenses)
end







