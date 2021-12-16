require 'date'

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
        holiday_beginning_unix = @holidays.beginning.to_time.to_i;
        holiday_ending_unix = @holidays.ending.to_time.to_i;
        
        current_unix = holiday_beginning_unix

        row = []
        while current_unix <= holiday_ending_unix
          date = I18n.l(Time.at(current_unix).to_date);
          weekday = Time.at(current_unix).to_date.strftime('%a')
          day = weekday + ", " + date

          row.push([day, "haha lol"]);

          current_unix += 60 * 60 * 24
        end
        
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