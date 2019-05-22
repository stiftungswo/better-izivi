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
    before_action :protect_foreign_resource, except: :create, unless: -> { current_user.admin? }

    def index
      @services = Service.all
    end

    def show
      protect_foreign_resource
    end

    def create
      @service = Service.new(service_params)

      raise ValidationError, @service.errors unless @service.save

      # TODO: Return :created in every #create
      render :show, status: :created
    end

    def update
      raise ValidationError, @service.errors unless @service.update(service_params)

      render :show
    end

    def destroy
      # TODO: Raise UnprocessableEntity error if failed
      @service.destroy
    end

    private

    def protect_foreign_resource
      raise AuthorizationError unless @service.user_id == current_user.id
    end

    def set_service
      @service = Service.find(params[:id])
    end

    def service_params
      permitted_params = params.require(:service).permit(*PERMITTED_SERVICE_PARAMS).to_h
      permitted_params[:user_id] = current_user.id unless current_user.admin?

      permitted_params
    end
  end
end
