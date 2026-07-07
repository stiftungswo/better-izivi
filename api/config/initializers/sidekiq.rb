# frozen_string_literal: true

if defined? Sidekiq
  require 'sidekiq/web'

  Sidekiq::Web.use(Rack::Auth::Basic) do |user, password|
    [user, password] == [ENV.fetch('SIDEKIQ_USER', nil), ENV.fetch('SIDEKIQ_PASSWORD', nil)]
  end

  # Recurring jobs (config/schedule.yml) — only the worker process needs to
  # load these into Sidekiq-Cron's Redis-backed schedule, not the web dyno.
  if Sidekiq.server?
    schedule_file = Rails.root.join('config/schedule.yml')
    Sidekiq::Cron::Job.load_from_hash(YAML.load_file(schedule_file)) if File.exist?(schedule_file)
  end
end
