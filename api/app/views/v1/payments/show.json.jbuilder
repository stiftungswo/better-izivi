# frozen_string_literal: true

json.payment_timestamp @payment_timestamp.to_i
json.state @state
json.expense_sheets do
  json.array! @sheets do |sheet|
    json.extract! sheet, :id
    json.full_expenses sheet.calculate_full_expenses
    json.user do
      json.extract! sheet.user, :zdp, :full_name, :id, :bank_iban
    end
  end
end


