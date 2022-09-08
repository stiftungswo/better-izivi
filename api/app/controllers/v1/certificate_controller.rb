# frozen_string_literal: true

module V1
  class CertificateController < ApplicationController
    include V1::Concerns::AdminAuthorizable
    include V1::Concerns::ParamsAuthenticatable

    before_action :authenticate_user!, unless: -> { request.format.docx? }
    before_action :authenticate_from_params!, only: :show, if: -> { request.format.docx? }
    before_action :set_service, only: %i[show]
    before_action :authorize_admin!

    def show
      respond_to_json_and_docx(
        Docx::Certificate::GenerateCertificate,
        "#{@service.user.full_name}.docx",
        @service
      )
    end

    def respond_to_json_and_docx(docx, filename, *args)
      respond_to do |format|
        format.json
        format.docx do
          send_data docx.new(*args).render,
                    filename: filename.to_s,
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    disposition: 'inline'
        end
      end
    end

    def set_service
      @service = Service.find(params[:id])
    end
  end
end
