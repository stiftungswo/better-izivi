# frozen_string_literal: true

module V1
  class PaymentsController < ApplicationController
    def export
      expense_sheets = ExpenseSheet.includes(:user).ready_for_payment
      render plain: generate_pain(expense_sheets).to_xml('pain.001.001.03.ch.02')
    end

    private

    def generate_pain(sheets)
      sepa_credit_transfer = setup_sct

      sheets.each do |sheet|
        sepa_credit_transfer.add_transaction(build_transaction(sheet))
      end

      sepa_credit_transfer
    end

    def build_transaction(sheet)
      {
        name: sheet.user.full_name,
        iban: sheet.user.bank_iban,
        amount: sheet.full_amount,
        currency: 'CHF',
        remittance_information: I18n.t('payment.expenses_from', from_date: I18n.l(sheet.beginning, format: '%B %Y')),
        requested_date: Time.zone.today,
        batch_booking: true,

        creditor_address: build_creditor_address(sheet.user)
      }
    end

    # "Spesen #{I18n.l(Time.now, format: '%B')}"

    def build_creditor_address(user)
      SEPA::CreditorAddress.new(
        country_code: 'CH',
        street_name: user.address,
        post_code: user.zip,
        town_name: user.city
      )
    end

    def setup_sct
      SEPA::CreditTransfer.new(
        name: 'Lou GmbH',
        bic: 'POFICHBEXXX',
        iban: 'CH2409000000800040679'
      )
    end
  end
end
