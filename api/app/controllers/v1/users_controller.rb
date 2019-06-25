# frozen_string_literal: true

module V1
  class UsersController < APIController
    include V1::Concerns::AdminAuthorizable

    before_action :set_user, only: %i[show destroy]
    before_action :protect_foreign_resource!, if: -> { current_user.civil_servant? }, only: :show
    before_action :authorize_admin!, only: %i[index destroy]

    def index
      @users = User.all
    end

    def show
      render partial: 'shared/users/user', locals: { user: @user }
    end

    def destroy
      raise ValidationError, base: I18n.t('activerecord.errors.models.user.attributes.base.cant_delete_himself') if @user.id == current_user.id
      raise ValidationError, @user.errors unless @user.destroy
    end

    private

    def set_user
      @user = User.find(params.require(:id))
    end

    def protect_foreign_resource!
      raise AuthorizationError unless current_user.id == @user.id
    end
  end
end
