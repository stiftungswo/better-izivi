# frozen_string_literal: true

require 'pdf_forms'

module Pdfs
  module ServiceAgreement
    class GlueService
      FRENCH_FILE_PATH = Rails.root.join('app', 'assets', 'pdfs', 'french_service_agreement_text.pdf').freeze
      GERMAN_FILE_PATH = Rails.root.join('app', 'assets', 'pdfs', 'german_service_agreement_text.pdf').freeze

      def initialize(service)
        @service = service
      end

      def render
        generate_and_load_first_page
        fill_and_load_form
        load_info_text

        combiner.to_pdf
      end

      private

      def generate_and_load_first_page
        first_page = FirstPage.new(@service)

        combiner << CombinePDF.parse(first_page.render)
      end

      def fill_and_load_form
        form_filler = FormFiller.new(@service)
        form_filler.fill_service_agreement

        combiner << CombinePDF.load(form_filler.result_file_path)
      end

      def load_info_text
        combiner << CombinePDF.load(valais? ? FRENCH_FILE_PATH : GERMAN_FILE_PATH)
      end

      def combiner
        @combiner ||= CombinePDF.new
      end

      def valais?
        @service.service_specification.location_valais?
      end
    end
  end
end
