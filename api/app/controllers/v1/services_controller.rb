# frozen_string_literal: true

module V1
  class ServicesController < APIController
    PERMITTED_SERVICE_PARAMS = %i[
      user_id service_specification_id
      beginning ending confirmation_date
      eligible_personal_vacation_days service_type
      first_swo_service long_service probation_service
      feedback_mail_sent
    ].freeze

    before_action :set_service, only: %i[show update destroy]

    def index
      @services = Service.all
    end

    def show; end

    def create
      @service = Service.new(service_params)

      raise ValidationError, @holiday.errors unless @holiday.save

      render :show
    end

    def update
      if @service.update(service_params)
        render :show, status: :ok, location: @service
      else
        render json: @service.errors, status: :unprocessable_entity
      end
    end

    def destroy
      @service.destroy
    end

    private

    def set_service
      @service = Service.find(params[:id])
    end

    def service_params
      params.require(:service).permit(*PERMITTED_SERVICE_PARAMS)
    end
  end
end
