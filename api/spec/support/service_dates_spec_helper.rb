# frozen_string_literal: true

def get_service_range(months:, pre2025: false)
  beginning = Date.parse('2025-01-06') unless pre2025
  beginning = Date.parse('2018-01-01') if pre2025
  ending = beginning + 25.days + ((months - 1) * 28.days)
  beginning..ending
end
