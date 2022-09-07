# frozen_string_literal: true

if Rails.env.production?
  require 'raven'

  Raven.configure do |config|
    config.environments = [ENV.fetch('SENTRY_ENVIRONMENT', 'production')]
    config.dsn = ENV.fetch('SENTRY_DSN', nil)
  end
end
