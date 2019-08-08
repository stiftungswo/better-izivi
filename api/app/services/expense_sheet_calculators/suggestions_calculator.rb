# frozen_string_literal: true

module ExpenseSheetCalculators
  class SuggestionsCalculator
    WORK_CLOTHING_MAX_PER_SERVICE = 24_000

    def initialize(expense_sheet)
      @expense_sheet = expense_sheet
    end

    def suggested_clothing_expenses
      return 0 if @expense_sheet.service.service_specification.work_clothing_expenses.zero?

      sheets = @expense_sheet.service.expense_sheets.before_date(@expense_sheet.beginning)
      # already_paid = sheets.sum { |sheet| sheet.public_send :calculate_work_clothing_expenses }

      already_paid = sheets.sum(&:clothing_expenses)

      per_day = @expense_sheet.service.service_specification.work_clothing_expenses
      value = calculate_chargeable_days * per_day
      future_already_paid = already_paid + value

      return WORK_CLOTHING_MAX_PER_SERVICE - already_paid if future_already_paid > WORK_CLOTHING_MAX_PER_SERVICE

      value
    end
  end
end
