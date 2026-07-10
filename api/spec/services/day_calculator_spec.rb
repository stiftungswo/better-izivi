# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DayCalculator, type: :service do
  let(:beginning) { Date.parse('2017-11-27') }
  let(:ending) { Date.parse('2018-02-02') }
  let(:user) { create :user }
  let!(:service) { create :service, user:, beginning:, ending: }
  let(:expense_sheet) { create :expense_sheet, user:, beginning:, ending: }
  let(:day_calculator) { described_class.new(beginning, ending, service) }

  let(:create_public_holidays) do
    create :holiday, :public_holiday, beginning: '2018-01-01', ending: '2018-01-07'
    create :holiday, :public_holiday, beginning: '2018-01-20', ending: '2018-01-24'
  end
  let(:create_company_holidays) do
    create :holiday, beginning: '2018-01-01', ending: '2018-01-07'
    create :holiday, beginning: '2017-12-20', ending: '2017-12-28'
  end

  describe '#workfree_days' do
    subject { day_calculator.workfree_days }

    context 'when there are no public holidays' do
      it { is_expected.to eq 18 }
    end

    context 'when there are public holidays' do
      before { create_public_holidays }

      it { is_expected.to eq 26 }
    end
  end

  describe '#work_days' do
    subject { day_calculator.work_days }

    context 'when there are no public holidays' do
      context 'when there are no company holidays' do
        it { is_expected.to eq 50 }
      end

      context 'when there are company holidays' do
        before { create_company_holidays }

        it { is_expected.to eq 38 }
      end
    end

    context 'when there are public holidays' do
      before { create_public_holidays }

      context 'when there are no company holidays' do
        it { is_expected.to eq 42 }
      end

      context 'when there are company holidays' do
        before { create_company_holidays }

        it { is_expected.to eq 35 }
      end
    end
  end
end
