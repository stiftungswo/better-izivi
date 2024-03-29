# frozen_string_literal: true

require 'docx'

module Docx
  module Certificate
    class GenerateCertificate
      TEMPLATE_BASE_PATH = 'app/assets/docx/'
      DEFAULT_TEMPLATE_CONFIRMATION = ENV.fetch('DEFAULT_TEMPLATE_CONFIRMATION', 'Vorlage_Arbeitsbestätigung.docx')
      DEFAULT_TEMPLATE_CERTIFICATE = ENV.fetch('DEFAULT_TEMPLATE_CERTIFICATE', 'Vorlage_Zeugnis.docx')

      def initialize(service)
        @service = service
      end

      def render
        template_path = TEMPLATE_BASE_PATH + fetch_template_path
        raw_docx_string(fill_out_docx_template(template_path))
      end

      def fill_out_docx_template(template_path)
        doc = Docx::Document.open(template_path)
        doc.paragraphs.each do |paragraph|
          paragraph_substitute_value(paragraph)
        end
        doc.save(docx_file.path)
        docx_file
      end

      def service_is_longer_than_90_days
        @service.date_range.count >= 90
      end

      private

      def docx_file
        @docx_file ||= Tempfile.new('certificate')
      end

      def raw_docx_string(docx_file)
        docx_raw_string = docx_file.read
        docx_file.close
        docx_file.unlink
        docx_raw_string
      end

      def paragraph_substitute_value(paragraph)
        paragraph.each_text_run do |row|
          substitute_value_in_row(row)
        end
      end

      def substitute_value_in_row(row)
        Substitution::SUBSTITUTE_VALUES.each do |key, getter|
          substitute_string = "$#{key}$"
          value = getter.call(@service)
          row.substitute(substitute_string, value)
        end
      end

      def fetch_template_path
        if service_is_longer_than_90_days
          @service.service_specification.certificate_of_employment_template || DEFAULT_TEMPLATE_CERTIFICATE
        else
          @service.service_specification.confirmation_of_employment_template || DEFAULT_TEMPLATE_CONFIRMATION
        end
      end
    end
  end
end
