# frozen_string_literal: true

module Docx
  module Certificate
    module Substitution
      SUBSTITUTE_VALUES = {
        VORNAME: ->(service) { service.user.first_name },
        NACHNAME: ->(service) { service.user.last_name },
        PLZ: ->(service) { service.user.zip.to_s },
        ADRESSE: ->(service) { service.user.zip.to_s },
        ORT: ->(service) { service.user.city },
        HEIMATORT: ->(service) { service.user.hometown },
        DATUM: ->(_service) { I18n.l(Time.zone.today) },
        GEBURTSDATUM: ->(service) { I18n.l(service.user.birthday) },
        STARTDATUM: ->(service) { I18n.l(service.beginning) },
        ENDDATUM: ->(service) { I18n.l(service.ending) }
      }.freeze
    end
  end
end
