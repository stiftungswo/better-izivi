# frozen_string_literal: true

Rails.application.routes.draw do
  resources :regional_centers, only: :index
end
