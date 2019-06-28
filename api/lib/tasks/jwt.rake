# frozen_string_literal: true

namespace :jwt do
  desc 'TODO'
  task invalidate_all: :environment do
    WhitelistedJwt.all.each(&:destroy)
  end
end
