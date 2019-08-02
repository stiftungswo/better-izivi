# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Payment, type: :model do
  describe 'validation' do
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

  describe '#initialize' do
    let(:payment) { Payment.new }
    let(:beginning) { Date.parse('2018-01-01') }
    let(:ending) { Date.parse('2018-06-29') }
    let!(:service) { create :service, :long, beginning: beginning, ending: ending }
    let!(:expense_sheets) do
      ExpenseSheetGenerator.new(service).create_expense_sheets
      ExpenseSheet.all
    end

    context 'with ready expense sheets' do
      before { expense_sheets.update_all state: :ready_for_payment }

      it 'creates a new payment', :aggregate_failures do
        expect(payment.payment_timestamp).not_to eq nil
        expect(payment.state).to eq :payment_in_progress
      end

      it 'doesnt update expense sheets' do
        expect(expense_sheets.each(&:reload).all?(&:ready_for_payment?)).to eq true
      end
    end

    context 'without any ready expense sheets' do
      it 'creates a new payment without any expense sheets', :aggregate_failures do
        expect(payment.payment_timestamp).not_to eq nil
        expect(payment.state).to eq :payment_in_progress
        expect(payment.expense_sheets).to eq []
      end

      it 'doesnt update expense sheets' do
        expect(expense_sheets.each(&:reload).all?(&:open?)).to eq true
      end
    end
  end

  describe '#save' do
    let(:payment) { Payment.new }
    let(:beginning) { Date.parse('2018-01-01') }
    let(:ending) { Date.parse('2018-06-29') }
    let!(:service) { create :service, :long, beginning: beginning, ending: ending }
    let!(:expense_sheets) do
      ExpenseSheetGenerator.new(service).create_expense_sheets
      ExpenseSheet.all.update_all state: :ready_for_payment
      ExpenseSheet.all
    end

    before do
      payment.save
      expense_sheets.each(&:reload)
    end

    it 'updates expense sheets', :aggregate_failures do
      expect(expense_sheets.all?(&:payment_in_progress?)).to eq true
      expect(expense_sheets.pluck(:payment_timestamp).uniq.map(&:to_i)).to eq [payment.payment_timestamp.to_i]
    end
  end
end
