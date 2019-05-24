class NormalServiceCalculator
  def initialize(beginning_date)
    @beginning_date = beginning_date
  end

  def calculate_ending_date(required_service_days)
    raise I18n.t('service_calculator.invalid_required_service_days') unless required_service_days.positive?

    return calculate_linear_ending_date(required_service_days) if required_service_days >= LINEAR_CALCULATION_THRESHOLD

    ShortServiceCalculator.calculate_irregular_ending_date(required_service_days)
  end

  def calculate_chargeable_service_days(ending_date)
    raise I18n.t('service_calculator.end_date_cannot_be_on_weekend') if ending_date.on_weekend?

    duration = (ending_date - @beginning_date).to_i + 1
    return duration if duration >= LINEAR_CALCULATION_THRESHOLD

    reverse_duration_lookup(duration)
  end
end
