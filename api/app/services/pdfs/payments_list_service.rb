# frozen_string_literal: true

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
      text "Zahlungen (#{date})", align: :left, size: 18, leading: 12
    end

    def total
      amount = @pending_expenses.sum(&:total)

      row = [['', '', '', to_chf(amount)]]

      font_size 14

      table(
        row,
        header: true,
        column_widths: COLUMN_WIDTHS,
        cell_style: {  border_width: 0, border_color: 'aaaaaa', vertical_padding: 30 }
      ) do
        cells.padding = [12, 5, 12, 5]
      end
    end

    def content_table
      font_size 14
      data = table_data(@pending_expenses)

      table(
        data,
        cell_style: { border_width: 0, border_color: '000000' },
        header: true,
        column_widths: COLUMN_WIDTHS
      ) do |table| 
        style_table(table, data.length)
      end
    end

    def style_table(t, length)
      t.row(0).font_style = :bold
      t.row(0).borders = [:bottom]
      t.row(0).border_width = 2
      t.row(length - 1).borders = [:bottom]
      t.row(length - 1).border_width = 2

      t.cells.padding = [8, 5, 8, 5]

      t.cells.style do |cell|
        cell.background_color = (cell.row % 2).zero? ? 'ffffff' : 'eeeeee'
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
          expense.user.prettified_bank_iban,
          to_chf(expense.total)
        ]
      end
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
