# frozen_string_literal: true

module V1
  class PhoneListController < ApplicationController
    before_action :validate_token

    def index
      @specifications = Service.in_date_range(sanitized_filters.beginning, sanitized_filters.ending)
                               .includes(:user, :service_specification)
                               .order('service_specification_id')
                               .group_by { |service| service.service_specification.name }

      respond_to do |format|
        format.pdf do
          pdf_html = ActionController::Base.new.render_to_string(template: 'v1/phone_list/index', layout: 'pdf', locals: { phone_list: sanitized_filters, specifications: @specifications })
          pdf = WickedPdf.new.pdf_from_string(pdf_html, orientation: 'Landscape')
          response.set_header('Content-Disposition', "inline; filename=Telefonliste_#{I18n.l(Time.zone.today)}.pdf")
          render plain: pdf
        end
      end
    end

    private

    # TODO: Validate sent token
    def validate_token
      token = token_param
    end

    def filter_params
      params.require(:phone_list).permit(:beginning, :ending).tap do |phone_list_params|
        phone_list_params.require(:beginning)
        phone_list_params.require(:ending)
      end
    end

    def token_param
      params.require(:token)
    end

    def sanitized_filters
      @sanitized_filters ||= OpenStruct.new(
        beginning: Date.parse(filter_params[:beginning]),
        ending: Date.parse(filter_params[:ending])
      )
    end
  end
end
