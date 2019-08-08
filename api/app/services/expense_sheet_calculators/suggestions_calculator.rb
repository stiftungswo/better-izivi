# frozen_string_literal: true

module ExpenseSheetCalculators
  class SuggestionsCalculator
    WORK_CLOTHING_MAX_PER_SERVICE = 24_000

    extend Forwardable

    def_delegator :day_calculator, :calculate_workfree_days, :suggested_workfree_days
    def_delegator :day_calculator, :calculate_work_days, :suggested_work_days

    def initialize(expense_sheet)
      @expense_sheet = expense_sheet
    end

    def suggested_clothing_expenses
      return 0 if @expense_sheet.service.service_specification.work_clothing_expenses.zero?

      per_day = @expense_sheet.service.service_specification.work_clothing_expenses
      max_possible_value = @expense_sheet.calculate_chargeable_days * per_day

      difference_to_max = WORK_CLOTHING_MAX_PER_SERVICE - already_paid_clothing_expenses
      value = [max_possible_value, difference_to_max].min

      value.positive? ? value : 0
    end

    private

    def already_paid_clothing_expenses
      sheets = @expense_sheet.service.expense_sheets.before_date(@expense_sheet.beginning)

      sheets.sum(&:clothing_expenses)
    end

    def day_calculator
      @day_calculator ||= DayCalculator.new(@expense_sheet.beginning, @expense_sheet.ending)
    end
  end
end
