# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Payment, type: :model do
  context 'with an invalid state' do
    let(:payment) { build :payment, :paid }

    before do
      payment.state = :payment_in_progress
      payment.send(:update_expense_sheets)
    end

    it 'validates that all expense sheets are invalid' do
      expect(payment.valid?).to eq false
    end

    it 'adds all validation errors to errors' do
      expect(payment.tap(&:validate).errors.messages).to include(
        state: be_an_instance_of(Array)
      )
    end
  end

  context 'with a valid state' do
    let(:payment) { build :payment }

    before do
      payment.state = :paid
      payment.send(:update_expense_sheets)
    end

    it 'validates that all expense sheets are valid' do
      expect(payment.valid?).to eq true
    end

    it 'doesnt add anything to errors' do
      expect(payment.tap(&:validate).errors.size).to eq 0
    end
  end
end
