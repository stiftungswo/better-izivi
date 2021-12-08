# frozen_string_literal: true

require 'pdf_forms'
require 'date'

module Pdfs
  module ServiceAgreement
    class FormFiller
      FRENCH_FILE_PATH = Rails.root.join('app/assets/pdfs/french_service_agreement_form_new.pdf').freeze
      GERMAN_FILE_PATH = Rails.root.join('app/assets/pdfs/german_service_agreement_form_new.pdf').freeze

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
          .merge(load_service_checkboxes)
          .merge(load_service_specification_fields)
          .merge(load_company_holiday_fields)
          .merge(load_regional_center)
          .merge(load_regional_center_address)
          .merge(custom_data)
      end

      def get_holidays
        company_holiday = Holiday.overlapping_date_range(@service.beginning, @service.ending)
                                 .find(&:company_holiday?)
      end

      def custom_data
        type = valais? ? "Auswahl15" : 2

        if @service.long_service
          type = valais? ? "Auswahl14" : 1
        elsif @service.probation_service
          type = valais? ? "Auswahl13" : 0
        end

        holidays = get_holidays()
        if (!holidays.nil?)
          beginning = holidays.beginning.strftime("%d. %m. %Y")
          ending = holidays.ending.strftime("%d. %m. %Y")
          if (valais?) 
            notes = "Fermeture annuelle du " + beginning + " au " + ending      
          else
            notes = "Betriebsferien von " + beginning + " bis " + ending      
          end
        else
          notes = ""
        end 

        birthdaykey = valais? ? "Date de naissance" : "Geb.datum"
        titlekey = valais? ? "Cahier des charges" : "Pflichtenheft"
        typekey = valais? ? "Type" : "Einsatztyp"
        noteskey = valais? ? "Remarques" : "Bemerkungen"
        holidayskey = valais? ? "Fermeture" : "Check Box Betriebsferien"


        {
          holidayskey => holidays.nil? ? "Off" : "Ja",
          noteskey => notes,
          # 0: Probeeinsatz
          # 1: obligatorischer langer Einsatz oder Teil davon
          # 2: Einsatz
          typekey => type,
          titlekey => @service.service_specification.title,
          birthdaykey => @service.user.birthday.strftime("%d. %m. %Y")
        }
      end

      def load_user_fields
        convert_to_form_fields_hash(FormFields::USER_FORM_FIELDS) do |key, value|
          [value, @service.user.public_send(key)]
        end
      end

      def load_regional_center
        convert_to_form_fields_hash(FormFields::REGIONAL_CENTER) do |key, value|
          [value, @service.user.regional_center.public_send(key)]
        end
      end

      def load_regional_center_address
        address_data = @service.user.regional_center.address.split ', '
        convert_to_form_fields_hash(FormFields::REGIONAL_CENTER_ADDRESS) do |key, value|
          [value, address_data.public_send(key)]
        end
      end

      def load_service_date_fields
        convert_to_form_fields_hash(FormFields::SERVICE_DATE_FORM_FIELDS) do |key, value|
          [value, I18n.l(@service.public_send(key))]
        end
      end

      def load_service_checkboxes
        convert_to_form_fields_hash(FormFields::SERVICE_CHECKBOX_FIELDS) do |key, value|
          [value, (@service.public_send(:"#{key}?") ? 'On' : 'Off')]
        end
      end

      def load_service_specification_fields
        convert_to_form_fields_hash(FormFields::SERVICE_SPECIFICATION_FORM_FIELDS) do |key, value|
          [value, @service.service_specification.public_send(key)]
        end
      end

      def load_company_holiday_fields
        company_holiday = Holiday.overlapping_date_range(@service.beginning, @service.ending)
                                 .find(&:company_holiday?)
        return {} if company_holiday.nil?

        convert_to_form_fields_hash(FormFields::COMPANY_HOLIDAY_FORM_FIELDS) do |key, value|
          [value, I18n.l(company_holiday.public_send(key))]
        end
      end

      def convert_to_form_fields_hash(mapping, &block)
        mapping[I18n.locale].map(&block).to_h
      end

      def valais?
        @service.service_specification.location_valais?
      end
    end
  end
end
