# frozen_string_literal: true

module V1
  module Concerns
    module JsonAndPdfRespondable
      def respond_to_json_and_pdf(pdf, filename, *)
        respond_to do |format|
          format.json
          format.pdf do
            send_data pdf.new(*).render,
                      filename: "#{filename}.pdf",
                      type: 'application/pdf',
                      disposition: 'inline'
          end
        end
      end
    end
  end
end
