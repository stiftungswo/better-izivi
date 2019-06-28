# frozen_string_literal: true

class ExpenseSheetCalculatorService
  def initialize(expense_sheet)
    @expense_sheet = expense_sheet
    @service = expense_sheet.service
    @specification = expense_sheet.service.service_specification
  end

  def calculate_first_day(count)
    first_day_spec = @specification.first_day_expenses

    expenses = {
      pocket_money: @specification.pocket_money,
      accommodation: @specification.accommodation_expenses,
      breakfast: first_day_spec['breakfast'],
      lunch: first_day_spec['lunch'],
      dinner: first_day_spec['dinner']
    }

    expenses.merge(total: count * expenses.values.sum)
  end

  def calculate_work_days(count)
    work_days_spec = @specification.work_days_expenses

    expenses = {
      pocket_money: @specification.pocket_money,
      accommodation: @specification.accommodation_expenses,
      breakfast: work_days_spec['breakfast'],
      lunch: work_days_spec['lunch'],
      dinner: work_days_spec['dinner']
    }

    expenses.merge(total: count * expenses.values.sum)
  end

  def calculate_last_day(count)
    last_day_spec = @specification.last_day_expenses

    expenses = {
      pocket_money: @specification.pocket_money,
      accommodation: @specification.accommodation_expenses,
      breakfast: last_day_spec['breakfast'],
      lunch: last_day_spec['lunch'],
      dinner: last_day_spec['dinner']
    }

    expenses.merge(total: count * expenses.values.sum)
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

  # private
end
