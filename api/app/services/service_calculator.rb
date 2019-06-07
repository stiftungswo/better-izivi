class ServiceCalculator
  include Concerns::CompanyHolidayCalculationHelper

  LINEAR_CALCULATION_THRESHOLD = 26

  def initialize(beginning_date)
    @beginning_date = beginning_date
  end

  # TODO: Implement routing to normal_service and short_service
  def calculate_ending_date(required_service_days)
    if required_service_days < LINEAR_CALCULATION_THRESHOLD
      short_service_calculator.calculate_ending_date required_service_days
    else
      normal_service_calculator.calculate_ending_date required_service_days
    end
  end

  def calculate_chargeable_service_days(ending_date)
    # unpaid_days = calculate_company_holiday_days_during_service(@beginning_date, ending_date)
    # temp_service_days = (ending_date - @beginning_date).to_i + 1 - unpaid_days
    #
    # if temp_service_days < LINEAR_CALCULATION_THRESHOLD

    duration = (ending_date - @beginning_date).to_i + 1

    if duration < LINEAR_CALCULATION_THRESHOLD
      short_service_calculator.calculate_chargeable_service_days ending_date
    else
      normal_service_calculator.calculate_chargeable_service_days ending_date
    end
  end

  def calculate_eligible_personal_vacation_days(service_days)
    return 0 if service_days < 180
    normal_service_calculator.calculate_eligible_personal_vacation_days service_days
  end

  private

  def short_service_calculator
    @short_service_calculator ||= ShortServiceCalculator.new @beginning_date
  end

  def normal_service_calculator
    @normal_service_calculator ||= NormalServiceCalculator.new @beginning_date
  end
end


