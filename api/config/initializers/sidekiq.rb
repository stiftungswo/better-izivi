# frozen_string_literal: true

if defined? Sidekiq
  require 'sidekiq/web'

  Sidekiq::Web.use(Rack::Auth::Basic) do |user, password|
    [user, password] == [ENV.fetch('SIDEKIQ_USER', nil), ENV.fetch('SIDEKIQ_PASSWORD', nil)]
  end
end
