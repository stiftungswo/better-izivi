# frozen_string_literal: true

require 'pdf_forms'
require 'date'

# :reek:RepeatedConditional
module Pdfs
  module ServiceAgreement
    class FormFiller
      FRENCH_FILE_PATH = Rails.root.join('app/assets/pdfs/french_service_agreement_form.pdf').freeze
      GERMAN_FILE_PATH = Rails.root.join('app/assets/pdfs/german_service_agreement_form.pdf').freeze

      def initialize(service)
        @service = service
        @pdftk = PdfForms.new(ENV.fetch('PDFTK_BIN_PATH', 'pdftk'))
      end

      def render
        fill_form
        pdf = pdf_file.read
        pdf_file.close
        pdf_file.unlink
        pdf
      end

      private

      def fill_form
        I18n.locale = valais? ? :fr : :de
        file_path = valais? ? FRENCH_FILE_PATH : GERMAN_FILE_PATH

        @pdftk.fill_form file_path, pdf_file, load_fields, flatten: true
      end

      def pdf_file
        @pdf_file ||= Tempfile.new('service_agreement_form')
      end

      def load_fields
        load_user_fields
          .merge(load_service_date_fields)
          .merge(load_service_specification_fields)
          .merge(custom_data)
      end

      def find_holidays
        Holiday.overlapping_date_range(@service.beginning, @service.ending).find(&:company_holiday?)
      end

      # rubocop:disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity
      # :reek:FeatureEnvy
      # :reek:TooManyStatements
      def custom_data
        type = valais? ? 'Auswahl15' : 2

        if @service.long_service
          type = valais? ? 'Auswahl14' : 1
        elsif @service.probation_service
          type = valais? ? 'Auswahl13' : 0
        end

        # TODO: use I18n.l instead of text
        holidays = find_holidays
        if holidays
          beginning = I18n.l(holidays.beginning)
          ending = I18n.l(holidays.ending)
          notes = if valais?
                    "Fermeture annuelle du #{beginning} au #{ending}"
                  else
                    "Betriebsferien von #{beginning} bis #{ending}"
                  end
        else
          notes = ''
        end

        birthdaykey = valais? ? 'Date de naissance' : 'Geb.datum'
        titlekey = valais? ? 'Cahier des charges' : 'Pflichtenheft'
        typekey = valais? ? 'Type' : 'Einsatztyp'
        noteskey = valais? ? 'Remarques' : 'Bemerkungen'
        holidayskey = valais? ? 'Fermeture' : 'Check Box Betriebsferien'

        {
          holidayskey => holidays.nil? ? 'Off' : 'Ja',
          noteskey => notes,
          # 0: Probeeinsatz
          # 1: obligatorischer langer Einsatz oder Teil davon
          # 2: Einsatz
          typekey => type,
          titlekey => @service.service_specification.title,
          birthdaykey => I18n.l(@service.user.birthday)
        }
      end
      # rubocop:enable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity

      def load_user_fields
        convert_to_form_fields_hash(FormFields::USER_FORM_FIELDS) do |key, value|
          [value, @service.user.public_send(key)]
        end
      end

      def load_service_date_fields
        convert_to_form_fields_hash(FormFields::SERVICE_DATE_FORM_FIELDS) do |key, value|
          [value, I18n.l(@service.public_send(key))]
        end
      end

      def load_service_specification_fields
        convert_to_form_fields_hash(FormFields::SERVICE_SPECIFICATION_FORM_FIELDS) do |key, value|
          [value, @service.service_specification.public_send(key)]
        end
      end

      def convert_to_form_fields_hash(mapping, &)
        mapping[I18n.locale].map(&).to_h
      end

      def valais?
        @service.service_specification.location_valais?
      end
    end
  end
end
