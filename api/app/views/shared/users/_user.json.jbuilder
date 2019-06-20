# frozen_string_literal: true

json.extract! user,
              :id, :address, :bank_iban, :birthday, :chainsaw_workshop,
              :city, :driving_licence_b, :driving_licence_be, :email,
              :first_name, :health_insurance, :hometown, :internal_note,
              :last_name, :phone, :regional_center_id, :role, :work_experience, :zdp, :zip
# TODO: Rename to services; only temporary to make frontend work
json.missions do
  json.array! user.services, partial: 'v1/services/service', as: :service
end
