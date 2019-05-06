# frozen_string_literal: true

class ApplicationController < ActionController::API
  include ActionController::MimeResponds
  include Concerns::ErrorHandler

  before_action :configure_permitted_parameters, if: :devise_controller?

  respond_to :json

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: permitted_user_keys)
  end

  private

  def permitted_user_keys
    %i[
      regional_center_id first_name last_name
      address bank_iban birthday city
      health_insurance zip hometown phone zdp
    ]
  end
end
