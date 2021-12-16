
module Pdfs
  module ServiceAgreement
    class HolidayTable
      include Prawn::View
      include Pdfs::PrawnHelper

      COLUMN_WIDTHS = [120, 240].freeze

      def initialize(service)
        @service = service
        @holidays = calculate_holidays

        table_top
        table_body
      end

      def document
        @document ||= Prawn::Document.new(page_size: 'A4', page_layout: :portrait)
      end

      private
      
      def table_body
        
        row = [
          ['Mo, 10.05.2021', 'Ferientag, anrechenbar'],
          ['Di, 11.05.2021', 'Ferientag, anrechenbar'],
          ['Mi, 12.05.2021', 'Ferientag, anrechenbar'],
          ['Do, 13.05.2021', 'Arbeitsfreier Tag, anrechenbar'],
          ['Fr, 14.05.2021', 'Ferientag, anrechenbar'],
          ['Sa, 15.05.2021', 'Arbeitsfreier Tag, anrechenbar'],
          ['So, 16.05.2021', 'Arbeitsfreier Tag, anrechenbar'],
        ]

        font_size 12

        table(
          row,
          header: true,
          column_widths: COLUMN_WIDTHS,
          cell_style: {  border_width: 1, border_color: '555555', vertical_padding: 30 }
        ) do
          cells.padding = [12, 5, 12, 5]
        end
      end

      def table_top
        
        row = [[get_holiday_text], ["Der Zivi hat Anspruch auf Ferien."]]

        font_size 12

        table(
          row,
          header: true,
          cell_style: {  border_width: 1, border_color: '555555' }
        ) do
          cells.padding = [0, 5, 0, 5]
        end
      end

      def calculate_holidays
        Holiday.overlapping_date_range(@service.beginning, @service.ending)
                                 .find(&:company_holiday?)
      end

      def get_holiday_text
        if @holidays
          beginning = I18n.l(@holidays.beginning)
          ending = I18n.l(@holidays.ending)
          notes = if valais?
                    'Fermeture annuelle du ' + beginning + ' au ' + ending
                  else
                    'Betriebsferien vom ' + beginning + ' bis ' + ending
                  end
        else
          notes = 'Keine Ferien während dem Einsatz, dieser Text sollte nie gesehen werden.'
        end

        notes
      end

      def valais?
        @service.service_specification.location_valais?
      end

    end
  end
end