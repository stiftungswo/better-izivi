# frozen_string_literal: true

class ApplicationController < ActionController::API
  include ActionController::MimeResponds
  include Concerns::ErrorHandler
  include Concerns::PermittedDeviseUserRegistrationKeys

  respond_to :json
end
