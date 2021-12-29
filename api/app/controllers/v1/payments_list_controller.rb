# frozen_string_literal: true

module V1
  class PaymentsListController < FileController
    include V1::Concerns::AdminAuthorizable

    before_action :authorize_admin!

    def show
      respond_to do |format|
        format.pdf do
          send_pdf
        end
      end
    end

    private

    def send_pdf
      if params[:payment] == 'pending'
        expense_sheets = ExpenseSheet.ready_for_payment
        date = Time.zone.today
      else
        expense_sheets = Payment.find(payment_timestamp_param).expense_sheets
        date = payment_timestamp_param.to_date
      end

      pdf = Pdfs::PaymentsListService.new(expense_sheets, params[:payment] == 'pending', date)

      send_data pdf.render,
                filename: "#{I18n.t('pdfs.payments.filename', today: I18n.l(Time.zone.today))}.pdf",
                type: 'application/pdf',
                disposition: 'inline'
    end

    def payment_timestamp_param
      Time.zone.at(params[:payment].to_i)
    end
  end
end
