require 'date'
require 'pp'

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

        return text 'you should never see this page' if @company_holidays.nil?

        title
        table_top
        table_body
      end

      def document
        @document ||= Prawn::Document.new(page_size: 'A4', page_layout: :portrait)
      end

      private

      def table_body
        font_size 10

        table(
          rows,
          header: true,
          cell_style: { border_width: 0.5, border_color: '666666', vertical_padding: 30 }
        ) do |table|
          style_table(table)
        end
      end

      def rows
        data = []
        filtered_holiday_list.sort.each do |h|
          unix = h[0]
          holiday = OpenStruct.new(h[1])

          date = I18n.l(Time.at(unix).to_date)
          weekday = Time.at(unix).to_date.strftime('%a')
          day = weekday + ', ' + date

          holiday_type = I18n.t('pdfs.holiday_table.day_off')
          unless holiday[:public_holiday]

            holiday_type = if is_paid_holiday(holiday, unix)
                             I18n.t('pdfs.holiday_table.holiday_taken_into_account')
                           else
                             I18n.t('pdfs.holiday_table.holiday_not_taken_into_account')
                           end

          end

          day_appendum = holiday.public_holiday ? ' (' + holiday.name + ')' : ''

          data.push([day + day_appendum, holiday_type + is_paid_holiday_text(holiday, unix)])
        end

        data
      end

      def filtered_holiday_list
        # will look like this { 1640077316805 => { :public_holiday => true, :name => "Weihnachten" } }
        holidays_for_table = {}

        beginning_unix = @company_holidays.beginning.to_time.to_i
        ending_unix = @company_holidays.ending.to_time.to_i

        @holidays.each do |holiday|
          holiday_beginning_unix = holiday.beginning.to_time.to_i
          holiday_ending_unix = holiday.ending.to_time.to_i
          current_unix = holiday_beginning_unix

          # only continue if holiday overlaps with company holidays
          next unless holiday_beginning_unix.between?(beginning_unix,
                                                      ending_unix) || holiday_ending_unix.between?(beginning_unix, ending_unix)

          # replace company holiday if it's on the same day as a public holiday
          while current_unix <= holiday_ending_unix
            unless holidays_for_table.has_key?(current_unix) && holidays_for_table[current_unix][:public_holiday]
              holidays_for_table[current_unix] = { public_holiday: holiday.public_holiday?, name: holiday.description }
            end
            current_unix += 60 * 60 * 24 # one day in unix
          end
        end

        holidays_for_table
      end

      def style_table(table)
        table.cells.padding = [6, 10, 6, 6]

        table.cells.style do |cell|
          cell.background_color = (cell.row % 2).zero? ? 'ffffff' : 'eeeeee'
        end
      end

      def title
        text I18n.t('pdfs.holiday_table.title'), align: :left, size: 14, leading: 12
      end

      def top_text
        if @service.long_service?
          I18n.t('pdfs.holiday_table.has_time_off')
        else
          I18n.t('pdfs.holiday_table.no_time_off')
        end
      end

      def is_paid_holiday_text(holiday, unix)
        if is_paid_holiday(holiday, unix)
          ' (' + I18n.t('pdfs.holiday_table.taken_into_account') + ')'
        else
          ' (' + I18n.t('pdfs.holiday_table.not_taken_into_account') + ')'
        end
      end

      def is_paid_holiday(holiday, unix)
        date = Time.at(unix).to_date

        @service.long_service? or holiday.public_holiday or date.saturday? or date.sunday?
      end

      def table_top
        row = [[top_text]]

        font_size 10

        table(
          row,
          header: true,
          cell_style: { border_width: 0 }
        ) do |table|
          table.cells.padding = [0, 0, 12, 0]
        end
      end

      def calculate_holidays
        Holiday.overlapping_date_range(@service.beginning, @service.ending)
      end

      def calculate_company_holidays
        Holiday.overlapping_date_range(@service.beginning, @service.ending).find(&:company_holiday?)
      end

      def valais?
        @service.service_specification.location_valais?
      end
    end
  end
end
