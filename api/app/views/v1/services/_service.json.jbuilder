# frozen_string_literal: true

json.extract! service, :id, :user_id, :beginning, :ending,
              :confirmation_date, :eligible_paid_vacation_days, :service_type, :first_swo_service,
              :long_service, :probation_service, :service_days, :service_specification_id, :starts_on_saturday

json.deletable service.deletable?

json.work_record_available service.work_record_available?

json.service_specification do
  json.extract! service.service_specification, :identification_number, :name
end
