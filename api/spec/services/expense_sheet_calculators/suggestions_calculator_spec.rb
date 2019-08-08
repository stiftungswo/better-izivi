# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ExpenseSheetCalculators::SuggestionsCalculator, type: :service do
  let(:calculator) { ExpenseSheetCalculators::SuggestionsCalculator.new(expense_sheet) }
  let(:user) { create :user }
  let(:beginning) { Date.parse('2018-01-01') }
  let(:ending) { Date.parse('2018-01-26') }
  let!(:service) { create :service, beginning: beginning, ending: ending, user: user }
  let(:expense_sheet) { create :expense_sheet, beginning: beginning, ending: ending, user: user }

  let(:expected_work_days) { 20 }
  let(:expected_workfree_days) { 6 }

  describe '#suggested_work_days' do
    let(:day_calculator) { instance_double(DayCalculator) }

    before do
      allow(DayCalculator).to receive(:new).and_return day_calculator
      allow(day_calculator).to receive(:calculate_work_days).and_return expected_work_days
    end

    it 'delegates the correct method' do
      expect(calculator.suggested_work_days).to eq expected_work_days
      expect(day_calculator).to have_received :calculate_work_days
    end
  end

  describe '#suggested_workfree_days' do
    let(:day_calculator) { instance_double(DayCalculator) }

    before do
      allow(DayCalculator).to receive(:new).and_return day_calculator
      allow(day_calculator).to receive(:calculate_workfree_days).and_return expected_workfree_days
    end

    it 'delegates the correct method' do
      expect(calculator.suggested_workfree_days).to eq expected_workfree_days
      expect(day_calculator).to have_received :calculate_workfree_days
    end
  end

  describe '#suggested_clothing_expenses' do
    subject { calculator.suggested_clothing_expenses }

    let(:daily_expenses) { service.service_specification.work_clothing_expenses }
    let(:chargeable_days) { expense_sheet.calculate_chargeable_days }
    let(:expected_value) { daily_expenses * chargeable_days }

    context 'with only one expense sheet' do
      it { is_expected.to eq 5980 }
    end

    context 'with more than one expense sheet' do
      let(:service_range) { get_service_range months: 3 }
      let(:service) { create :service, beginning: service_range.begin, ending: service_range.end, user: user }
      let(:created_expense_sheets) { ExpenseSheetGenerator.new(service).create_expense_sheets }
      let(:expense_sheet) { created_expense_sheets.last }

      before do
        additional_expense_sheets = created_expense_sheets.length - 1
        created_expense_sheets.take(additional_expense_sheets).each do |expense_sheet|
          clothing_expenses = expense_sheet.calculate_chargeable_days * daily_expenses
          expense_sheet.update clothing_expenses: clothing_expenses
        end
      end

      context 'with enough expense_sheets to reduce clothing_expenses' do
        let(:service_range) { get_service_range months: 4 }

        it { is_expected.to eq 3300 }
      end

      context 'with enough expense_sheets to nullify clothing_expenses' do
        let(:service_range) { get_service_range months: 5 }

        it { is_expected.to eq 0 }
      end
    end
  end
end
