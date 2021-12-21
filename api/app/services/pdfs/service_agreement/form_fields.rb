# frozen_string_literal: true

module Pdfs
  module ServiceAgreement
    # :reek:TooManyConstants { max_constants: 7 }
    module FormFields
      USER_FORM_FIELDS = {
        fr: {
          zdp: 'N° de civiliste',
          first_name: 'Prénom',
          last_name: 'Nom',
          zip_with_city: 'NPA / Lieu',
          address: 'Rue / n°',
          phone: 'Téléphone',
          prettified_bank_iban: 'IBAN',
          email: 'Courriel',
          health_insurance: 'Caisse-maladie (Nom et lieu)'
        },
        de: {
          zdp: 'ZDP-Nr',
          first_name: 'Vorname',
          last_name: 'Name',
          zip_with_city: 'PLZ / Ort',
          address: 'Strasse / Nr',
          phone: 'Telefon',
          prettified_bank_iban: 'IBAN',
          email: 'E-Mail',
          health_insurance: 'Krankenkasse (Name und Ort)'
        }
      }.freeze

      SERVICE_DATE_FORM_FIELDS = {
        fr: {
          beginning: 'debut',
          ending: 'fin'
        },
        de: {
          beginning: 'Einsatzbeginn',
          ending: 'Einsatzende'
        }
      }.freeze

      SERVICE_SPECIFICATION_FORM_FIELDS = {
        fr: {
          title: 'Cahier des charges'
        },
        de: {
          title: 'Pflichtenheft'
        }
      }.freeze
    end
  end
end
