# frozen_string_literal: true

class ExpenseSheetGenerator
  def initialize(service)
    @service = service
  end

  def create_expense_sheets
    beginning = @service.beginning
    ending = beginning.end_of_month

    while ending < @service.ending
      create_expense_sheet(beginning, ending)
      beginning = (beginning + 1.month).beginning_of_month
      ending = beginning.end_of_month
    end

    create_expense_sheet(beginning, @service.ending)
  end

  private

  def create_expense_sheet(beginning, ending)
    ExpenseSheet.create(
      user: @service.user,
      beginning: beginning,
      ending: ending,
      work_days: DayCalculator.new(beginning, ending).calculate_work_days,
      workfree_days: DayCalculator.new(beginning, ending).calculate_workfree_days,
      # TODO: Where to get bank_account_number from?
      bank_account_number: '4470 (200)'
    )
  end
end
