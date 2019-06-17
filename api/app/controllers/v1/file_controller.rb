# frozen_string_literal: true

module V1
  class FileController < ApplicationController
    include V1::Concerns::ParamsAuthenticatable

    before_action :authenticate_from_params!

    protected

    def render_pdf(template, pdf_locals, orientation, filename)
      pdf_html = ActionController::Base.new.render_to_string(template: template, layout: 'pdf', locals: pdf_locals)
      pdf = WickedPdf.new.pdf_from_string(pdf_html, orientation: orientation)
      response.set_header('Content-Disposition', "inline; filename=#{filename}")
      render plain: pdf
    end
  end
end
