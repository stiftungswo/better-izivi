# frozen_string_literal: true

require 'prawn'

module Pdfs
  class ExpensesOverviewService
    include Prawn::View
    include Pdfs::PrawnHelper

    TABLE_HEADER = [
      {:content => I18n.t('activerecord.attributes.user.id'), :background_color => "DDDDDD", align: :center},
      {:content => I18n.t('activerecord.attributes.service_specification.name'), :background_color => "DDDDDD", align: :center},
      {:content => I18n.t('pdfs.expense_sheet.info_block.header.expense_sheet_time_duration.label'), :background_color => "DDDDDD", align: :center},
      {:content => I18n.t('activerecord.attributes.expense_sheet.work_days.other'), :colspan => 2, :background_color => "DDDDDD", align: :center},
      {:content => I18n.t('activerecord.attributes.expense_sheet.workfree'), :colspan => 2, :background_color => "DDDDDD", align: :center},
      {:content => I18n.t('activerecord.attributes.expense_sheet.sickness'), :colspan => 2,:background_color => "DDDDDD" , align: :center},
      {:content => I18n.t('activerecord.attributes.expense_sheet.paid_vacation_days.other'), :colspan => 2, :background_color => "DDDDDD", align: :center},
      {:content => I18n.t('activerecord.attributes.expense_sheet.unpaid_vacation_days.other'), :colspan => 2, :background_color => "DDDDDD", align: :center},
      {:content => I18n.t('activerecord.attributes.expense_sheet.way_expenses'), :background_color => "DDDDDD", align: :center},
      {:content => I18n.t('activerecord.attributes.expense_sheet.clothing'), :colspan => 2, :background_color => "DDDDDD", align: :center},
      {:content => I18n.t('pdfs.expense_sheet.expense_table.row_headers.extra'), :background_color => "DDDDDD", align: :center},
      {:content => I18n.t('pdfs.expense_sheet.expense_table.headers.full_amount'), :colspan => 2, :background_color => "DDDDDD", align: :right}
    ].freeze

    TABLE_SUB_HEADER = [
      {},
      {},
      {},
      {:content => "Tage", :background_color => "DDDDDD", align: :left},
      {:content => "Fr.", :background_color => "DDDDDD", align: :right},
      {:content => "Tage", :background_color => "DDDDDD", align: :left},
      {:content => "Fr.", :background_color => "DDDDDD", align: :right},
      {:content => "Tage", :background_color => "DDDDDD", align: :left},
      {:content => "Fr.", :background_color => "DDDDDD", align: :right},
      {:content => "Tage", :background_color => "DDDDDD", align: :left},
      {:content => "Fr.", :background_color => "DDDDDD", align: :right},
      {:content => "Tage", :background_color => "DDDDDD", align: :left},
      {:content => "Fr.", :background_color => "DDDDDD", align: :right},
      {:content => "Fr.", :background_color => "DDDDDD", align: :right},
      {:content => "Tage", :background_color => "DDDDDD", align: :left},
      {:content => "Fr.", :background_color => "DDDDDD", align: :right},
      {:content => "Fr.", :background_color => "DDDDDD", align: :right},
      {:content => "Tage", :background_color => "DDDDDD", align: :right},
      {:content => "Fr.", :background_color => "DDDDDD", align: :right},
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
              width: bounds.width,
              header: true,
              column_widths: [40, 80, 90, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 60, 30, 30, 30, 70]) do
          row(0).font_style = :bold
        end
        table([ ["Gesamt: ", expense_sheets.sum(&:work_days) + expense_sheets.sum(&:workfree_days), Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheets.sum(&:calculate_full_expenses).to_s)]],
              cell_style: { borders: %i[] },
              header: true,
              position: :right,
              column_widths: [30 , 30, 70]) do
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
      move_down 10
      [TABLE_HEADER, TABLE_SUB_HEADER].push(*table_content(expense_sheets))
    end

    def table_content(expense_sheets)
      expense_sheets.map do |expense_sheet|
        expense_sheet.slice().values
          .push(:content => expense_sheet.user_id.to_s, align: :right)
          .push(:content => (expense_sheet.user.last_name + " " + expense_sheet.user.first_name))
          .push(:content => (I18n.l(expense_sheet.beginning, format: :short) + " - " + I18n.l(expense_sheet.ending, format: :short)).to_s, align: :center)
          .push(:content => expense_sheet.work_days.to_s, align: :right)
          .push(:content => Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.calculate_work_days.to_s), align: :right)
          .push(:content => expense_sheet.workfree_days.to_s, align: :right)
          .push(:content => Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.calculate_workfree_days.to_s), align: :right)
          .push(:content => expense_sheet.sick_days.to_s, align: :right)
          .push(:content => Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.calculate_sick_days.to_s), align: :right)
          .push(:content => expense_sheet.paid_vacation_days.to_s, align: :right)
          .push(:content => Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.calculate_paid_vacation_days.to_s), align: :right)
          .push(:content => expense_sheet.unpaid_vacation_days.to_s, align: :right)
          .push(:content => Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.calculate_unpaid_vacation_days.to_s), align: :right)
          .push(:content => Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.driving_expenses), align: :right)
          .push(:content => (expense_sheet.work_days + expense_sheet.workfree_days).to_s, align: :right)
          .push(:content => Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.clothing_expenses), align: :right)
          .push(:content => Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.extraordinary_expenses), align: :right)
          .push(:content => (expense_sheet.work_days + expense_sheet.workfree_days).to_s, align: :right)
          .push(:content => Pdfs::ExpenseSheet::FormatHelper.to_chf(expense_sheet.calculate_full_expenses.to_d), align: :right)
      end
    end
  end
end
