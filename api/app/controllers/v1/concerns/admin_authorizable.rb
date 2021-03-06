# frozen_string_literal: true

module V1
  module Concerns
    module AdminAuthorizable
      def authorize_admin!
        raise AuthorizationError unless current_user.admin?
      end
    end
  end
end
