# frozen_string_literal: true

require 'prawn'

module Pdfs
  class ExpensesOverviewService
    include Prawn::View
    include Pdfs::PrawnHelper

    TABLE_HEADER = [
      I18n.t('activerecord.attributes.user.id'),
      I18n.t('activerecord.attributes.service_specification.name'),
      I18n.t('pdfs.expense_sheet.info_block.header.expense_sheet_time_duration.label'),
      {:content => I18n.t('activerecord.attributes.expense_sheet.work_days.other'), :colspan => 2},
      {:content => I18n.t('activerecord.attributes.expense_sheet.workfree'), :colspan => 2},
      {:content => I18n.t('activerecord.attributes.expense_sheet.sickness'), :colspan => 2},
      {:content => I18n.t('activerecord.attributes.expense_sheet.paid_vacation_days.other'), :colspan => 2},
      {:content => I18n.t('activerecord.attributes.expense_sheet.unpaid_vacation_days.other'), :colspan => 2},
      {:content => I18n.t('activerecord.attributes.expense_sheet.way_expenses'), :colspan => 2},
      {:content => I18n.t('activerecord.attributes.expense_sheet.clothing'), :colspan => 2},
      {:content => I18n.t('activerecord.attributes.expense_sheet.clothing'), :colspan => 2},
      I18n.t('pdfs.expense_sheet.expense_table.row_headers.extra'),
      {:content => I18n.t('pdfs.expense_sheet.expense_table.headers.full_amount'), :colspan => 2}
    ].freeze

    def initialize(service_specifications, dates)
      @beginning = dates.beginning
      @ending = dates.ending
      @service_specifications = service_specifications

      update_font_families

      header
      content_table
    end

    def document
      @document ||= Prawn::Document.new(page_size: 'A4', page_layout: :landscape)
    end

    private

    def header
      text I18n.t('pdfs.expenses_overview.swo', date: I18n.l(Time.zone.today)), align: :right, size: 8
      text I18n.t('pdfs.expenses_overview.basedon', date: I18n.l(Time.zone.today)), align: :right, size: 8
      text(
        I18n.t(
          'pdfs.expenses_overview.title',
          beginning: I18n.l(@beginning),
          ending: I18n.l(@ending)
        ),
        align: :left,
        style: :bold,
        size: 15
      )
    end

    def content_table
      @service_specifications.each do |name, expense_sheets|

        font_size 10
        table(table_data(expense_sheets),
              cell_style: { borders: %i[] },
              width: bounds.width + 120,
              header: true,
              column_widths: [50, 60, 100, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]) do
          row(0).font_style = :bold
        end
      end
    end

    def pre_table(name)
      move_down 25

      text(
        name,
        align: :left,
        style: :bold,
        size: 11
      )
    end

    def table_data(expense_sheets)
      [TABLE_HEADER].push(*table_content(expense_sheets))
    end

    def table_content(expense_sheets)
      expense_sheets.map do |expense_sheet|
        expense_sheet.slice().values
          .push(expense_sheet.user_id)
        .push("Name / Vorname")
        .push(I18n.l(expense_sheet.beginning, format: :short) + " - " + I18n.l(expense_sheet.ending, format: :short))
        .push(expense_sheet.work_days)
        .push(expense_sheet.calculate_work_days.to_d)
        .push(Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.calculate_full_expenses.to_d))
        .push("test")
      end
    end
  end
end
