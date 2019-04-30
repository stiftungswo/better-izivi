# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Holiday, type: :model do
  it { is_expected.to validate_presence_of :beginning }
  it { is_expected.to validate_presence_of :ending }
  it { is_expected.to validate_presence_of :description }

  describe '#ending' do
    subject { holiday.tap(&:validate).errors.added? :ending, :before_beginning }

    let(:holiday) { build(:holiday, beginning: beginning, ending: ending) }
    let(:beginning) { Time.zone.today }
    let(:ending) { beginning + 2.days }

    context 'when ending is after beginning' do
      it { is_expected.to be false }
    end

    context 'when ending is at beginning' do
      let(:ending) { beginning }

      it { is_expected.to be false }
    end

    context 'when ending is before beginning' do
      let(:ending) { beginning - 2.days }

      it { is_expected.to be true }
    end
  end
end
