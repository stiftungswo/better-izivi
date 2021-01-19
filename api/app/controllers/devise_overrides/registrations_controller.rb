# frozen_string_literal: true

require 'net/http'
require 'openssl'
require 'json'
require 'uri'

module DeviseOverrides
  class RegistrationsController < Devise::RegistrationsController
    def create
      raise invalid_community_password_error unless valid_community_password?

      super
    end

    def validate
      validation_error = ValidationError.new User.validate_given_params(sign_up_params)

      should_display_community_error = community_password && !valid_community_password?
      validation_error.merge! invalid_community_password_error if should_display_community_error

      raise validation_error unless validation_error.empty?

      subscribe_to_newsletter
      head :no_content
    end

    private

    # :reek:UtilityFunction
    def invalid_community_password_error
      full_message = I18n.t('registrations.errors.community_password.not_valid.full')
      single_message = I18n.t('registrations.errors.community_password.not_valid.single')

      ValidationError.new({ community_password: single_message }, [full_message])
    end

    def valid_community_password?
      community_password == ENV['COMMUNITY_PASSWORD']
    end

    def community_password
      params.require(:user).permit(:community_password)[:community_password]
    end

    def subscribe_to_newsletter
      post_to_newsletter_api if params['user']['newsletter'] == true
    end

    def post_to_newsletter_api
      uri = URI('https://www.stiftungswo.ch/wp-json/newsletter/v2/subscribers')
      req = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
      req.body = { email: params['user']['email'],
                   first_name: params['user']['first_name'],
                   last_name: params['user']['last_name'] }.to_json
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.verify_mode = OpenSSL::SSL::VERIFY_PEER
      req.basic_auth ENV['NEWSLETTER_API_CLIENT_KEY'], ENV['NEWSLETTER_API_CLIENT_SECRET']
      http.request(req)
    end
  end
end
