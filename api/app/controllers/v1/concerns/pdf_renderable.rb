# frozen_string_literal: true

module V1
  module Concerns
    module PdfRenderable
      def render_pdf(filename:, pdf:)
        response.set_header('Content-Disposition', "inline; filename=#{filename}")
        render plain: pdf
      end
    end
  end
end
