# frozen_string_literal: true

class Service < ApplicationRecord
  FRIDAY_WEEKDAY = Date::DAYNAMES.index('Friday').freeze
  MONDAY_WEEKDAY = Date::DAYNAMES.index('Monday').freeze
  LONG_MISSION_BASE_DURATION = 180
  BASE_HOLIDAY_DAYS = 8
  ADDITIONAL_HOLIDAY_DAYS_PER_MONTH = 2
  DAYS_PER_MONTH = 30

  include Concerns::PositiveTimeSpanValidatable

  belongs_to :user
  belongs_to :service_specification

  enum service_type: {
    normal: 0,
    first: 1,
    last: 2
  }, _suffix: 'civil_service'

  validates :ending, :beginning, :user,
            :service_specification, :service_type,
            presence: true

  validate :ending_is_friday, unless: :last_civil_service?
  validate :beginning_is_monday

  def duration
    temp_duration = (ending - beginning).to_i + 1
    unpaid_days = [0, calculate_company_holiday_days_during_service - eligible_personal_vacation_days].max
    temp_duration - unpaid_days
  end

  def eligible_personal_vacation_days
    long_service? ? calculate_eligible_personal_vacation_days : 0
  end

  def conventional_service?
    !probation_service? && !long_service?
  end

  private

  def beginning_is_monday
    errors.add(:beginning, :not_a_monday) unless beginning.present? && beginning.wday == MONDAY_WEEKDAY
  end

  def ending_is_friday
    errors.add(:ending, :not_a_friday) unless ending.present? && ending.wday == FRIDAY_WEEKDAY
  end

  def calculate_eligible_personal_vacation_days
    additional_days = (ending - beginning).to_i + 1 - LONG_MISSION_BASE_DURATION
    additional_holiday_days = ([0, additional_days].max / DAYS_PER_MONTH.to_f).floor * ADDITIONAL_HOLIDAY_DAYS_PER_MONTH
    personal_vacation_days = BASE_HOLIDAY_DAYS + additional_holiday_days

    temp_duration = (ending - beginning).to_i + 1
    unpaid_days = [0, calculate_company_holiday_days_during_service - personal_vacation_days].max
    custom_duration = temp_duration - unpaid_days

    additional_days = custom_duration - LONG_MISSION_BASE_DURATION
    additional_holiday_days = (additional_days / DAYS_PER_MONTH.to_f).floor * ADDITIONAL_HOLIDAY_DAYS_PER_MONTH
    BASE_HOLIDAY_DAYS + additional_holiday_days
  end

  def calculate_company_holiday_days_during_service
    all_holidays = Holiday
                         .where(beginning: beginning..ending)
                         .or(Holiday.where(ending: beginning..ending))

    public_holidays = all_holidays.select(&:public_holiday?)
    company_holidays = all_holidays.select(&:company_holiday?)

    subtracted_days = []

    company_holidays.each do |company_holiday|
      holiday_work_days = company_holiday.work_days public_holidays
      subtracted_days.push *holiday_work_days
    end

    subtracted_days.uniq.length
  end
end
