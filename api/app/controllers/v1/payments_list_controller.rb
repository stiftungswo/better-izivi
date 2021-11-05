# frozen_string_literal: true

module V1
  class PaymentsListController < FileController
    # include V1::Concerns::AdminAuthorizable

    # before_action :authorize_admin!
    # before_action :load_specifications, only: :show

    def show
      respond_to do |format|
        format.pdf do
          send_pdf
        end
      end
    end

    private

    def send_pdf
      pdf = Pdfs::PaymentsListService.new(ExpenseSheet.ready_for_payment)

      send_data pdf.render,
                filename: "#{I18n.t('pdfs.phone_list.filename', today: I18n.l(Time.zone.today))}.pdf",
                type: 'application/pdf',
                disposition: 'inline'
    end
  end
end
