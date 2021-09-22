# frozen_string_literal: true

require 'prawn'

# require_relative 'expenses_overview/expenses_overview_additions'

module Pdfs
  # rubocop:disable Metrics/ClassLength
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
      text(I18n.t('pdfs.expenses_overview.title', beginning: I18n.l(@beginning), ending: I18n.l(@ending)),
           align: :left, style: :bold, size: 15)
    end

    def header
      font_size 9
      table([Pdfs::ExpensesOverview::ExpensesOverviewAdditions::TABLE_HEADER,
             Pdfs::ExpensesOverview::ExpensesOverviewAdditions::TABLE_SUB_HEADER],
            cell_style: { borders: [] }, width: bounds.width,
            column_widths: Pdfs::ExpensesOverview::ExpensesOverviewAdditions::COLUMN_WIDTHS) do
        row(0).font_style = :bold
      end
    end

    # rubocop:disable Metrics/AbcSize, Metrics/MethodLength
    def content_table
      total_days = 0
      total_expenses = 0.0

      total_work_days = 0
      total_work_days_chf = 0.0
      total_workfree_days = 0

      font_size 9
      @service_specifications.each_value do |expense_sheet|
        table(
          table_data(expense_sheet),
          cell_style: { borders: [], padding: [0, 5, 0, 5] },
          width: bounds.width,
          column_widths: Pdfs::ExpensesOverview::ExpensesOverviewAdditions::COLUMN_WIDTHS
        )
        sum_table(expense_sheet)
        total_days += (expense_sheet.sum(&:work_days) + expense_sheet.sum(&:workfree_days) +
          expense_sheet.sum(&:paid_vacation_days) + expense_sheet.sum(&:sick_days))
        total_expenses += expense_sheet.sum(&:calculate_full_expenses)
      end

      total_sum_table(total_days, total_expenses)
    end

    # rubocop:enable Metrics/AbcSize, Metrics/MethodLength

    # :reek:FeatureEnvy
    def sum_table(expense_sheets)
      table([[{ content: 'Gesamt: ', align: :left },
              { content: (expense_sheets.sum(&:work_days) + expense_sheets.sum(&:workfree_days) +
                expense_sheets.sum(&:paid_vacation_days) + expense_sheets.sum(&:sick_days)).to_s,
                align: :right },
              { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheets.sum(&:calculate_full_expenses).to_s),
                align: :right }]], cell_style: { borders: [], padding: [1, 5, 1, 5] },
            header: false, position: :right, column_widths: [40, 30, 45]) do
        row(0).font_style = :bold
      end
    end

    # rubocop:disable Metrics/MethodLength
    def total_sum_table(total_days, total_expenses)
      head = [
        [
          {
            content: "Total Tage: #{total_days}, Total Betrag: #{Pdfs::ExpenseSheet::FormatHelper.to_chf(total_expenses.to_s)}",
            align: :right
          }
        ]
      ]

      sum = [
        [
          { content: '', align: :right },
          { content: '', align: :right },
          { content: 'Total', align: :right },

          { content: @service_specifications.sum { |e| e.last.sum(&:work_days) }.to_s, align: :right },
          { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(@service_specifications.sum do |expense_sheets|
            expense_sheets.last.sum do |expense_sheet|
              expense_sheet.calculate_work_days[:total] +
                expense_sheet.calculate_first_day[:total] +
                expense_sheet.calculate_last_day[:total]
            end
          end).to_s, align: :right },

          { content: @service_specifications.sum { |e| e.last.sum(&:workfree_days) }.to_s, align: :right },
          { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(@service_specifications.sum do |expense_sheets|
            expense_sheets.last.sum do |expense_sheet|
              expense_sheet.calculate_workfree_days[:total]
            end
          end).to_s, align: :right },

          { content: @service_specifications.sum { |e| e.last.sum(&:sick_days) }.to_s, align: :right },
          { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(@service_specifications.sum do |expense_sheets|
            expense_sheets.last.sum do |expense_sheet|
              expense_sheet.calculate_sick_days[:total]
            end
          end).to_s, align: :right },

          { content: @service_specifications.sum { |e| e.last.sum(&:paid_vacation_days) }.to_s, align: :right },
          { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(@service_specifications.sum do |expense_sheets|
            expense_sheets.last.sum do |expense_sheet|
              expense_sheet.calculate_paid_vacation_days[:total]
            end
          end).to_s, align: :right },

          { content: @service_specifications.sum { |e| e.last.sum(&:unpaid_vacation_days) }.to_s, align: :right },
          { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(@service_specifications.sum do |expense_sheets|
            expense_sheets.last.sum do |expense_sheet|
              expense_sheet.calculate_unpaid_vacation_days[:total]
            end
          end).to_s, align: :right },

          { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(@service_specifications.sum do |expense_sheets|
            expense_sheets.last.sum(&:driving_expenses)
          end).to_s, align: :right },

          { content: @service_specifications.sum do |e|
            e.last.sum do |expense_sheet|
              expense_sheet.work_days + expense_sheet.workfree_days +
                expense_sheet.paid_vacation_days + expense_sheet.sick_days
            end
          end.to_s, align: :right },
          { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(@service_specifications.sum do |expense_sheets|
            expense_sheets.last.sum(&:clothing_expenses)
          end).to_s, align: :right },

          { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(@service_specifications.sum do |expense_sheets|
            expense_sheets.last.sum(&:extraordinary_expenses)
          end).to_s, align: :right },

          { content: @service_specifications.sum do |e|
            e.last.sum do |expense_sheet|
              expense_sheet.work_days + expense_sheet.workfree_days +
                expense_sheet.paid_vacation_days + expense_sheet.sick_days
            end
          end.to_s, align: :right },
          { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(@service_specifications.sum do |expense_sheets|
            expense_sheets.last.sum(&:calculate_full_expenses)
          end).to_s, align: :right },
        ]
      ]

      table(
        sum, cell_style: { borders: [:top], padding: [1, 5, 1, 5] },
        header: false,
        column_widths: Pdfs::ExpensesOverview::ExpensesOverviewAdditions::COLUMN_WIDTHS,
        width: bounds.width,
      ) do
        row(0).font_style = :bold
      end
    end

    # rubocop:enable Metrics/MethodLength

    def pre_table(name)
      move_down 25
      text(name, align: :left, style: :bold, size: 11)
    end

    def table_data(expense_sheets)
      move_down 10
      table_content(expense_sheets)
    end

    def first_part(expense_sheet)
      exps_user = expense_sheet.user
      [{ content: exps_user.zdp.to_s, align: :right },
       { content: "#{exps_user.last_name} #{exps_user.first_name}" },
       {
         content: "#{I18n.l(expense_sheet.beginning,
                            format: :short)} - #{I18n.l(expense_sheet.ending, format: :short)}".to_s, align: :center
       }]
    end

    def second_part(expense_sheet)
      content = Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.calculate_work_days[:total] +
                                                          expense_sheet.calculate_first_day[:total] +
                                                          expense_sheet.calculate_last_day[:total])
      [
        { content: expense_sheet.work_days.to_s, align: :right },
        { content: content, align: :right },
        { content: expense_sheet.workfree_days.to_s, align: :right }
      ]
    end

    def third_part(expense_sheet)
      [{ content: Pdfs::ExpenseSheet::FormatHelper.to_chf(
        expense_sheet.calculate_workfree_days[:total]
      ), align: :right },
       { content: expense_sheet.sick_days.to_s, align: :right },
       { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.calculate_sick_days[:total]), align: :right },
       { content: expense_sheet.paid_vacation_days.to_s, align: :right },
       { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(
         expense_sheet.calculate_paid_vacation_days[:total]
       ), align: :right }]
    end

    def fourth_part(expense_sheet)
      [{ content: expense_sheet.unpaid_vacation_days.to_s, align: :right },
       { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.calculate_unpaid_vacation_days[:total]),
         align: :right },
       { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.driving_expenses), align: :right },
       { content: (expense_sheet.work_days + expense_sheet.workfree_days +
         expense_sheet.paid_vacation_days + expense_sheet.sick_days).to_s, align: :right }]
    end

    def fifth_part(expense_sheet)
      [
        { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.clothing_expenses), align: :right },
        { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.extraordinary_expenses), align: :right },
        { content: (expense_sheet.work_days + expense_sheet.workfree_days +
          expense_sheet.paid_vacation_days + expense_sheet.sick_days).to_s, align: :right }
      ]
    end

    def sixt_part(expense_sheet)
      [
        { content: Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.calculate_full_expenses.to_d), align: :right }
      ]
    end

    def table_content(expense_sheets)
      expense_sheets.map do |expense_sheet|
        expense_sheet.slice.values
        first_part(expense_sheet) +
          second_part(expense_sheet) +
          third_part(expense_sheet) +
          fourth_part(expense_sheet) +
          fifth_part(expense_sheet) +
          sixt_part(expense_sheet)
      end
    end
  end

  # rubocop:enable Metrics/ClassLength
end
