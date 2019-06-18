# frozen_string_literal: true

module V1
  class PaymentsController < FileController
    include V1::Concerns::AdminAuthorizable

    before_action :authorize_admin!

    def export
      respond_to do |format|
        format.xml do
          sheets = ExpenseSheet.includes(:user).ready_for_payment
          render plain: PainGenerationService.new(sheets).generate_pain.to_xml('pain.001.001.03.ch.02'), content_type: :xml
        end
      end
    end
  end
end
