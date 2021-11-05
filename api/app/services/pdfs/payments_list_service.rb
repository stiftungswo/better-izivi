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
      Bettrag
    ].freeze

    def initialize(pending_expenses)
      @pending_expenses = pending_expenses
      puts total()

      update_font_families
      header
      content_table
    end

    def document
      @document ||= Prawn::Document.new(page_size: 'A4', page_layout: :portrait)
    end

    private

    def header
      text I18n.t('pdfs.phone_list.header', date: I18n.l(Time.zone.today)), align: :right
    end

    def total
      amount = @pending_expenses.map(&:total).inject(0, &:+)

      ["", "", "Total", to_chf(amount)]
    end

    def content_table
      font_size 10
      table(table_data(@pending_expenses),
            cell_style: { borders: %i[] },
            header: true,
            column_widths: [40, 120, 120, 100]) do
        row(0).font_style = :bold
      end
    end


    def table_data(expenses)
      [TABLE_HEADER].push(*table_content(expenses)).push(total)
    end

    def table_content(expenses)
      expenses.map do |expense|
        [
          expense.user.zdp,
          expense.user.full_name,
          expense.user.bank_iban,
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
