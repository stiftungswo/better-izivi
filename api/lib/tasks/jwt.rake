# frozen_string_literal: true

namespace :jwt do
  desc 'Deletes all permitted JWT tokens'
  task invalidate_all: :environment do
    AllowlistedJwt.all.each(&:destroy)
  end
end
