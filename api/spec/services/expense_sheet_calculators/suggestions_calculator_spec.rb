# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ExpenseSheetCalculators::SuggestionsCalculator, type: :service do
  let(:calculator) { described_class.new(expense_sheet) }
  let(:user) { create :user }
  let(:beginning) { Date.parse('2025-01-06') }
  let(:ending) { Date.parse('2025-01-31') }
  let!(:service) { create :service, beginning:, ending:, user: }
  let(:expense_sheet) { create :expense_sheet, beginning:, ending:, user: }

  let(:expected_work_days) { 20 }
  let(:expected_workfree_days) { 6 }

  describe '#suggestions' do
    subject { calculator.suggestions }

    let(:expected_suggestions) do
      {
        clothing_expenses: 6000,
        paid_company_holiday_days: 0,
        unpaid_clothing_expenses_days: 26,
        unpaid_company_holiday_days: 0,
        work_days: 20,
        workfree_days: 6
      }
    end

    it { is_expected.to eq expected_suggestions }
  end

  describe '#suggested_work_days' do
    let(:day_calculator) { instance_double(DayCalculator, work_days: expected_work_days) }

    before { allow(DayCalculator).to receive(:new).and_return day_calculator }

    it 'delegates the correct method', :aggregate_failures do
      expect(calculator.suggested_work_days).to eq expected_work_days
      expect(day_calculator).to have_received :work_days
    end
  end

  describe '#suggested_workfree_days' do
    let(:day_calculator) { instance_double(DayCalculator, workfree_days: expected_workfree_days) }

    before { allow(DayCalculator).to receive(:new).and_return day_calculator }

    it 'delegates the correct method', :aggregate_failures do
      expect(calculator.suggested_workfree_days).to eq expected_workfree_days
      expect(day_calculator).to have_received :workfree_days
    end
  end

  describe '#suggested_paid_company_holiday_days' do
    subject { calculator.suggested_paid_company_holiday_days }

    let(:remaining_paid_vacation_days) { 0 }
    let(:company_holiday_days) { 0 }
    let(:day_calculator) { instance_double(DayCalculator, company_holiday_days:) }

    before do
      allow(expense_sheet.service).to receive(:remaining_paid_vacation_days).and_return remaining_paid_vacation_days

      allow(DayCalculator).to receive(:new).and_return day_calculator
    end

    context 'with remaining_paid_vacation_days' do
      let(:remaining_paid_vacation_days) { 8 }

      context 'with no company holidays' do
        it { is_expected.to eq 0 }
      end

      context 'with company holidays' do
        let(:company_holiday_days) { 2 }

        it { is_expected.to eq company_holiday_days }
      end

      context 'with more company holiday days than remaining_paid_vacation_days' do
        let(:company_holiday_days) { 10 }

        it { is_expected.to eq remaining_paid_vacation_days }
      end
    end

    context 'with no remaining_paid_vacation_days' do
      context 'with no company holidays' do
        it { is_expected.to eq 0 }
      end

      context 'with company holidays' do
        let(:company_holiday_days) { 2 }

        it { is_expected.to eq 0 }
      end
    end
  end

  describe '#suggested_unpaid_company_holiday_days' do
    subject { calculator.suggested_unpaid_company_holiday_days }

    let(:remaining_paid_vacation_days) { 0 }
    let(:company_holiday_days) { 0 }
    let(:day_calculator) { instance_double(DayCalculator, company_holiday_days:) }

    before do
      allow(expense_sheet.service).to receive(:remaining_paid_vacation_days).and_return remaining_paid_vacation_days

      allow(DayCalculator).to receive(:new).and_return day_calculator
    end

    context 'with remaining_paid_vacation_days' do
      let(:remaining_paid_vacation_days) { 8 }

      context 'with no company holidays' do
        it { is_expected.to eq 0 }
      end

      context 'with company holidays' do
        let(:company_holiday_days) { 2 }

        it { is_expected.to eq 0 }
      end

      context 'with more company holiday days than remaining_paid_vacation_days' do
        let(:company_holiday_days) { 10 }

        it { is_expected.to eq 2 }
      end
    end

    context 'with no remaining_paid_vacation_days' do
      context 'with no company holidays' do
        it { is_expected.to eq 0 }
      end

      context 'with company holidays' do
        let(:company_holiday_days) { 2 }

        it { is_expected.to eq 2 }
      end
    end
  end

  describe '#suggested_clothing_expenses' do
    subject { calculator.suggested_clothing_expenses }

    let(:created_expense_sheets) { ExpenseSheetGenerator.new(service).create_expense_sheets }
    let(:expense_sheet) { created_expense_sheets.last }
    let(:chargeable_days) { created_expense_sheets.reduce(0) { |sum, sheet| sum + sheet.calculate_chargeable_days } }
    let(:total_clothing_expenses) { created_expense_sheets.reduce(0) { |sum, sheet| sum + sheet.clothing_expenses } }

    context 'with only one expense sheet' do
      it { is_expected.to eq 6000 }

      it 'has one expense sheet' do
        expect(created_expense_sheets.length).to eq 1
      end

      it 'has the expected chargeable days' do
        expect(chargeable_days).to eq 26
      end

      it 'has the expected total clothing expenses' do
        expect(total_clothing_expenses).to eq 0
      end
    end

    context 'with more than one expense sheet' do
      let(:service_range) { get_service_range months: 3 }
      let(:service) { create :service, beginning: service_range.begin, ending: service_range.end, user: }

      before do
        additional_expense_sheets = created_expense_sheets.length - 1
        created_expense_sheets.take(additional_expense_sheets).each do |expense_sheet|
          suggestions = ExpenseSheetCalculators::SuggestionsCalculator.new(expense_sheet).suggestions
          expense_sheet.update clothing_expenses: suggestions[:clothing_expenses]
        end
      end

      context 'with enough expense_sheets to reduce clothing_expenses' do
        let(:service_range) { get_service_range months: 3 }

        it { is_expected.to eq 6000 }

        it 'has the expected chargeable days' do
          expect(chargeable_days).to eq 82
        end

        it 'has the expected total clothing expenses' do
          expect(total_clothing_expenses).to eq 18_000
        end
      end

      context 'with enough expense_sheets to nullify clothing_expenses' do
        let(:service_range) { get_service_range months: 5 }

        it { is_expected.to eq 0 }

        it 'has the expected chargeable days' do
          expect(chargeable_days).to eq 138
        end

        it 'has the expected total clothing expenses' do
          expect(total_clothing_expenses).to eq 24_000
        end
      end
    end
  end

  describe '#suggested_clothing_expenses pre 2025' do
    subject { calculator.suggested_clothing_expenses }

    let(:created_expense_sheets) { ExpenseSheetGenerator.new(service).create_expense_sheets }
    let(:expense_sheet) { created_expense_sheets.last }
    let(:chargeable_days) { created_expense_sheets.reduce(0) { |sum, sheet| sum + sheet.calculate_chargeable_days } }
    let(:total_clothing_expenses) { created_expense_sheets.reduce(0) { |sum, sheet| sum + sheet.clothing_expenses } }

    let(:beginning) { Date.parse('2018-01-01') }
    let(:ending) { Date.parse('2018-01-26') }
    let(:service_specification) { create :service_specification, :pre_2025_clothing }
    let!(:service) do
      create :service, beginning:, ending:, user:, service_specification:
    end

    context 'with only one expense sheet' do
      it { is_expected.to eq 5980 }

      it 'has one expense sheet' do
        expect(created_expense_sheets.length).to eq 1
      end

      it 'has the expected chargeable days' do
        expect(chargeable_days).to eq 26
      end

      it 'has the expected total clothing expenses' do
        expect(total_clothing_expenses).to eq 0
      end
    end

    context 'with more than one expense sheet' do
      let(:service_range) { get_service_range months: 3, pre2025: true }
      let(:service) do
        create :service, beginning: service_range.begin, ending: service_range.end, user:,
                         service_specification:
      end

      before do
        additional_expense_sheets = created_expense_sheets.length - 1
        created_expense_sheets.take(additional_expense_sheets).each do |expense_sheet|
          suggestions = ExpenseSheetCalculators::SuggestionsCalculator.new(expense_sheet).suggestions
          expense_sheet.update clothing_expenses: suggestions[:clothing_expenses]
        end
      end

      context 'with enough expense_sheets to reduce clothing_expenses' do
        let(:service_range) { get_service_range months: 4, pre2025: true }

        it { is_expected.to eq 3300 }

        it 'has the expected chargeable days' do
          expect(chargeable_days).to eq 110
        end

        it 'has the expected total clothing expenses' do
          expect(total_clothing_expenses).to eq 20_700
        end
      end

      context 'with enough expense_sheets to nullify clothing_expenses' do
        let(:service_range) { get_service_range months: 5, pre2025: true }

        it { is_expected.to eq 0 }

        it 'has the expected chargeable days' do
          expect(chargeable_days).to eq 138
        end

        it 'has the expected total clothing expenses' do
          expect(total_clothing_expenses).to eq 24_000
        end
      end
    end
  end
end
