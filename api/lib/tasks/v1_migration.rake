# frozen_string_literal: true

namespace :v1_migration do
  desc 'Strips all whitespaces from the IBAN'
  task strip_iban: :environment do
    User.all.each do |user|
      user.update bank_iban: user.bank_iban.gsub(/\s+/, '')
    end
  end
end
