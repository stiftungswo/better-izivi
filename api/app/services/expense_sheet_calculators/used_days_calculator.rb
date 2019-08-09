# frozen_string_literal: true

module ExpenseSheetCalculators
  class UsedDaysCalculator
    def initialize(service)
      @expense_sheets = service.expense_sheets.calculable
    end

    def used_paid_vacation_days
      @expense_sheets.sum(&:used_paid_vacation_days)
    end

    def used_sick_days
      @expense_sheets.sum(&:sick_days)
    end
  end
end
