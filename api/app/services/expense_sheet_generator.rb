class ExpenseSheetGenerator
  def initialize(service)
    @service = service
  end

  def create_expense_sheets
    beginning = @service.beginning
    ending = beginning.end_of_month

    while ending < @service.ending do
      ExpenseSheet.create(
                    user: @service.user,
                    beginning: beginning,
                    ending: ending,
                    work_days: day_calculator(beginning, ending).calculate_work_days,
                    workfree_days: day_calculator(beginning, ending).calculate_workfree_days,
                    bank_account_number: '4470 (200)'
      )

      beginning = (beginning + 1.month).beginning_of_month
      ending = beginning.end_of_month
    end

    ExpenseSheet.create(
                  user: @service.user,
                  beginning: beginning,
                  ending: @service.ending,
                  work_days: day_calculator(beginning, ending).calculate_work_days,
                  workfree_days: day_calculator(beginning, ending).calculate_workfree_days,
                  bank_account_number: '4470 (200)'
    )
  end

  private

  def day_calculator(beginning, ending)
    DayCalculator.new(beginning, ending)
  end
end
