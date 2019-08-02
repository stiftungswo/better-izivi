# frozen_string_literal: true

FactoryBot.define do
  factory :payment, class: 'Payment' do
    state { :payment_in_progress }
    payment_timestamp { Time.zone.now }
    expense_sheets do
      (1..10).map do
        expense_sheet = build :expense_sheet, state: state, payment_timestamp: payment_timestamp
        expense_sheet.save(validate: false)
        expense_sheet
      end
    end
    initialize_with { Payment.new(expense_sheets) }
  end

  trait :paid do
    state { :paid }
  end
end
