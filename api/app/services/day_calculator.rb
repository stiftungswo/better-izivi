class DayCalculator
  delegate :calculate_public_holiday_days,
           :calculate_company_holiday_days,
           to: :holiday_calculator

  def initialize(beginning, ending)
    @beginning = beginning
    @ending = ending
  end
  
  # TODO: Add specs
  def calculate_workfree_days
    workfree_days = (@beginning..@ending).select(&:on_weekend?).length
    workfree_days + holiday_calculator.calculate_public_holiday_days
  end

  # TODO: Add specs
  def calculate_work_days
    total = (@beginning..@ending).count
    unpaid_days = holiday_calculator.calculate_company_holiday_days
    total - calculate_workfree_days - unpaid_days
  end

  private

  def holiday_calculator
    @holiday_calculator ||= HolidayCalculator.new(@beginning, @ending)
  end
end
