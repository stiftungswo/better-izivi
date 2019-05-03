# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ServiceCalculator, type: :service do
  describe '#calculate_ending_date' do
    subject { calculated_ending_day - beginning }

    let(:calculated_ending_day) { ServiceCalculator.new(beginning).calculate_ending_date(required_service_days) }
    let(:beginning) { Time.zone.today.beginning_of_week }
    let(:required_service_days) { 26 }

    context 'when service duration is between 1 and 5' do
      it 'returns correct eligible days', :aggregate_failures do
        (1..5).each do |delta|
          ending = ServiceCalculator.new(beginning).calculate_ending_date(delta)
          expect((ending - beginning).to_i).to eq(delta)
        end
      end
    end

    context 'when service duration is 6' do
      let(:required_service_days) { 6 }

      it { is_expected.to eq 8 }
    end

    context 'when service duration is between 7 and 10' do
      it_behaves_like 'adds one day to linear duration', 7..10
    end

    context 'when service duration is 11' do
      let(:required_service_days) { 11 }

      it { is_expected.to eq 11 }
    end

    context 'when service duration is 12' do
      let(:required_service_days) { 12 }

      it { is_expected.to eq 12 }
    end

    context 'when service duration is 13' do
      let(:required_service_days) { 13 }

      it { is_expected.to eq 15 }
    end

    context 'when service duration is between 14 and 17' do
      it_behaves_like 'adds one day to linear duration', 14..17
    end

    context 'when service duration is 18' do
      let(:required_service_days) { 18 }

      it { is_expected.to eq 18 }
    end

    context 'when service duration is 19' do
      let(:required_service_days) { 19 }

      it { is_expected.to eq 19 }
    end

    context 'when service duration is 20' do
      let(:required_service_days) { 20 }

      it { is_expected.to eq 22 }
    end

    context 'when service duration is between 21 and 24' do
      it_behaves_like 'adds one day to linear duration', 21..24
    end

    context 'when service duration is 25' do
      let(:required_service_days) { 25 }

      it { is_expected.to eq 25 }
    end
  end

  describe '#calculate_chargeable_service_days' do

  end
end
