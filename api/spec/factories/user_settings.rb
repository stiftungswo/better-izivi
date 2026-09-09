# frozen_string_literal: true

FactoryBot.define do
  factory :user_setting do
    user
    key { 'notify_on_missing_survey' }
    value { 'true' }
  end
end
