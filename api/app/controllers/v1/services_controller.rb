# frozen_string_literal: true

module V1
  class ServicesController < APIController
    before_action :set_service, only: %i[show update destroy]

    def index
      @services = Service.all
    end

    def show; end

    def create
      @service = Service.new(service_params)

      if @service.save
        render :show, status: :created, location: @service
      else
        render json: @service.errors, status: :unprocessable_entity
      end
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
      params.fetch(:service, {})
    end
  end
end
