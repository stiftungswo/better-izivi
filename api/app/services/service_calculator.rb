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
    unpaid_days = calculate_company_holiday_days_during_service(@beginning_date, ending_date)
    temp_duration = (ending_date - @beginning_date).to_i + 1 - unpaid_days

    if temp_duration < LINEAR_CALCULATION_THRESHOLD
      short_service_calculator.calculate_chargeable_service_days ending_date
    else
      normal_service_calculator.calculate_chargeable_service_days ending_date
    end

    # duration = (ending_date - @beginning_date).to_i + 1
    #
    # missed_days = 0
    #
    # loop do
    #   temp_duration = (ending_date - @beginning_date).to_i + 1
    #   new_ending_date = calculate_ending_date temp_duration
    #
    #   missed_days = missed_days + (new_ending_date - ending_date).to_i
    #
    #   break if ending_date == new_ending_date
    #   ending_date = ending_date + missed_days.days
    # end
    #
    # duration - missed_days
  end

  def calculate_eligible_personal_vacation_days(duration)
    return 0 if duration < 180
    normal_service_calculator.calculate_eligible_personal_vacation_days duration
  end

  private

  def short_service_calculator
    @short_service_calculator ||= ShortServiceCalculator.new @beginning_date
  end

  def normal_service_calculator
    @normal_service_calculator ||= NormalServiceCalculator.new @beginning_date
  end

  # def old_calculate_eligible_personal_vacation_days
  #   additional_days = (ending - beginning).to_i + 1 - LONG_MISSION_BASE_DURATION
  #   additional_holiday_days = ([0, additional_days].max / DAYS_PER_MONTH.to_f).floor * ADDITIONAL_HOLIDAY_DAYS_PER_MONTH
  #   personal_vacation_days = BASE_HOLIDAY_DAYS + additional_holiday_days
  #
  #   temp_duration = (ending - beginning).to_i + 1
  #   unpaid_days = [0, calculate_company_holiday_days_during_service - personal_vacation_days].max
  #   custom_duration = temp_duration - unpaid_days
  #
  #   additional_days = custom_duration - LONG_MISSION_BASE_DURATION
  #   additional_holiday_days = (additional_days / DAYS_PER_MONTH.to_f).floor * ADDITIONAL_HOLIDAY_DAYS_PER_MONTH
  #   BASE_HOLIDAY_DAYS + additional_holiday_days
  # end



end


