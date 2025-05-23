# frozen_string_literal: true

class DayCalculator
  delegate :calculate_public_holiday_days,
           :calculate_company_holiday_days,
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

  def calculate_workfree_days
    workfree_days = (@beginning..@ending).count(&:on_weekend?)
    wanted_workfree_days = workfree_days + holiday_calculator.calculate_public_holiday_days

    [available_workfree_days, wanted_workfree_days].min
  end

  def calculate_work_days
    total = (@beginning..@ending).count
    available_total = [total, @service.service_days].min
    unpaid_days = holiday_calculator.calculate_company_holiday_days
    available_total - workfree_days - unpaid_days
  end

  private

  def available_workfree_days
    return Float::INFINITY unless @service.short_service?

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
