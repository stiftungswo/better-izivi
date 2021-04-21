# frozen_string_literal: true

module DeviseOverrides
  class RegistrationsController < Devise::RegistrationsController
    def create
      raise invalid_community_password_error unless valid_community_password?

      subscribe_to_newsletter
      make_user_dime if ENV.fetch('CONNECT_TO_DIME') == 'true'
      super
    end

    def validate
      validation_error = ValidationError.new User.validate_given_params(sign_up_params)

      should_display_community_error = community_password && !valid_community_password?
      validation_error.merge! invalid_community_password_error if should_display_community_error

      raise validation_error unless validation_error.empty?

      head :no_content
    end

    def subscribe_to_newsletter
      SubscribeToNewsletter.new(params['user']) if params['user']['newsletter'] == true
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

    # :reek:FeatureEnvy
    def make_user_dime
      user_params = params['user']
      body = { "email": user_params['email'], "can_login": false, "first_name": user_params['first_name'],
               "last_name": user_params['last_name'], "password": user_params['password'], "employee_group_id": 2,
               "password_repeat": user_params['password'] }.to_json
      req = AuthenticateInDime.new
      req.make_user_dime(body)
    end
  end
end
