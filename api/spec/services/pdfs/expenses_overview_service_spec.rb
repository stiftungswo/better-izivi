# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Pdfs::ExpensesOverviewService, type: :service do
  describe '#document' do
    let(:beginning) { Date.parse('2018-11-05') }
    let(:ending) { Date.parse('2018-11-30') }
    let(:service_specification) { create :service_specification }
    let(:first_user) { create :user, first_name: 'Alice', last_name: 'Aaronson' }
    let(:second_user) { create :user, first_name: 'Bob', last_name: 'Baxter' }
    let(:first_expense_sheet) { create :expense_sheet, beginning:, ending:, user: first_user }
    let(:second_expense_sheet) { create :expense_sheet, beginning:, ending:, user: second_user }
    let(:service_specifications) do
      {
        first_user.id => [first_expense_sheet],
        second_user.id => [second_expense_sheet]
      }
    end
    let(:filters_struct) { Struct.new(:beginning, :ending, :only_done_sheets) }
    let(:sanitized_filters) { filters_struct.new(beginning, ending, only_done_sheets) }
    let(:only_done_sheets) { 'false' }

    let(:pdf) { described_class.new(service_specifications, sanitized_filters).document.render }
    let(:pdf_text_inspector) { PDF::Inspector::Text.analyze(pdf) }
    let(:pdf_page_inspector) { PDF::Inspector::Page.analyze(pdf) }

    before do
      # Expense sheets must fall within an associated service's date range.
      create :service, beginning:, ending:, user: first_user, service_specification:, service_days: 26
      create :service, beginning:, ending:, user: second_user, service_specification:, service_days: 26
    end

    around do |spec|
      I18n.with_locale(:de) { spec.run }
    end

    it 'renders one page in A4 landscape' do
      expect(pdf_page_inspector.pages.size).to eq 1
      expect(pdf_page_inspector.pages.first[:size]).to eq [841.89, 595.28]
    end

    it 'includes the requested date range in the title and every listed user\'s name', :aggregate_failures do
      expect(pdf_text_inspector.strings).to include(
        I18n.t('pdfs.expenses_overview.title', beginning: I18n.l(beginning), ending: I18n.l(ending))
      )
      expect(pdf_text_inspector.strings).to include('Aaronson Alice', 'Baxter Bob')
    end

    it "includes each expense sheet's per-row totals from the real calculators, not hardcoded numbers" do
      expected = [first_expense_sheet, second_expense_sheet].map do |sheet|
        Pdfs::ExpenseSheet::FormatHelper.to_chf(sheet.calculate_full_expenses.to_s)
      end

      expect(pdf_text_inspector.strings).to include(*expected)
    end

    it 'includes a grand "Total" row summing across every listed expense sheet' do
      expected_total_work_days = (first_expense_sheet.work_days + second_expense_sheet.work_days).to_s

      expect(pdf_text_inspector.strings).to include('Total', expected_total_work_days)
    end

    context 'when only_done_sheets is true' do
      let(:only_done_sheets) { 'true' }

      it 'adds the "based on" disclaimer line' do
        expect(pdf_text_inspector.strings).to include(
          I18n.t('pdfs.expenses_overview.basedon', date: I18n.l(Time.zone.today))
        )
      end
    end

    context 'when only_done_sheets is not true' do
      it 'omits the "based on" disclaimer line' do
        expect(pdf_text_inspector.strings).not_to include(
          I18n.t('pdfs.expenses_overview.basedon', date: I18n.l(Time.zone.today))
        )
      end
    end

    context 'with no expense sheets at all' do
      let(:service_specifications) { {} }

      it 'still renders a single page with just the header and total row' do
        expect(pdf_page_inspector.pages.size).to eq 1
        expect(pdf_text_inspector.strings).to include('Total')
      end
    end
  end
end
