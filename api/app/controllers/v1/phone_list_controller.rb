# frozen_string_literal: true

module V1
  class PhoneListController < FileController
    include Concerns::AdminAuthorizable

    before_action :authorize_admin!

    def index
      @specifications = Service.in_date_range(sanitized_filters.beginning, sanitized_filters.ending)
                               .includes(:user, :service_specification)
                               .order('service_specification_id')
                               .group_by { |service| service.service_specification.name }

      respond_to do |format|
        format.pdf do
          render_pdf(
            'v1/phone_list/index',
            {
              phone_list: sanitized_filters, specifications: @specifications
            },
            'Landscape',
            I18n.t('pdfs.phone_list.filename', today: I18n.l(Time.zone.today))
          )
        end
      end
    end

    private

    def filter_params
      params.require(:phone_list).permit(:beginning, :ending).tap do |phone_list_params|
        phone_list_params.require(:beginning)
        phone_list_params.require(:ending)
      end
    end

    def sanitized_filters
      @sanitized_filters ||= OpenStruct.new(
        beginning: Date.parse(filter_params[:beginning]),
        ending: Date.parse(filter_params[:ending])
      )
    end
  end
end
