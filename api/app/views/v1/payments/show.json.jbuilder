# frozen_string_literal: true


json.array! @sheets do |sheet|
  json.extract! sheet, :id, :state
  json.full_expenses sheet.calculate_full_expenses
  json.payment_timestamp sheet.payment_timestamp.to_i
  json.user do
    json.extract! sheet.user, :zdp, :full_name, :id, :bank_iban
  end
end


