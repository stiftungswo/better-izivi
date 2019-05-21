# frozen_string_literal: true

json.array! @services do |service|
  json.extract! service, :id, :beginning, :ending, :confirmation_date
  json.service_specification service.service_specification.name
end
