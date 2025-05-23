# frozen_string_literal: true

class DayCalculator
  delegate :public_holiday_days,
           :company_holiday_days,
           to: :holiday_calculator

  def initialize(beginning, ending, service)
    @beginning = beginning
    @ending = ending
    @service = service
  end

  def workfree_days
    @workfree_days ||= calculate_workfree_days
  end

  def work_days
    @work_days ||= calculate_work_days
  end

  def unpaid_holiday_days
    @holiday_days ||= calculate_unpaid_holiday_days
  end

  private

  def calculate_workfree_days
    [available_workfree_days, wanted_workfree_days].min
  end

  def calculate_work_days
    total = (@beginning..@ending).count

    unpaid_days = holiday_calculator.company_holiday_days
    unpaid_days = unpaid_days + [wanted_workfree_days - workfree_days, 0].max

    total - workfree_days - unpaid_days
  end

  def calculate_unpaid_holiday_days
    holiday_calculator.company_holiday_days + [wanted_workfree_days - workfree_days, 0].max
  end

  def wanted_workfree_days
    workfree_days = (@beginning..@ending).count(&:on_weekend?)
    workfree_days + holiday_calculator.public_holiday_days
  end

  def available_workfree_days
    @service.eligible_paid_workfree_days - already_spent_workfree_days
  end

  def already_spent_workfree_days
    return 0 unless @service.short_service?

    sheets = @service.expense_sheets.before_date(@beginning)
    sheets.sum(&:workfree_days)
  end

  def holiday_calculator
    @holiday_calculator ||= HolidayCalculator.new(@beginning, @ending)
  end
end
