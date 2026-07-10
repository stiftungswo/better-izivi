# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DeviseOverrides::SessionsController, type: :routing do
  describe 'routing' do
    it 'routes to #new' do
      expect(get: '/v1/users/sign_in').to route_to('devise_overrides/sessions#new', format: :json)
    end

    it 'routes to #create' do
      expect(post: '/v1/users/sign_in').to route_to('devise_overrides/sessions#create', format: :json)
    end

    it 'routes to #destroy' do
      expect(delete: '/v1/users/sign_out').to route_to('devise_overrides/sessions#destroy', format: :json)
    end
  end
end
