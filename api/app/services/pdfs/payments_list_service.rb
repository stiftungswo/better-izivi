require 'prawn'

# TODO: internatinalizaion

module Pdfs
  class PaymentsListService
    include Prawn::View
    include Pdfs::PrawnHelper

    TABLE_HEADER = %w[
      ZDP
      Name
      IBAN
      Betrag
    ].freeze

    COLUMN_WIDTHS = [55, 180, 185, 90].freeze

    def initialize(pending_expenses)
      @pending_expenses = pending_expenses

      update_font_families
      header
      content_table
      total
    end

    def document
      @document ||= Prawn::Document.new(page_size: 'A4', page_layout: :portrait)
    end

    private

    def header

      date = I18n.t('pdfs.phone_list.header', date: I18n.l(Time.zone.today))
      text "Zahlungen (" + date + ")", align: :left, size: 18, leading: 12
    end

    def total
      amount = @pending_expenses.map(&:total).inject(0, &:+)

      row = [["", "", "", to_chf(amount)]]

      font_size 14
  
      table(
        row,
        header: true,
        column_widths: COLUMN_WIDTHS,
        cell_style: {  border_width: 0, border_color: "aaaaaa", vertical_padding: 30 }
      ) do
        cells.padding = [12, 5, 12, 5]
      end
    end

    def content_table
      font_size 14

      t = table_data(@pending_expenses)
  
      table(t,
            cell_style: {  border_width: 0, border_color: "000000" },
            header: true,
            column_widths: COLUMN_WIDTHS) do
        row(0).font_style = :bold
        row(0).borders = [:bottom]
        row(0).border_width = 2
        row(t.length() - 1).borders = [:bottom]
        row(t.length() - 1).border_width = 2

        cells.padding = [8, 5, 8, 5]

        cells.style do |c|
          c.background_color = (c.row % 2).zero? ? 'ffffff' : 'eeeeee'
        end
      end
    end

      

    def table_data(expenses)
      [TABLE_HEADER].push(*table_content(expenses))
    end

    def table_content(expenses)
      expenses.map do |expense|
        [
          expense.user.zdp,
          expense.user.full_name,
          format_iban(expense.user.bank_iban),
          to_chf(expense.total)
        ]
      end
    end

    # changes 'CH9300121234123412347' to 'CH93 0012 1234 1234 1234 7'
    def format_iban(iban)
      iban.gsub(/(.{4})(?=.)/, '\1 \2')
    end

    def to_chf(amount)
      ActionController::Base.helpers.number_to_currency(
        amount / 100,
        unit: 'CHF',
        format: '%u %n',
        separator: '.',
        delimiter: ''
      )
    end

  end
end
