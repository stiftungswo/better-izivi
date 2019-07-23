# frozen_string_literal: true

class ApplicationController < ActionController::API
  include ActionController::MimeResponds
  include Concerns::ErrorHandler
  include Concerns::DeviseUserParamsRegistrable

  PERMITTED_LOCALES = %w[de en fr]
  
  before_action :set_locale

  respond_to :json

  private

  def set_locale
    locale = params[:locale]
    I18n.locale = locale.in?(PERMITTED_LOCALES) ? locale : I18n.default_locale
  end
end
