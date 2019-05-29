# frozen_string_literal: true

module V1
  class PaymentsController < ApplicationController
    def export
      expense_sheets = ExpenseSheet.where(id: payments_params[:ids]).includes(:user)
      render plain: generate_pain(expense_sheets).to_xml('pain.001.001.03.ch.02')
    end

    private

    def generate_pain(sheets)
      sct = setup_sct

      sheets.each do |sheet|
        sct.add_transaction(
          name: sheet.user.full_name,
          iban: sheet.user.bank_iban,
          amount: sheet.full_amount,
          currency: 'CHF',
          remittance_information: I18n.t('payment.expenses_from', from_date: I18n.l(sheet.beginning, format: '%B %Y')),
          requested_date: Time.zone.today,
          batch_booking: true,

          creditor_address: SEPA::CreditorAddress.new(
            country_code: 'CH',
            street_name: 'Mustergasse 123a',
            post_code: '1234',
            town_name: 'Musterstadt'
          )
        )
      end

      sct
    end

    # "Spesen #{I18n.l(Time.now, format: '%B')}"

    def setup_sct
      SEPA::CreditTransfer.new(
        name: 'Lou GmbH',
        bic: 'POFICHBEXXX',
        iban: 'CH2409000000800040679'
      )
    end

    def payments_params
      params.require(:payment).permit(ids: [])
    end
  end
end
