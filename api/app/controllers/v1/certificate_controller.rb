# frozen_string_literal: true

module V1
  class CertificateController < ApplicationController
    include V1::Concerns::AdminAuthorizable
    include V1::Concerns::ParamsAuthenticatable

    before_action :authenticate_user!, unless: -> { request.format.docx? }
    before_action :authenticate_from_params!, only: :show, if: -> { request.format.docx? }
    before_action :set_service, only: %i[show]
    before_action :authorize_admin!

    @generate_certificate = nil

    def show
      respond_to_json_and_docx(@service)
    end

    def respond_to_json_and_docx(*args)
      respond_to do |format|
        @generate_certificate = Docx::Certificate::GenerateCertificate.new(*args)
        format.json
        format.docx do
          send_data @generate_certificate.render,
                    filename: fetch_filename.to_s,
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    disposition: 'inline'
        end
      end
    end

    def fetch_filename
      base_filename = "_#{@service.user.first_name}_#{@service.user.last_name}"
      if @generate_certificate.service_is_longer_than_90_days
        "Arbeitszeugnis#{base_filename}"
      else
        "Arbeitsbestätigung#{base_filename}"
      end
    end

    def set_service
      @service = Service.find(params[:id])
    end
  end
end
