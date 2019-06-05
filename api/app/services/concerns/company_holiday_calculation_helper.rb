module Concerns
  module CompanyHolidayCalculationHelper
    def calculate_company_holiday_days_during_service(beginning_date, ending_date)
      all_holidays = Holiday
                       .where(beginning: beginning_date..ending_date)
                       .or(Holiday.where(ending: beginning_date..ending_date))

      public_holidays = all_holidays.select(&:public_holiday?)
      company_holidays = all_holidays.select(&:company_holiday?)

      subtracted_days = []

      company_holidays.each do |company_holiday|
        holiday_work_days = company_holiday.work_days public_holidays
        subtracted_days.push *holiday_work_days
      end

      subtracted_days = subtracted_days.select { |day| (beginning_date..ending_date).include? day }

      subtracted_days.uniq.length
    end
  end
end
