# frozen_string_literal: true

require 'prawn'

module Pdfs
  class PaymentsListService
    include Prawn::View
    include Pdfs::PrawnHelper

    def header_array
      [
        I18n.t('pdfs.payments.zdp'),
        I18n.t('pdfs.payments.name'),
        I18n.t('activerecord.attributes.user.bank_iban'),
        I18n.t('pdfs.payments.amount')
      ]
    end

    COLUMN_WIDTHS = [55, 180, 185, 90].freeze

    def initialize(pending_expenses, pending, date)
      @pending_expenses = pending_expenses
      @pending = pending
      @date = date

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
      # date = I18n.t('pdfs.phone_list.header', date: I18n.l(Time.zone.today))
      date = I18n.l(@date)
      payments = I18n.t(@pending ? 'pdfs.payments.pending_payments' : 'pdfs.payments.payment')
      hahaha = ENV.fetch('SMTP_HOST', ':(((')
      text "#{hahaha} #{payments} (#{date})", align: :left, size: 18, leading: 12
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

    # rubocop:disable Metrics/AbcSize
    def style_table(table, length)
      first_row = table.row(0)
      first_row.font_style = :bold
      first_row.borders = [:bottom]
      first_row.border_width = 2
      table.row(length - 1).borders = [:bottom]
      table.row(length - 1).border_width = 2
      table.cells.padding = [8, 5, 8, 5]

      table.cells.style do |cell|
        cell.background_color = (cell.row % 2).zero? ? 'ffffff' : 'eeeeee'
      end
    end
    # rubocop:enable Metrics/AbcSize

    def table_data(expenses)
      [header_array].push(*table_content(expenses))
    end

    # :reek:FeatureEnvy
    def table_content(expenses)
      expenses.map do |exp|
        user = exp.user
        [
          user.zdp,
          user.full_name,
          user.prettified_bank_iban,
          to_chf(exp.total)
        ]
      end
    end

    def to_chf(amount)
      "#{amount.to_s[0..-3]}.#{amount.to_s[-2..]} CHF"
    end
  end
end
