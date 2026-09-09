# frozen_string_literal: true

require 'pdf_forms'
require 'hexapdf'

module Pdfs
  module ServiceAgreement
    class GlueService
      def initialize(service)
        @service = service
        @combined = HexaPDF::Document.new
        @company_holidays = calculate_company_holidays
      end

      def render
        fill_and_load_form

        load_holiday_table if @company_holidays

        load_info_text
        generate_and_load_first_page

        pdf_io = StringIO.new
        @combined.write(pdf_io)
        pdf_io.string
      end

      private

      def load_holiday_table
        ioify_and_combine(HolidayTable.new(@service))
      end

      def generate_and_load_first_page
        ioify_and_combine(FirstPage.new(@service))
      end

      def fill_and_load_form
        ioify_and_combine(FormFiller.new(@service))
      end

      def ioify_and_combine(pdf)
        pdf_io = StringIO.new(pdf.render)

        HexaPDF::Document.new(io: pdf_io).pages.each { |page| @combined.pages << @combined.import(page) }
      end

      def load_info_text
        terms_pdf = @service.service_specification.site.terms_pdf

        HexaPDF::Document.new(io: StringIO.new(terms_pdf.download))
                         .pages.each { |page| @combined.pages << @combined.import(page) }
      end

      def calculate_company_holidays
        Holiday.overlapping_date_range(@service.beginning, @service.ending).find(&:company_holiday?)
      end
    end
  end
end
