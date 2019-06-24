# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :v1, defaults: { format: :json } do
    resources :regional_centers, only: :index
    resources :holidays, only: %i[index create update destroy]
    resources :service_specifications, only: %i[index create update]
    resources :expense_sheets
    resources :services
    resources :users, only: :show
    get 'payments/pain', to: 'payments#show', as: 'pain_export'
    get 'phone_list', to: 'phone_list#show', as: 'phone_list_export'
    get 'expense_sheet', to: 'expense_sheets#show', as: 'expense_sheet_export'
  end

  scope :v1 do
    devise_for :users, defaults: { format: :json }
  end
end
