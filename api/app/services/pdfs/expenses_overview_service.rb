# frozen_string_literal: true

require 'prawn'

# require_relative 'expenses_overview/expenses_overview_additions'

module Pdfs
  class ExpensesOverviewService
    include Prawn::View
    include Pdfs::PrawnHelper

    def initialize(service_specifications, dates)
      @beginning = dates.beginning
      @ending = dates.ending
      @service_specifications = service_specifications
      update_font_families
      headline
      header
      content_table
    end

    def document
      @document ||= Prawn::Document.new(page_size: 'A4', page_layout: :landscape)
    end

    private

    def headline
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

    def header
      font_size 9
      table([Pdfs::ExpensesOverview::ExpensesOverviewAdditions::TABLE_HEADER,
             Pdfs::ExpensesOverview::ExpensesOverviewAdditions::TABLE_SUB_HEADER],
            cell_style: { borders: [] },
            width: bounds.width,
            header: true,
            column_widths: Pdfs::ExpensesOverview::ExpensesOverviewAdditions::COLUMN_WIDTHS) do
        row(0).font_style = :bold
      end
    end

    def content_table
      font_size 9
      @service_specifications.values.each do |expense_sheets|
        table(table_data(expense_sheets),
              cell_style: { borders: [] },
              width: bounds.width, header: true,
              column_widths: Pdfs::ExpensesOverview::ExpensesOverviewAdditions::COLUMN_WIDTHS) {}
        table([[{ content: 'Gesamt: ', align: :left },
                { content: (expense_sheets.sum(&:work_days) + expense_sheets.sum(&:workfree_days)).to_s,
                  align: :right },
                { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheets.sum(&:calculate_full_expenses).to_s),
                  align: :right }]], cell_style: { borders: %i[] },
                                     header: false, position: :right, column_widths: [40, 30, 45]) do
          row(0).font_style = :bold
        end
      end
    end

    def pre_table(name)
      move_down 25
      text(name, align: :left, style: :bold, size: 11)
    end

    def table_data(expense_sheets)
      move_down 10
      table_content(expense_sheets)
    end

    def method1(expense_sheet)
      [{ content: expense_sheet.user_id.to_s, align: :right },
       { content: (expense_sheet.user.last_name + ' ' + expense_sheet.user.first_name) },
       { content: (I18n.l(expense_sheet.beginning, format: :short) + ' - ' +
         I18n.l(expense_sheet.ending, format: :short)).to_s, align: :center }]
    end

    def method2(expense_sheet)
      [{ content: expense_sheet.work_days.to_s, align: :right },
       { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(
         expense_sheet.calculate_work_days[:total] +
         expense_sheet.calculate_first_day[:total] +
         expense_sheet.calculate_last_day[:total]
       ), align: :right },
       { content: expense_sheet.workfree_days.to_s, align: :right }]
    end

    def method3(expense_sheet)
      [{ content: Pdfs::ExpenseSheet::FormatHelper.to_chf(
        expense_sheet.calculate_workfree_days[:total]
      ), align: :right },
       { content: expense_sheet.sick_days.to_s, align: :right },
       { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(
         expense_sheet.calculate_sick_days[:total]
       ), align: :right },
       { content: expense_sheet.paid_vacation_days.to_s, align: :right },
       { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(
         expense_sheet.calculate_paid_vacation_days[:total]
       ), align: :right }]
    end

    def method4(expense_sheet)
      [{ content: expense_sheet.unpaid_vacation_days.to_s, align: :right },
       { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(
         expense_sheet.calculate_unpaid_vacation_days[:total]
       ), align: :right },
       { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(
         expense_sheet.driving_expenses
       ), align: :right },
       { content: (expense_sheet.work_days +
         expense_sheet.workfree_days).to_s, align: :right }]
    end

    def method5(expense_sheet)
      [
        { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(
          expense_sheet.extraordinary_expenses
        ), align: :right },
        { content: (expense_sheet.work_days +
          expense_sheet.workfree_days).to_s, align: :right },
        { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(
          expense_sheet.calculate_full_expenses.to_d
        ), align: :right }
      ]
    end

    def table_content(expense_sheets)
      expense_sheets.map do |expense_sheet|
        expense_sheet.slice.values
        method1(expense_sheet) +
          method2(expense_sheet) +
          method3(expense_sheet) +
          method4(expense_sheet) +
          method5(expense_sheet)
      end
    end
  end
end
