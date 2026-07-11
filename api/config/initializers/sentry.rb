# frozen_string_literal: true

if Rails.env.production?
  Sentry.init do |config|
    config.environment = ENV.fetch('SENTRY_ENVIRONMENT', 'production')
    config.dsn = ENV.fetch('SENTRY_DSN', nil)
  end
end
