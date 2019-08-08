# frozen_string_literal: true

module DeviseOverrides
  class RegistrationsController < Devise::RegistrationsController
    def create
      raise invalid_community_password_error unless valid_community_password?

      super
    end

    def validate
      validation_error = ValidationError.new filtered_signup_params

      should_display_community_error = community_password.present? && !valid_community_password?
      validation_error.merge! invalid_community_password_error if should_display_community_error

      raise validation_error unless validation_error.empty?

      head :no_content
    end

    private

    def filtered_signup_params
      user_params = sign_up_params
      errors = User.new(user_params).tap(&:validate).errors

      errors.each do |attribute, _error|
        errors.delete attribute unless attribute.to_s.in?(user_params.keys)
      end

      errors
    end

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
  end
end
