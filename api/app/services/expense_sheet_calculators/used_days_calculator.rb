module ExpenseSheetCalculators
  class UsedDaysCalculator
    def initialize(service)
      @expense_sheets = service.expense_sheets.calculable
    end

    def used_paid_vacation_days
      @expense_sheets.sum { |expense_sheet| expense_sheet.paid_vacation_days + expense_sheet.paid_company_holiday_days }
    end

    def used_sick_days
      @expense_sheets.sum(&:sick_days)
    end
  end
end
