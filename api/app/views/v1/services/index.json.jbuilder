# frozen_string_literal: true

json.array! @services do |service|
  json.extract! service, :id, :beginning, :ending, :confirmation_date, :service_specification_id, :service_type
  json.service_specification do
    json.extract! service.service_specification, :identification_number, :name, :short_name
  end

  json.user do
    json.extract! service.user, :id, :first_name, :last_name, :zdp
  end
end
