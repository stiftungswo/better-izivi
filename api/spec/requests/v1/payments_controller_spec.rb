# frozen_string_literal: true

require 'rails_helper'

RSpec.describe V1::PaymentsController, type: :request do
  describe '#generate_transaction' do
    subject(:transaction_adder) { instance_double(SEPA::CreditTransfer, add_transaction: true) }

    let(:payments_controller) { V1::PaymentsController.new }
    let(:expense_sheet) { create :expense_sheet, :ready_for_payment }
    let(:user) { expense_sheet.user }

    before do
      allow(SEPA::CreditTransfer).to receive(:new).and_return transaction_adder

      payments_controller.send(:generate_pain, [expense_sheet])
    end

    context 'when there is one expense sheet' do
      let(:expected_fields) do
        {
          amount: expense_sheet.full_amount,
          batch_booking: true,
          currency: 'CHF',
          iban: user.bank_iban,
          name: user.full_name,
          remittance_information: I18n.t('payment.expenses_from', from_date: I18n.l(expense_sheet.beginning, format: '%B %Y')),
          requested_date: Time.zone.today
        }
      end

      it 'generates transaction' do
        expect(transaction_adder).to have_received(:add_transaction)
          .with(hash_including(expected_fields))
      end
    end
  end

  describe '#index' do
    subject { response }

    let(:expense_sheet) { create :expense_sheet, :ready_for_payment }

    before do
      expense_sheet

      get v1_pain_export_path
    end

    it { is_expected.to be_successful }
  end
end
