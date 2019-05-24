# frozen_string_literal: true

class Holiday < ApplicationRecord
  include Concerns::PositiveTimeSpanValidatable
  validates :beginning, :ending, timeliness: { type: :date }
  validates :beginning, :ending, :description, :holiday_type, presence: true

  enum holiday_type: {
    company_holiday: 1,
    public_holiday: 2
  }

  def work_days(public_holidays)
    return nil unless company_holiday?
    all = []
    (beginning..ending).each do |day|
      if day.on_weekend?
        next
      end

      on_public_holiday = false
      public_holidays.each do |public_holiday|
        (public_holiday.beginning..public_holiday.ending).map do |public_day|
          if day == public_day
            on_public_holiday = true
          end
        end
      end
      if on_public_holiday
        next
      end

      all.push day
    end
    all
  end
end
