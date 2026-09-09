# frozen_string_literal: true

json.array! @surveys do |survey|
  json.id survey['id']
  json.name survey['name']
end
