# frozen_string_literal: true

FactoryBot.define do
  factory :site do
    name { 'Zürich' }
    language { 'german' }
    terms_pdf do
      Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/sample_terms.pdf'), 'application/pdf')
    end

    trait :french do
      name { 'Wallis' }
      language { 'french' }
    end
  end
end
