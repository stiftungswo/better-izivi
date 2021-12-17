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
        @company_holidays = calculate_company_holidays

        title
        table_top
        table_body
      end

      def document
        @document ||= Prawn::Document.new(page_size: 'A4', page_layout: :portrait)
      end

      private
      
      def table_body
        row = []
        @holidays.each do | holiday|

          holiday_beginning_unix = holiday.beginning.to_time.to_i;
          holiday_ending_unix = holiday.ending.to_time.to_i;
          current_unix = holiday_beginning_unix
          
          while current_unix <= holiday_ending_unix
            date = I18n.l(Time.at(current_unix).to_date);
            weekday = Time.at(current_unix).to_date.strftime('%a')
            day = weekday + ", " + date
            
            holiday_type = "Arbeitsfreier Tag"
            if holiday.company_holiday?
              holiday_type = is_paid_holiday(holiday, current_unix) ? "Ferientag" : "Urlaubstag"
            end

            day_appendum = holiday.public_holiday? ? " (" + holiday.description +  ")"  : ""

            row.push([day + day_appendum, holiday_type + is_paid_holiday_text(holiday, current_unix)]);
            
            current_unix += 60 * 60 * 24
          end
        end
        
        font_size 10

        table(
          row,
          header: true,
          cell_style: {  border_width: 0.5, border_color: '666666', vertical_padding: 30 }
        ) do | table |
          style_table(table, row.length)
        end
      end

      def style_table(table, length)
        table.cells.padding = [6, 10, 6, 6]

        table.cells.style do |cell|
          cell.background_color = (cell.row % 2).zero? ? 'ffffff' : 'eeeeee'
        end
      end

      def title
        text "Anhang: Aufstellung Ferien-, Urlaubs- und Feiertage", align: :left, size: 14, leading: 12
      end

      def top_text
        if @service.long_service?
          return "Der Zivi hat Anspruch auf Ferien."
        else
          return "Der Zivi hat keinen Anspruch auf Ferien."
        end
      end

      def is_paid_holiday_text(holiday, unix)
        if is_paid_holiday(holiday, unix) 
          return " (anrechenbar)"
        else
          return " (nicht anrechenbar)"
        end
      end

      def is_paid_holiday(holiday, unix)
        date = Time.at(unix).to_date
        
        @service.long_service? or holiday.public_holiday? or date.saturday? or date.sunday?
      end

      def table_top
        
        row = [[top_text()]]

        font_size 10

        table(
          row,
          header: true,
          cell_style: { border_width: 0 }
        ) do | table |
          table.cells.padding = [0, 0, 12, 0]
        end
      end

      def calculate_holidays
        Holiday.overlapping_date_range(@service.beginning, @service.ending)
      end

      
      def calculate_company_holidays
        Holiday.overlapping_date_range(@service.beginning, @service.ending).find(&:company_holiday?)
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