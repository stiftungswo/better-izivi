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

    def suggestions
      {
        work_days: suggested_work_days,
        workfree_days: suggested_workfree_days,
        paid_company_holiday_days: suggested_paid_company_holiday_days,
        unpaid_company_holiday_days: suggested_unpaid_company_holiday_days,
        clothing_expenses: suggested_clothing_expenses,
        unpaid_clothing_expenses_days: to_pay_days
      }
    end

    def suggested_unpaid_company_holiday_days
      company_holiday_days = day_calculator.calculate_company_holiday_days
      return 0 if company_holiday_days.zero?

      remaining_paid_vacation_days = @expense_sheet.service.remaining_paid_vacation_days
      extra_company_holiday_days = company_holiday_days - remaining_paid_vacation_days

      [0, extra_company_holiday_days].max
    end

    def suggested_paid_company_holiday_days
      company_holiday_days = day_calculator.calculate_company_holiday_days
      return 0 if company_holiday_days.zero?

      [company_holiday_days, @expense_sheet.service.remaining_paid_vacation_days].min
    end

    def suggested_clothing_expenses
      per_twenty_six_days = @expense_sheet.service.service_specification.work_clothing_expenses
      return 0 if per_twenty_six_days.zero?

      return 0 if to_pay_days < 26

      max_possible_value = (to_pay_days / 26).to_i * per_twenty_six_days

      difference_to_max = WORK_CLOTHING_MAX_PER_SERVICE - already_paid_clothing_expenses
      value = [max_possible_value, difference_to_max].min

      [0, value].max
    end

    private

    def to_pay_days
      @to_pay_days ||= calculate_to_pay_days
    end

    def calculate_to_pay_days
      per_twenty_six_days = @expense_sheet.service.service_specification.work_clothing_expenses
      already_paid_days = already_paid_clothing_expenses / per_twenty_six_days
      already_happened_work_days - already_paid_days + @expense_sheet.calculate_chargeable_days
    end

    def already_paid_clothing_expenses
      @already_paid_clothing_expenses ||= calculate_already_paid_clothing_expenses
    end

    def calculate_already_paid_clothing_expenses
      sheets = @expense_sheet.service.expense_sheets.before_date(@expense_sheet.beginning)

      sheets.sum(&:clothing_expenses)
    end

    def already_happened_work_days
      sheets = @expense_sheet.service.expense_sheets.before_date(@expense_sheet.beginning)

      sheets.sum(&:calculate_chargeable_days)
    end

    def day_calculator
      @day_calculator ||= DayCalculator.new(@expense_sheet.beginning, @expense_sheet.ending)
    end
  end
end
