# frozen_string_literal: true

json.array! @expense_sheets_sum do |expense_sheet|
  json.extract! expense_sheet, :total
end
