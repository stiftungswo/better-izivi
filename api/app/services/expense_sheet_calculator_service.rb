# frozen_string_literal: true

class ExpenseSheetCalculatorService
  def initialize(expense_sheet)
    @expense_sheet = expense_sheet
    @service = expense_sheet.service
    @specification = expense_sheet.service.service_specification
  end

  def calculate_first_day(count)
    calculate_values(count, @specification.first_day_expenses)
  end

  def calculate_work_days(count)
    calculate_values(count, @specification.work_days_expenses)
  end

  def calculate_last_day(count)
    calculate_values(count, @specification.last_day_expenses)
  end

  def calculate_workfree_days(count)
    calculate_work_days(count)
  end

  def calculate_sick_days(count)
    calculate_work_days(count)
  end

  def calculate_paid_vacation_days(count)
    calculate_work_days(count)
  end

  def calculate_unpaid_vacation_days(_count)
    {
      pocket_money: 0,
      accommodation: 0,
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      total: 0
    }
  end

  private

  def calculate_values(count, day_spec)
    expenses = {
      pocket_money: @specification.pocket_money,
      accommodation: @specification.accommodation_expenses,
      breakfast: day_spec['breakfast'],
      lunch: day_spec['lunch'],
      dinner: day_spec['dinner']
    }

    expenses.merge(total: count * expenses.values.sum)
  end
end
