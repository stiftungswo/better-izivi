json.array! @surveys do |survey|
  json.id survey['id']
  json.name survey['name']
end
