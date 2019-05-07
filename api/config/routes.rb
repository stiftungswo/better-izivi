# frozen_string_literal: true

Rails.application.routes.draw do
  scope 'v1', defaults: { format: :json } do
    resources :regional_centers, only: :index, defaults: { format: :json }
  end
end
