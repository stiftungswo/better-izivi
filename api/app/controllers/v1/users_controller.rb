# frozen_string_literal: true

module V1
  class UsersController < APIController
    def show
      render partial: 'shared/users/user', locals: { user: User.find(params.require(:id)) }
    end
  end
end
