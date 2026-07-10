# frozen_string_literal: true

require_relative 'boot'

require 'rails'
# Pick the frameworks you want:
require 'active_model/railtie'
require 'active_job/railtie'
require 'active_record/railtie'
require 'active_storage/engine'
require 'action_controller/railtie'
require 'action_mailer/railtie'
# require "action_mailbox/engine"
# require "action_text/engine"
require 'action_view/railtie'
require 'action_cable/engine'
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Api
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.2

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true

    config.relative_url_root = ENV.fetch('RAILS_RELATIVE_URL_ROOT', nil)

    if config.relative_url_root.present?
      config.middleware.use Rack::Config do |env|
        env['SCRIPT_NAME'] = config.relative_url_root
      end
    end

    config.action_mailer.default_url_options = {
      host: ENV.fetch('APP_HOST', 'localhost'),
      port: ENV.fetch('APP_PORT', 3000)
    }

    config.i18n.default_locale = :de
    config.i18n.available_locales = %i[fr de en]
    config.i18n.fallbacks = %i[de en]
    config.time_zone = 'Bern'

    Prawn::Font::AFM.hide_m17n_warning = true
  end
end
