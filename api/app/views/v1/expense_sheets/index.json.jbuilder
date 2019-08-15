# frozen_string_literal: true

json.array! @expense_sheets do |expense_sheet|
  json.partial! 'expense_sheet', expense_sheet: expense_sheet
  json.user do
    json.extract! expense_sheet.user, :zdp, :full_name
  end
end
