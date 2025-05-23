# frozen_string_literal: true

class ExpenseSheetGenerator
  def initialize(service)
    @service = service
  end

  def create_expense_sheets(beginning: @service.beginning, ending: @service.ending)
    grouped_days = group_days_by_month(beginning..ending)

    grouped_days.map do |month_days|
      beginning = month_days.first
      ending = month_days.last
      create_expense_sheet(beginning, ending)
    end
  end

  def create_missing_expense_sheets
    existing_expense_sheets = @service.expense_sheets.sort_by do |expense_sheet|
      [expense_sheet.beginning, expense_sheet.ending]
    end
    return create_expense_sheets if existing_expense_sheets.count.zero?

    new_beginning = existing_expense_sheets.last.ending + 1.day

    create_expense_sheets beginning: new_beginning
  end

  def create_additional_expense_sheet
    service_ending = @service.ending
    create_expense_sheet(service_ending, service_ending)
  end

  private

  def group_days_by_month(days)
    days.slice_when { |date, _other_date| date == date.at_end_of_month }
  end

  def create_expense_sheet(beginning, ending)
    work_days, workfree_days = calculate_days(beginning, ending)

    ExpenseSheet.create(
      user: @service.user,
      ignore_first_day: false,
      ignore_last_day: false,
      beginning: beginning,
      ending: ending,
      work_days: work_days,
      workfree_days: workfree_days,
      bank_account_number: '4470 (200)' # TODO: Where to get bank_account_number from?
    )
  end

  def calculate_days(beginning, ending)
    day_calculator = DayCalculator.new(beginning, ending, @service)

    work_days = day_calculator.work_days
    workfree_days = day_calculator.workfree_days

    [work_days, workfree_days]
  end
end
