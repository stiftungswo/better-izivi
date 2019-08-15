# frozen_string_literal: true

class ShortServiceCalculator
  DAYS_TO_WORKFREE_DAYS = {
    (0..6) => 0,
    (7..10) => 1,
    (11..13) => 2,
    (14..17) => 3,
    (18..20) => 4,
    (21..24) => 5,
    (25..25) => 6
  }.freeze

  def initialize(beginning_date)
    @beginning_date = beginning_date
  end

  def calculate_ending_date(required_service_days)
    raise I18n.t('service_calculator.invalid_required_service_days') unless required_service_days.positive?

    ending_date_from_loop(@beginning_date, required_service_days)
  end

  def calculate_chargeable_service_days(ending_date)
    duration = (ending_date - @beginning_date).to_i + 1

    max_service_days = duration - HolidayCalculator.new(@beginning_date, ending_date).calculate_company_holiday_days
    max_eligible_workfree_days = eligible_workfree_days(max_service_days)

    days_to_compensate = [0, workfree_days_in_range(ending_date) - max_eligible_workfree_days].max
    temp_service_days = max_service_days - days_to_compensate

    temp_service_days - (max_eligible_workfree_days - eligible_workfree_days(temp_service_days))
  end

  private

  def ending_date_from_loop(start_date, leftover_service_days)
    eligible_workfree_days = eligible_workfree_days(leftover_service_days)

    # Subtracting 1 day because the loop checks the following day
    check_date = start_date - 1.day

    until leftover_service_days.zero?
      check_date += 1.day
      case type_of_day(check_date)
      when :company_holiday_day
        next
      when :workfree_day
        next if eligible_workfree_days.zero?

        eligible_workfree_days -= 1
      end

      leftover_service_days -= 1
    end

    check_date
  end

  def type_of_day(day)
    return :company_holiday_day if company_holiday_day?(day)
    return :workfree_day if workfree_day?(day)

    :work_day
  end

  # def ending_date_from_loop(start_date, leftover_service_days)
  #   eligible_workfree_days = eligible_workfree_days(leftover_service_days)
  #
  #   # Subtracting 1 day because the loop checks the following day
  #   check_date = start_date - 1.day
  #
  #   until leftover_service_days.zero?
  #     check_date += 1.day
  #     next if company_holiday_day?(check_date)
  #
  #     if workfree_day?(check_date)
  #       next if eligible_workfree_days.zero?
  #
  #       eligible_workfree_days -= 1
  #     end
  #     leftover_service_days -= 1
  #   end
  #
  #   check_date
  # end

  def workfree_days_in_range(ending_date)
    public_holiday_days = HolidayCalculator.new(@beginning_date, ending_date).calculate_public_holiday_days
    weekend_days = (@beginning_date..ending_date).count(&:on_weekend?)

    public_holiday_days + weekend_days
  end

  def company_holiday_day?(day)
    HolidayCalculator.new(day, day).calculate_company_holiday_days.positive?
  end

  def workfree_day?(day)
    [
      HolidayCalculator.new(day, day).calculate_public_holiday_days.positive?,
      day.on_weekend?
    ].any?
  end

  def eligible_workfree_days(service_days)
    DAYS_TO_WORKFREE_DAYS.each do |days, workfree_days|
      return workfree_days if days.include? service_days
    end
  end
end
