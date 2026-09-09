# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserSetting, type: :model do
  describe 'validations' do
    subject(:user_setting) { build :user_setting, user: }

    let(:user) { create :user }

    it { is_expected.to validate_presence_of(:key) }

    it 'validates uniqueness of key scoped to the user' do
      create :user_setting, user:, key: user_setting.key

      expect(user_setting).not_to be_valid
      expect(user_setting.errors[:key]).to be_present
    end

    it 'allows the same key for a different user' do
      create :user_setting, key: user_setting.key

      expect(user_setting).to be_valid
    end
  end

  describe 'associations' do
    it { is_expected.to belong_to(:user) }
  end
end
